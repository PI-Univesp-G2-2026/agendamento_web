import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { ILike, Repository, DeleteResult } from "typeorm";
import { Servicos } from "../entities/servicos.entity";
import { CreateServicosDto } from "../dto/create-servicos.dto";
import { UpdateServicosDto } from "../dto/update-servicos.dto";

@Injectable()
export class ServicosService {
    constructor(
        @InjectRepository(Servicos)
        private servicosRepository: Repository<Servicos>
    ) { }

    async findAll(): Promise<Servicos[]> {
        return await this.servicosRepository.find({
            relations: { usuario: true },
        });
    }


    async findById(id: number): Promise<Servicos> {
        let servicos = await this.servicosRepository.findOne({
            where: {
                id
            },
            relations: { usuario: true },
        });

        if (!servicos)
            throw new HttpException('Serviço não encontrado!', HttpStatus.NOT_FOUND);

        return servicos;
    }

    async findByNome(nome: string): Promise<Servicos[]> {
        return await this.servicosRepository.find({
            where: {
                nome: ILike(`%${nome}%`)
            },
            relations: { usuario: true },
        });
    }

    async create(createServicosDto: CreateServicosDto): Promise<Servicos> {
        const servicoCriado = this.servicosRepository.create(createServicosDto);
        return await this.servicosRepository.save(servicoCriado);
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