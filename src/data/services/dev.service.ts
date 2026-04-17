import { Injectable } from "@nestjs/common";
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from "@nestjs/typeorm";
import { Agendamento } from "../../agendamento/entities/agendamento.entity";
import { Servicos } from "../../servicos/entities/servicos.entity";
import { Usuarios } from "../../usuarios/entities/usuarios.entity";

@Injectable()
export class DevService implements TypeOrmOptionsFactory {

    createTypeOrmOptions(): TypeOrmModuleOptions {
        return {
            type: 'mysql',
            host: 'localhost',
            port: 3306,
            username: 'root',
            password: 'root',
            database: 'db_agendamentoweb',
            entities: [Agendamento, Servicos, Usuarios],
            synchronize: true,
    };
  }
}