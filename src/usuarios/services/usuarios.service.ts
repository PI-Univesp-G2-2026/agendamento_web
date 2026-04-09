import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { ILike, Repository } from "typeorm";
import { Usuarios } from "../entities/usuarios.entity";
import { DeleteResult } from "typeorm/browser";

@Injectable()
export class UsuariosService {
    constructor(
        @InjectRepository(Usuarios)
        private usuariosRepository: Repository<Usuarios>
    ) { }

    async findAll(): Promise<Usuarios[]> {
        return await this.usuariosRepository.find();
    }


    async findById(id: number): Promise<Usuarios> {
        let usuarios = await this.usuariosRepository.findOne({
            where: {
                id
            },
        });

        if (!usuarios)
            throw new HttpException('Usuário não encontrado!', HttpStatus.NOT_FOUND);

        return usuarios;
    }

    async findByUsuario(nome: string): Promise<Usuarios[]> {
        return await this.usuariosRepository.find({
            where: {
                nome: ILike(`%${nome}%`)
            },
        });
    }

    async create(usuarios: Usuarios): Promise<Usuarios> {
        return await this.usuariosRepository.save(usuarios);
    }

    async update(usuarios: Usuarios): Promise<Usuarios> {
        let existingUser = await this.usuariosRepository.findOne({
            where: {
                nome: usuarios.nome
            }
        });
    
        if (existingUser && existingUser.id !== usuarios.id) {
            throw new HttpException('Usuário já existe!', HttpStatus.BAD_REQUEST);
        }
    
        return await this.usuariosRepository.save(usuarios);
    }

    async delete(id: number): Promise<DeleteResult> {
        let buscarUsuario = await this.findById(id);
        if (!buscarUsuario)
            throw new HttpException('Usuário não encontrado!', HttpStatus.NOT_FOUND);

        return await this.usuariosRepository.delete(id);
    }

}