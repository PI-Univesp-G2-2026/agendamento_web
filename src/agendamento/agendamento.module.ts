import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Agendamento } from "./entities/agendamento.entity";
import { AgendamentoService } from "./services/agendamento.service";
import { AgendamentoController } from "./controllers/agendamento.controller";

@Module({
    imports: [TypeOrmModule.forFeature([Agendamento])],
    providers: [AgendamentoService],
    controllers: [AgendamentoController],
    exports: [TypeOrmModule]
})
export class AgendamentoModule {}