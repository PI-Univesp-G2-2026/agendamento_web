import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { ILike, Repository, DeleteResult } from "typeorm";
import { Usuarios } from "../entities/usuarios.entity";
import { CreateUsuariosDto } from "../dto/create-usuarios.dto";
import { UpdateUsuariosDto } from "../dto/update-usuarios.dto";
import { Bcrypt } from "../../auth/bcrypt/bcrypt";

@Injectable()
export class UsuariosService {
    constructor(
        @InjectRepository(Usuarios)
        private usuariosRepository: Repository<Usuarios>,
        private bcrypt: Bcrypt,
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

    async findByUsuario(email: string): Promise<Usuarios> {
    const usuarioEncontrado = await this.usuariosRepository.findOne({
      where: { email },
    });

    if (!usuarioEncontrado)
      throw new HttpException('Usuário não encontrado!', HttpStatus.NOT_FOUND);

    return usuarioEncontrado;
  }
    async findByNome(nome: string): Promise<Usuarios[]> {
        return await this.usuariosRepository.find({
            where: {
                nome: ILike(`%${nome}%`)
            },
        });
    }

    async create(createUsuariosDto: CreateUsuariosDto): Promise<Usuarios> {
        createUsuariosDto.senha = await this.bcrypt.criptografarSenha(createUsuariosDto.senha);
        const usuarioCriado = this.usuariosRepository.create(createUsuariosDto);
        return await this.usuariosRepository.save(usuarioCriado);
    }

    async update(updateUsuariosDto: UpdateUsuariosDto): Promise<Usuarios> {
        const usuario = await this.findById(updateUsuariosDto.id);

        if (updateUsuariosDto.nome) {
            const existingUser = await this.usuariosRepository.findOne({
                where: { nome: updateUsuariosDto.nome }
            });
            if (existingUser && existingUser.id !== updateUsuariosDto.id) {
                throw new HttpException('Usuário já existe!', HttpStatus.BAD_REQUEST);
            }
            usuario.nome = updateUsuariosDto.nome;
        }

        if (updateUsuariosDto.email) {
            usuario.email = updateUsuariosDto.email;
        }

        if (updateUsuariosDto.senha) {
            usuario.senha = await this.bcrypt.criptografarSenha(updateUsuariosDto.senha);
        }

        if (updateUsuariosDto.tipo) {
            usuario.tipo = updateUsuariosDto.tipo;
        }

        return await this.usuariosRepository.save(usuario);
    }

    async delete(id: number): Promise<DeleteResult> {
        await this.findById(id);
        return await this.usuariosRepository.delete(id);
    }

}