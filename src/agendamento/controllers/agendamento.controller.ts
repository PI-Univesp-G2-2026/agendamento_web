import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Put } from "@nestjs/common";
import { AgendamentoService } from "../services/agendamento.service";
import { Agendamento } from "../entities/agendamento.entity";
import { CreateAgendamentoDto } from "../dto/create-agendamento.dto";
import { UpdateAgendamentoDto } from "../dto/update-agendamento.dto";
import { DeleteResult } from "typeorm";

@Controller("/agendamentos")
export class AgendamentoController {
  constructor(private readonly agendamentoService: AgendamentoService) { }
  

  @Get()
  @HttpCode(HttpStatus.OK)
  findAll(): Promise<Agendamento[]> {
    return this.agendamentoService.findAll();
  }

  @Get('/:id')
  @HttpCode(HttpStatus.OK)
  findById(@Param('id') id: number): Promise<Agendamento> {
      return this.agendamentoService.findById(id);
   }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createAgendamentoDto: CreateAgendamentoDto): Promise<Agendamento> {
      return this.agendamentoService.create(createAgendamentoDto);
  }

  @Put()
  @HttpCode(HttpStatus.OK)
  update(@Body() updateAgendamentoDto: UpdateAgendamentoDto): Promise<Agendamento> {
      return this.agendamentoService.update(updateAgendamentoDto);
  }

  @Delete('/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  delete(@Param('id') id: number): Promise<DeleteResult> {
      return this.agendamentoService.delete(id);
  }
}

