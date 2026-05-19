import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { ILike, Repository, DeleteResult } from "typeorm";
import { Servicos } from "../entities/servicos.entity";
import { Usuarios } from "../../usuarios/entities/usuarios.entity"; // 👇 Importe a entidade de Usuários
import { CreateServicosDto } from "../dto/create-servicos.dto";
import { UpdateServicosDto } from "../dto/update-servicos.dto";

@Injectable()
export class ServicosService {
    constructor(
        @InjectRepository(Servicos)
        private servicosRepository: Repository<Servicos>,

        // 👇 ADICIONE O REPOSITÓRIO DE USUÁRIOS AQUI NO CONSTRUTOR:
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

    // 🛠️ MÉTODO CREATE CORRIGIDO E AMARRADO:
    async create(createServicosDto: CreateServicosDto): Promise<Servicos> {
        // 1. Busca a entidade do profissional usando o usuarioId enviado pelo React
        const usuario = await this.usuariosRepository.findOne({
            where: { id: createServicosDto.usuarioId }
        });

        // 2. Se o usuário não existir, barra a operação
        if (!usuario) {
            throw new HttpException('Profissional prestador não encontrado!', HttpStatus.NOT_FOUND);
        }

        // 3. Cria o objeto acoplando a entidade Usuarios inteira, não só o ID solto
        const novoServico = this.servicosRepository.create({
            nome: createServicosDto.nome,
            preco: createServicosDto.preco,
            duracao_minutos: createServicosDto.duracao_minutos,
            usuario: usuario 
        });

        return await this.servicosRepository.save(novoServico);
    }

    async update(updateServicosDto: UpdateServicosDto): Promise<Servicos> {
        const servico = await this.findById(updateServicosDto.id);

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

    async delete(id: number): Promise<DeleteResult> {
        await this.findById(id);
        return await this.servicosRepository.delete(id);
    }
}