import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Servicos } from "./entities/servicos.entity";
import { ServicosService } from "./services/servicos.service";
import { ServicosController } from "./controllers/servicos.controller";
import { Usuarios } from "../usuarios/entities/usuarios.entity";

@Module({
    imports: [TypeOrmModule.forFeature([Servicos, Usuarios])],
    providers: [ServicosService],
    controllers: [ServicosController],
    exports: [ServicosService, TypeOrmModule]
})
export class ServicosModule {}