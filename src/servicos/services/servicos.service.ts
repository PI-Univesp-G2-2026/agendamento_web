import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { ILike, Repository, DeleteResult } from "typeorm";
import { Servicos } from "../entities/servicos.entity";
import { Usuarios } from "../../usuarios/entities/usuarios.entity"; 
import { CreateServicosDto } from "../dto/create-servicos.dto";
import { UpdateServicosDto } from "../dto/update-servicos.dto";

@Injectable()
export class ServicosService {
    constructor(
        @InjectRepository(Servicos)
        private servicosRepository: Repository<Servicos>,

        @InjectRepository(Usuarios)
        private usuariosRepository: Repository<Usuarios>
    ) { }

    async findAll(): Promise<Servicos[]> {
        return await this.servicosRepository.find({
            relations: { usuario: true },
        });
    }

    async findById(id: number): Promise<Servicos> {
        let servicos = await this.servicosRepository.findOne({
            where: { id },
            relations: { usuario: true },
        });

        if (!servicos)
            throw new HttpException('Serviço não encontrado!', HttpStatus.NOT_FOUND);

        return servicos;
    }

    async findByNome(nome: string): Promise<Servicos[]> {
        return await this.servicosRepository.find({
            where: { nome: ILike(`%${nome}%`) },
            relations: { usuario: true },
        });
    }

    async create(createServicosDto: CreateServicosDto): Promise<Servicos> {
        const usuario = await this.usuariosRepository.findOne({
            where: { id: createServicosDto.usuarioId }
        });

        if (!usuario) {
            throw new HttpException('Profissional prestador não encontrado!', HttpStatus.NOT_FOUND);
        }

        const novoServico = this.servicosRepository.create({
            nome: createServicosDto.nome,
            preco: createServicosDto.preco,
            duracao_minutos: createServicosDto.duracao_minutos,
            usuario: usuario 
        });

        return await this.servicosRepository.save(novoServico);
    }

    async update(updateServicosDto: UpdateServicosDto, usuarioLogado: any): Promise<Servicos> {
        const servico = await this.findById(updateServicosDto.id);

        // Captura a credencial do token (e-mail)
        const credencialToken = usuarioLogado?.id || usuarioLogado?.sub || usuarioLogado?.email;
        let idUsuarioLogado: number = 0;

        // Se o token entregar o e-mail, busca o id numérico correspondente no banco
        if (credencialToken && typeof credencialToken === 'string' && credencialToken.includes('@')) {
            const usuarioDoBanco = await this.usuariosRepository.findOne({
                where: { email: credencialToken } 
            });
            if (usuarioDoBanco) {
                idUsuarioLogado = usuarioDoBanco.id;
            }
        } else {
            idUsuarioLogado = Number(credencialToken);
        }

        if (!servico.usuario || Number(servico.usuario.id) !== Number(idUsuarioLogado)) {
            throw new HttpException(
                'Você não tem permissão para alterar um serviço que não pertence ao seu catálogo!', 
                HttpStatus.FORBIDDEN
            );
        }

        if (updateServicosDto.nome) {
            const existingService = await this.servicosRepository.findOne({
                where: { nome: updateServicosDto.nome }
            });
            if (existingService && existingService.id !== updateServicosDto.id) {
                throw new HttpException('Serviço já existe!', HttpStatus.BAD_REQUEST);
            }
            servico.nome = updateServicosDto.nome;
        }

        if (updateServicosDto.preco !== undefined) {
            servico.preco = updateServicosDto.preco;
        }

        if (updateServicosDto.duracao_minutos !== undefined) {
            servico.duracao_minutos = updateServicosDto.duracao_minutos;
        }

        return await this.servicosRepository.save(servico);
    }

    async delete(id: number, usuarioLogado: any): Promise<DeleteResult> {
        const servico = await this.findById(id);
        
        // Captura a credencial do token (e-mail)
        const credencialToken = usuarioLogado?.id || usuarioLogado?.sub || usuarioLogado?.email;
        let idUsuarioLogado: number = 0;

        if (credencialToken && typeof credencialToken === 'string' && credencialToken.includes('@')) {
            const usuarioDoBanco = await this.usuariosRepository.findOne({
                where: { email: credencialToken } 
            });
            if (usuarioDoBanco) {
                idUsuarioLogado = usuarioDoBanco.id;
            }
        } else {
            idUsuarioLogado = Number(credencialToken);
        }

        if (!servico.usuario || Number(servico.usuario.id) !== Number(idUsuarioLogado)) {
            throw new HttpException(
                'Você não tem permissão para excluir um serviço que não pertence ao seu catálogo!', 
                HttpStatus.FORBIDDEN
            );
        }

        return await this.servicosRepository.delete(id);
    }
}