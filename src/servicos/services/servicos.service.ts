import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { ILike, Repository } from "typeorm";
import { Servicos } from "../entities/servicos.entity";
import { DeleteResult } from "typeorm/browser";

@Injectable()
export class ServicosService {
    constructor(
        @InjectRepository(Servicos)
        private servicosRepository: Repository<Servicos>
    ) { }

    async findAll(): Promise<Servicos[]> {
        return await this.servicosRepository.find();
    }


    async findById(id: number): Promise<Servicos> {
        let servicos = await this.servicosRepository.findOne({
            where: {
                id
            },
        });

        if (!servicos)
            throw new HttpException('Serviço não encontrado!', HttpStatus.NOT_FOUND);

        return servicos;
    }

    async findByUsuario(nome: string): Promise<Servicos[]> {
        return await this.servicosRepository.find({
            where: {
                nome: ILike(`%${nome}%`)
            },
        });
    }

    async create(servicos: Servicos): Promise<Servicos> {
        return await this.servicosRepository.save(servicos);
    }

    async update(servicos: Servicos): Promise<Servicos> {
        let existingService = await this.servicosRepository.findOne({
            where: {
                nome: servicos.nome
            }
        });
    
        if (existingService && existingService.id !== servicos.id) {
            throw new HttpException('Serviço já existe!', HttpStatus.BAD_REQUEST);
        }
    
        return await this.servicosRepository.save(servicos);
    }

    async delete(id: number): Promise<DeleteResult> {
        let buscarServico = await this.findById(id);
        if (!buscarServico)
            throw new HttpException('Serviço não encontrado!', HttpStatus.NOT_FOUND);

        return await this.servicosRepository.delete(id);
    }

}