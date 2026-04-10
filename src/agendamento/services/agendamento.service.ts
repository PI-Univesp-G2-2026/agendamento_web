import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DeleteResult, Repository } from "typeorm";
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
}
