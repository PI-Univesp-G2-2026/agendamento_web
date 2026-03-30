import { Controller, Get, HttpCode, HttpStatus } from "@nestjs/common";
import { Servicos } from "../entities/servicos.entity";
import { ServicosService } from "../services/servicos.service";

@Controller("/servicos")
export class ServicosController {
  constructor(private readonly servicosService: ServicosService) { }

  @Get()
  @HttpCode(HttpStatus.OK)
  findAll(): Promise<Servicos[]> {
    return this.servicosService.findAll();
  }

}
