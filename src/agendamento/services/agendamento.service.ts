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
                servico: {
                    usuario: true
                }
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
                servico: {
                    usuario: true
                }
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

    // 🛠️ MÉTODO UPDATE ATUALIZADO COM A TRAVA DE SEGURANÇA POR TIPO DE USUÁRIO:
    async update(updateAgendamentoDto: UpdateAgendamentoDto, usuarioLogado: any): Promise<Agendamento> {
        const agendamento = await this.findById(updateAgendamentoDto.id);

        // 🔒 TRAVA DE SEGURANÇA: Se houver tentativa de mudar o status e quem pediu for 'cliente', barra o processo.
        if (updateAgendamentoDto.status && updateAgendamentoDto.status !== agendamento.status) {
            if (usuarioLogado.tipo === 'cliente') {
                throw new HttpException(
                    'Clientes não têm permissão para alterar o status de um agendamento!', 
                    HttpStatus.FORBIDDEN
                );
            }
            agendamento.status = updateAgendamentoDto.status;
        }

        if (updateAgendamentoDto.start_time) {
            agendamento.start_time = new Date(updateAgendamentoDto.start_time);
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
        const servico = await this.servicosRepository.findOne({ where: { id: servicoId } });
        if (!servico) {
            throw new NotFoundException('Serviço não encontrado');
        }

        const inicioDoDia = new Date(`${dataValida}T00:00:00.000Z`);
        const fimDoDia = new Date(`${dataValida}T23:59:59.999Z`);

        const agendamentosOcupados = await this.agendamentoRepository.find({
            where: {
                servico: { id: servicoId }, 
                start_time: Between(inicioDoDia, fimDoDia),
                status: Not('cancelado'), 
            },
        });

        const horarioAbertura = 8; 
        const horarioFechamento = 18; 
        
        const slotsDisponiveis: string[] = [];
        
        const tempoAtual = new Date(`${dataValida}T00:00:00.000Z`);
        tempoAtual.setUTCHours(horarioAbertura, 0, 0, 0);

        const tempoLimite = new Date(`${dataValida}T00:00:00.000Z`);
        tempoLimite.setUTCHours(horarioFechamento, 0, 0, 0);

        while (tempoAtual.getTime() + servico.duracao_minutos * 60000 <= tempoLimite.getTime()) {
            const slotInicio = new Date(tempoAtual.getTime());
            const slotFim = new Date(tempoAtual.getTime() + servico.duracao_minutos * 60000);

            const temConflito = agendamentosOcupados.some(agendamento => {
                const agendamentoInicio = new Date(agendamento.start_time).getTime();
                const agendamentoFim = new Date(agendamento.end_time).getTime();

                return (
                    slotInicio.getTime() < agendamentoFim && 
                    slotFim.getTime() > agendamentoInicio
                );
            });

            if (!temConflito) {
                const horaFormatada = slotInicio.getUTCHours().toString().padStart(2, '0');
                const minutoFormatado = slotInicio.getUTCMinutes().toString().padStart(2, '0');
                slotsDisponiveis.push(`${horaFormatada}:${minutoFormatado}`);
            }

            tempoAtual.setTime(tempoAtual.getTime() + servico.duracao_minutos * 60000);
        }

        return slotsDisponiveis;
    }
}