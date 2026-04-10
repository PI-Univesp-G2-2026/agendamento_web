import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Put, UseGuards } from "@nestjs/common";
import { Usuarios } from "../entities/usuarios.entity";
import { UsuariosService } from "../services/usuarios.service";
import { CreateUsuariosDto } from "../dto/create-usuarios.dto";
import { UpdateUsuariosDto } from "../dto/update-usuarios.dto";
import { DeleteResult } from "typeorm";
import { JwtAuthGuard } from "../../auth/guard/jwt-auth.guard";

@Controller("/usuarios")
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) { }
    @UseGuards(JwtAuthGuard)
    @Get()
    @HttpCode(HttpStatus.OK)
    findAll(): Promise<Usuarios[]> {
        return this.usuariosService.findAll();
    }

    @UseGuards(JwtAuthGuard)
    @Get('/:id')
    @HttpCode(HttpStatus.OK)
    findById(@Param('id') id: number): Promise<Usuarios> {
        return this.usuariosService.findById(id);
    }

    @UseGuards(JwtAuthGuard)
    @Get('/nome/:nome')
    @HttpCode(HttpStatus.OK)
    findByNome(@Param('nome') nome: string): Promise<Usuarios[]> {
        return this.usuariosService.findByNome(nome);
    }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    create(@Body() createUsuariosDto: CreateUsuariosDto): Promise<Usuarios> {
        return this.usuariosService.create(createUsuariosDto);
    }

    @UseGuards(JwtAuthGuard)
    @Put()
    @HttpCode(HttpStatus.OK)
    update(@Body() updateUsuariosDto: UpdateUsuariosDto): Promise<Usuarios> {
        return this.usuariosService.update(updateUsuariosDto);
    }

    @UseGuards(JwtAuthGuard)
    @Delete('/:id')
    @HttpCode(HttpStatus.NO_CONTENT)
    delete(@Param('id') id: number): Promise<DeleteResult> {
        return this.usuariosService.delete(id);
    }

}

