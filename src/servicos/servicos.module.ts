import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Servicos } from "./entities/servicos.entity";
import { ServicosService } from "./services/servicos.service";
import { ServicosController } from "./controllers/servicos.controller";

@Module({
    imports: [TypeOrmModule.forFeature([Servicos])],
    providers: [ServicosService],
    controllers: [ServicosController],
    exports: [TypeOrmModule]
})
export class ServicosModule {}