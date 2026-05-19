import { HttpException, HttpStatus, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Between, DeleteResult, Not, Repository } from "typeorm";
import { Agendamento } from "../entities/agendamento.entity";
import { Servicos } from "../../servicos/entities/servicos.entity";
import { Usuarios } from "../../usuarios/entities/usuarios.entity";
import { CreateAgendamentoDto } from "../dto/create-agendamento.dto";
import { UpdateAgendamentoDto } from "../dto/update-agendamento.dto";

@Injectable()
export class AgendamentoService {
    constructor(
        @InjectRepository(Agendamento)
        private agendamentoRepository: Repository<Agendamento>,

        @InjectRepository(Servicos)
        private servicosRepository: Repository<Servicos>,

        @InjectRepository(Usuarios)
        private usuariosRepository: Repository<Usuarios>
    ) { }

    async findAll(): Promise<Agendamento[]> {
        return await this.agendamentoRepository.find({
            relations: {
                usuario: true,
                servico: true
            }
        });
    }

    async findById(id: number): Promise<Agendamento> {
        let agendamento = await this.agendamentoRepository.findOne({
            where: {
                id
            },
            relations:{
                usuario: true,
                servico: true
            }
        });

        if (!agendamento)
            throw new HttpException('Agendamento não encontrado!', HttpStatus.NOT_FOUND);

        return agendamento;
    }

    async create(data: CreateAgendamentoDto): Promise<Agendamento> {
        const servico = await this.servicosRepository.findOne({
            where: { id: data.servicoId }
        });

        if (!servico) {
            throw new HttpException('Serviço não encontrado!', HttpStatus.NOT_FOUND);
        }

        const usuario = await this.usuariosRepository.findOne({
            where: { id: data.usuarioId }
        });

        if (!usuario) {
            throw new HttpException('Usuário não encontrado!', HttpStatus.NOT_FOUND);
        }

        const startTime = new Date(data.start_time);
        const endTime = new Date(startTime.getTime() + servico.duracao_minutos * 60000);

        const novoAgendamento = this.agendamentoRepository.create({
            start_time: startTime,
            end_time: endTime,
            status: data.status ?? 'pendente',
            usuario,
            servico
        });

        this.validateAgendamentoDates(novoAgendamento);
        await this.ensureNoTimeConflict(novoAgendamento);

        return await this.agendamentoRepository.save(novoAgendamento);
    }

    async update(updateAgendamentoDto: UpdateAgendamentoDto): Promise<Agendamento> {
        const agendamento = await this.findById(updateAgendamentoDto.id);

        if (updateAgendamentoDto.start_time) {
            agendamento.start_time = new Date(updateAgendamentoDto.start_time);
        }

        if (updateAgendamentoDto.status) {
            agendamento.status = updateAgendamentoDto.status;
        }

        if (updateAgendamentoDto.servicoId) {
            const servico = await this.servicosRepository.findOne({
                where: { id: updateAgendamentoDto.servicoId }
            });
            if (!servico) {
                throw new HttpException('Serviço não encontrado!', HttpStatus.NOT_FOUND);
            }
            agendamento.servico = servico;
            // Recalcular end_time baseado na nova duração do serviço
            agendamento.end_time = new Date(agendamento.start_time.getTime() + servico.duracao_minutos * 60000);
        }

        if (updateAgendamentoDto.usuarioId) {
            const usuario = await this.usuariosRepository.findOne({
                where: { id: updateAgendamentoDto.usuarioId }
            });
            if (!usuario) {
                throw new HttpException('Usuário não encontrado!', HttpStatus.NOT_FOUND);
            }
            agendamento.usuario = usuario;
        }

        this.validateAgendamentoDates(agendamento);
        await this.ensureNoTimeConflict(agendamento);

        return await this.agendamentoRepository.save(agendamento);
    }

    private validateAgendamentoDates(agendamento: Agendamento): void {
        if (!agendamento.start_time || !agendamento.end_time)
            throw new HttpException('Data de início e fim são obrigatórias.', HttpStatus.BAD_REQUEST);

        if (agendamento.start_time >= agendamento.end_time)
            throw new HttpException('O horário de início deve ser anterior ao horário de fim.', HttpStatus.BAD_REQUEST);
    }

    private async ensureNoTimeConflict(agendamento: Agendamento): Promise<void> {
        if (!agendamento.usuario || !agendamento.usuario.id)
            return;

        const conflict = await this.agendamentoRepository
            .createQueryBuilder('agendamento')
            .innerJoin('agendamento.usuario', 'usuario')
            .where('usuario.id = :usuarioId', { usuarioId: agendamento.usuario.id })
            .andWhere('agendamento.id != :id', { id: agendamento.id ?? 0 })
            .andWhere('agendamento.start_time < :end_time', { end_time: agendamento.end_time })
            .andWhere('agendamento.end_time > :start_time', { start_time: agendamento.start_time })
            .getOne();

        if (conflict)
            throw new HttpException('Já existe um agendamento conflituoso para este usuário neste período.', HttpStatus.BAD_REQUEST);
    }

    async delete(id: number): Promise<DeleteResult> {
        let buscarAgendamento = await this.findById(id);
        if (!buscarAgendamento)
            throw new HttpException('Agendamento não encontrado!', HttpStatus.NOT_FOUND);

        return await this.agendamentoRepository.delete(id);
    }

    async buscarHorariosDisponiveis(servicoId: number, dataValida: string) {
    // 1. Busca o serviço para saber a duração em minutos
    const servico = await this.servicosRepository.findOne({ where: { id: servicoId } });
    if (!servico) {
      throw new NotFoundException('Serviço não encontrado');
    }

    // 2. Define o início e o fim do dia selecionado para a query do MySQL
    const inicioDoDia = new Date(`${dataValida}T00:00:00Z`);
    const fimDoDia = new Date(`${dataValida}T23:59:59Z`);

    // 3. QUERY: Busca os agendamentos que já existem nesse dia e não estão cancelados
    const agendamentosOcupados = await this.agendamentoRepository.find({
      where: {
        servico: { id: servicoId },
        start_time: Between(inicioDoDia, fimDoDia),
        status: Not('cancelado'), // Ignora horários de agendamentos cancelados
      },
      order: { start_time: 'ASC' },
    });

    // 4. Cria a grade fixa de trabalho do microempreendedor (Ex: 08:00 às 18:00)
    const horarioAbertura = 8; // 08:00h
    const horarioFechamento = 18; // 18:00h
    
    const slotsDisponiveis: string[] = [];
    const tempoAtual = new Date(inicioDoDia);
    tempoAtual.setUTCHours(horarioAbertura, 0, 0, 0);

    const tempoLimite = new Date(inicioDoDia);
    tempoLimite.setUTCHours(horarioFechamento, 0, 0, 0);

    // 5. Varre o dia de trabalho de acordo com a duração do serviço
    while (tempoAtual.getTime() + servico.duracao_minutos * 60000 <= tempoLimite.getTime()) {
      const slotInicio = new Date(tempoAtual);
      const slotFim = new Date(tempoAtual.getTime() + servico.duracao_minutos * 60000);

      // Verifica se este slot colide com algum agendamento do banco de dados
      const temConflito = agendamentosOcupados.some(agendamento => {
        const agendamentoInicio = new Date(agendamento.start_time).getTime();
        const agendamentoFim = new Date(agendamento.end_time).getTime();

        // Lógica de colisão de intervalos de tempo
        return (
          slotInicio.getTime() < agendamentoFim && 
          slotFim.getTime() > agendamentoInicio
        );
      });

      // Se não houver conflito, formata a hora (HH:MM) e adiciona na lista
      if (!temConflito) {
        const horaFormatada = slotInicio.getUTCHours().toString().padStart(2, '0');
        const minutoFormatado = slotInicio.getUTCMinutes().toString().padStart(2, '0');
        slotsDisponiveis.push(`${horaFormatada}:${minutoFormatado}`);
      }

      // Avança para a próxima janela de tempo (ex: de 30 em 30 minutos ou pela duração do serviço)
      tempoAtual.setTime(tempoAtual.getTime() + servico.duracao_minutos * 60000);
    }

    return slotsDisponiveis;
  }
}


