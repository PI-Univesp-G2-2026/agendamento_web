import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Usuarios } from "../entities/usuarios.entity";

@Injectable()
export class UsuariosService {
    constructor(
        @InjectRepository(Usuarios)
        private usuariosRepository: Repository<Usuarios>
    ) { }

    async findAll(): Promise<Usuarios[]> {
        return await this.usuariosRepository.find();
    }
}
