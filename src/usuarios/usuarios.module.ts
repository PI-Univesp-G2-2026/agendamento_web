import { Module, forwardRef } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Usuarios } from "./entities/usuarios.entity";
import { UsuariosService } from "./services/usuarios.service";
import { UsuariosController } from "./controllers/usuarios.controller";
import { AuthModule } from "../auth/auth.module";

@Module({
    imports: [TypeOrmModule.forFeature([Usuarios]), forwardRef(() => AuthModule)],
    providers: [UsuariosService],
    controllers: [UsuariosController],
    exports: [TypeOrmModule, UsuariosService]
})
export class UsuariosModule {}