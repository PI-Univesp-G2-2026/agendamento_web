import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Put, Query, UseGuards, Req } from "@nestjs/common"; // 👈 Certifique-se de que o 'Req' foi adicionado aqui nos imports do @nestjs/common
import { AgendamentoService } from "../services/agendamento.service";
import { Agendamento } from "../entities/agendamento.entity";
import { CreateAgendamentoDto } from "../dto/create-agendamento.dto";
import { UpdateAgendamentoDto } from "../dto/update-agendamento.dto";
import { DeleteResult } from "typeorm";
import { JwtAuthGuard } from "../../auth/guard/jwt-auth.guard";
import { ApiTags } from "@nestjs/swagger/dist/decorators/api-use-tags.decorator";
import { ApiBearerAuth } from "@nestjs/swagger/dist/decorators/api-bearer.decorator";

@ApiTags('Agendamento')
@UseGuards(JwtAuthGuard)
@Controller("/agendamentos")
@ApiBearerAuth()
export class AgendamentoController {
  constructor(private readonly agendamentoService: AgendamentoService) { }

  @Get('disponibilidade')
  async pegarDisponibilidade(
    @Query('servicoId') servicoId: number,
    @Query('data') data: string, // Espera o formato YYYY-MM-DD
  ) {
    return this.agendamentoService.buscarHorariosDisponiveis(Number(servicoId), data);
  }

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

  
  @Put('/:id') 
  @HttpCode(HttpStatus.OK)
  update(
    @Param('id') id: number, 
    @Body() updateAgendamentoDto: UpdateAgendamentoDto,
    @Req() req: any 
  ): Promise<Agendamento> {

    updateAgendamentoDto.id = Number(id);
      
      // Envia para o Service rodar a validação de posse (ownership) por tipo de usuário
      return this.agendamentoService.update(updateAgendamentoDto, req.user);
  }

  @Delete('/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  delete(@Param('id') id: number, @Req() req: any): Promise<DeleteResult> {
      return this.agendamentoService.delete(id, req.user);
  }
}