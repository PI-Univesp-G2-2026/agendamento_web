import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Servicos } from "../entities/servicos.entity";

@Injectable()
export class ServicosService {
    constructor(
        @InjectRepository(Servicos)
        private servicosRepository: Repository<Servicos>
    ) { }

    async findAll(): Promise<Servicos[]> {
        return await this.servicosRepository.find();
    }
}
