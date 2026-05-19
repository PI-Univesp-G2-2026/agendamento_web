import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Put, UseGuards, Req } from "@nestjs/common"; // 👈 Certifique-se de que o 'Req' está importado aqui
import { Servicos } from "../entities/servicos.entity";
import { ServicosService } from "../services/servicos.service";
import { CreateServicosDto } from "../dto/create-servicos.dto";
import { UpdateServicosDto } from "../dto/update-servicos.dto";
import { DeleteResult } from "typeorm";
import { JwtAuthGuard } from "../../auth/guard/jwt-auth.guard";
import { ApiTags } from "@nestjs/swagger/dist/decorators/api-use-tags.decorator";
import { ApiBearerAuth } from "@nestjs/swagger/dist/decorators/api-bearer.decorator";

@ApiTags('Servicos')
@UseGuards(JwtAuthGuard)
@Controller("/servicos")
@ApiBearerAuth()
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
  
  // 🛠️ MÉTODO UPDATE ATUALIZADO: Passa o usuário logado para validar se ele é o dono do serviço
  @Put()
  @HttpCode(HttpStatus.OK)
  update(
    @Body() updateServicosDto: UpdateServicosDto,
    @Req() req: any // 👈 Injeta a requisição HTTP
  ): Promise<Servicos> {
      return this.servicosService.update(updateServicosDto, req.user);
  }
  
  // 🛠️ MÉTODO DELETE ATUALIZADO: Passa o usuário logado para validar a exclusão
  @Delete('/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  delete(
    @Param('id') id: number,
    @Req() req: any // 👈 Injeta a requisição HTTP
  ): Promise<DeleteResult> {
      return this.servicosService.delete(id, req.user);
  }

}