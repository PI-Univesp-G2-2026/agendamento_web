import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Agendamento } from "./entities/agendamento.entity";
import { AgendamentoService } from "./services/agendamento.service";
import { AgendamentoController } from "./controllers/agendamento.controller";
import { Servicos } from "../servicos/entities/servicos.entity";
import { Usuarios } from "../usuarios/entities/usuarios.entity";

@Module({
    imports: [TypeOrmModule.forFeature([Agendamento, Servicos, Usuarios])],
    providers: [AgendamentoService],
    controllers: [AgendamentoController],
    exports: [TypeOrmModule]
})
export class AgendamentoModule {}