import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Put, UseGuards } from "@nestjs/common";
import { Servicos } from "../entities/servicos.entity";
import { ServicosService } from "../services/servicos.service";
import { CreateServicosDto } from "../dto/create-servicos.dto";
import { UpdateServicosDto } from "../dto/update-servicos.dto";
import { DeleteResult } from "typeorm";
import { JwtAuthGuard } from "../../auth/guard/jwt-auth.guard";

@UseGuards(JwtAuthGuard)
@Controller("/servicos")
export class ServicosController {
  constructor(private readonly servicosService: ServicosService) { }

  @Get()
  @HttpCode(HttpStatus.OK)
  findAll(): Promise<Servicos[]> {
    return this.servicosService.findAll();
  }

  @Get('/:id')
  @HttpCode(HttpStatus.OK)
  findById(@Param('id') id: number): Promise<Servicos> {
      return this.servicosService.findById(id);
  }
  
  @Get('/nome/:nome')
  @HttpCode(HttpStatus.OK)
  findByNome(@Param('nome') nome: string): Promise<Servicos[]> {
      return this.servicosService.findByNome(nome);
  }
  
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createServicosDto: CreateServicosDto): Promise<Servicos> {
      return this.servicosService.create(createServicosDto);
  }
  
  @Put()
  @HttpCode(HttpStatus.OK)
  update(@Body() updateServicosDto: UpdateServicosDto): Promise<Servicos> {
      return this.servicosService.update(updateServicosDto);
  }
  
  @Delete('/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  delete(@Param('id') id: number): Promise<DeleteResult> {
      return this.servicosService.delete(id);
  }

}
