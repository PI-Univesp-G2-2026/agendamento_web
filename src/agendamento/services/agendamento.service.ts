import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Agendamento } from "../entities/agendamento.entity";

@Injectable()
export class AgendamentoService {
    constructor(
        @InjectRepository(Agendamento)
        private agendamentoRepository: Repository<Agendamento>
    ) { }

    async findAll(): Promise<Agendamento[]> {
        return await this.agendamentoRepository.find();
    }
}
