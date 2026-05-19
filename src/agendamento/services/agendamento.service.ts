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

    async update(updateAgendamentoDto: UpdateAgendamentoDto, usuarioLogado: any): Promise<Agendamento> {
        const agendamento = await this.findById(updateAgendamentoDto.id);

        // Identifica com precisão o ID do usuário autenticado vindo do Token JWT (id ou sub)
        const idUsuarioLogado = usuarioLogado.id || usuarioLogado.sub;

        // 1. TRAVA DE MUDANÇA DE STATUS:
        if (updateAgendamentoDto.status && updateAgendamentoDto.status !== agendamento.status) {
            // Clientes nunca alteram status
            if (usuarioLogado.tipo === 'cliente') {
                throw new HttpException(
                    'Clientes não têm permissão para alterar o status de um agendamento!', 
                    HttpStatus.FORBIDDEN
                );
            }
            
            // Empreendedores só mudam o status se o serviço for deles (Tratado com coerção numérica rigorosa)
            if (usuarioLogado.tipo === 'empreendedor' && Number(agendamento.servico?.usuario?.id) !== Number(idUsuarioLogado)) {
                throw new HttpException(
                    'Você só pode alterar o status de agendamentos pertencentes aos seus próprios serviços!', 
                    HttpStatus.FORBIDDEN
                );
            }
            
            agendamento.status = updateAgendamentoDto.status;
        }

        // 2. TRAVA PARA EDIÇÃO DE OUTROS DADOS (Horário/Serviço/etc):
        // Garante coerção numérica (Number) para evitar erros de comparação entre String e Number
        const éOClienteDono = Number(agendamento.usuario?.id) === Number(idUsuarioLogado);
        const éOPrestadorDono = Number(agendamento.servico?.usuario?.id) === Number(idUsuarioLogado);

        if (!éOClienteDono && !éOPrestadorDono) {
            throw new HttpException(
                'Você não possui autorização para modificar este agendamento!', 
                HttpStatus.FORBIDDEN
            );
        }

        if (updateAgendamentoDto.start_time) {
            agendamento.start_time = new Date(updateAgendamentoDto.start_time);
        }

        if (updateAgendamentoDto.servicoId) {
            const servico = await this.servicosRepository.findOne({
                where: { id: updateAgendamentoDto.servicoId },
                relations: { usuario: true }
            });
            if (!servico) {
                throw new HttpException('Serviço não encontrado!', HttpStatus.NOT_FOUND);
            }
            
            // Segurança extra: Se for empreendedor, o novo serviço também deve ser da autoria dele
            if (usuarioLogado.tipo === 'empreendedor' && Number(servico.usuario?.id) !== Number(idUsuarioLogado)) {
                throw new HttpException('Você não pode associar um serviço de terceiros a este agendamento!', HttpStatus.FORBIDDEN);
            }

            agendamento.servico = servico;
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

    // MÉTODO DELETE ATUALIZADO COM TRATAMENTO DE COMPARADOR DE NÚMERO:
    async delete(id: number, usuarioLogado: any): Promise<DeleteResult> {
        const agendamento = await this.findById(id);
        const idUsuarioLogado = usuarioLogado.id || usuarioLogado.sub;

        const éOClienteDono = Number(agendamento.usuario?.id) === Number(idUsuarioLogado);
        const éOPrestadorDono = Number(agendamento.servico?.usuario?.id) === Number(idUsuarioLogado);

        // TRAVA DE SEGURANÇA: Só deleta/cancela quem está envolvido no agendamento
        if (!éOClienteDono && !éOPrestadorDono) {
            throw new HttpException(
                'Você não tem permissão para cancelar ou excluir este agendamento!', 
                HttpStatus.FORBIDDEN
            );
        }

        return await this.agendamentoRepository.delete(id);
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