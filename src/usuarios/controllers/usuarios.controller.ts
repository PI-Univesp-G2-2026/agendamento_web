import { Controller, Get, HttpCode, HttpStatus } from "@nestjs/common";
import { Usuarios } from "../entities/usuarios.entity";
import { UsuariosService } from "../services/usuarios.service";

@Controller("/usuarios")
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) { }

  @Get()
  @HttpCode(HttpStatus.OK)
  findAll(): Promise<Usuarios[]> {
    return this.usuariosService.findAll();
  }

}
