import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Usuarios } from "./entities/usuarios.entity";
import { UsuariosService } from "./services/usuarios.service";
import { UsuariosController } from "./controllers/usuarios.controller";

@Module({
    imports: [TypeOrmModule.forFeature([Usuarios])],
    providers: [UsuariosService],
    controllers: [UsuariosController],
    exports: [TypeOrmModule]
})
export class UsuariosModule {}