import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Put } from "@nestjs/common";
import { Usuarios } from "../entities/usuarios.entity";
import { UsuariosService } from "../services/usuarios.service";
import { DeleteResult } from "typeorm";

@Controller("/usuarios")
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) { }
  
    @Get()
    @HttpCode(HttpStatus.OK)
    findAll(): Promise<Usuarios[]> {
        return this.usuariosService.findAll();
    }

    @Get('/:id')
    @HttpCode(HttpStatus.OK)
    findById(@Param('id') id: number): Promise<Usuarios> {
        return this.usuariosService.findById(id);
    }

    @Get('/nome/:nome')
    @HttpCode(HttpStatus.OK)
    findBynome(@Param('nome') nome: string): Promise<Usuarios[]> {
        return this.usuariosService.findByUsuario(nome);
    }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    create(@Body() usuarios: Usuarios): Promise<Usuarios> {
        return this.usuariosService.create(usuarios);
    }

    @Put()
    @HttpCode(HttpStatus.OK)
    update(@Body() usuarios: Usuarios): Promise<Usuarios> {
        return this.usuariosService.update(usuarios);
    }

    @Delete('/:id')
    @HttpCode(HttpStatus.NO_CONTENT)
    delete(@Param('id') id: number): Promise<DeleteResult> {
        return this.usuariosService.delete(id);
    }

}

