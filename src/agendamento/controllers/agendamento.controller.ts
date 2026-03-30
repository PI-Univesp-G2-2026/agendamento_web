import { Controller, Get, HttpCode, HttpStatus } from "@nestjs/common";
import { AgendamentoService } from "../services/agendamento.service";
import { Agendamento } from "../entities/agendamento.entity";

@Controller("/agendamentos")
export class AgendamentoController {
  constructor(private readonly agendamentoService: AgendamentoService) { }

  @Get()
  @HttpCode(HttpStatus.OK)
  findAll(): Promise<Agendamento[]> {
    return this.agendamentoService.findAll();
  }

}

