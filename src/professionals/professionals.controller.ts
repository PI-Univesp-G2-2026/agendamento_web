import { Controller, Post, Get, Put, Delete, Body, Param, ParseIntPipe } from '@nestjs/common';
import { ProfessionalsService } from './professionals.service';

@Controller('profissionais')
export class ProfessionalsController {
  constructor(private readonly professionalsService: ProfessionalsService) {}

  @Post() 
  async create(@Body() body: { name: string; email: string }) {
    return this.professionalsService.createProfessional(body.name, body.email);
  }

  @Get()
  async findAll() {
    return this.professionalsService.getAllProfessionals(); 
  }

  // O ParseIntPipe garante que o ID seja um número válido antes de entrar na função
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    // Como o id já chega como number, não precisamos mais do Number()
    return this.professionalsService.getProfessionalById(id);
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number, 
    @Body() body: { name?: string; email?: string }
  ) {
    return this.professionalsService.updateProfessional(id, body);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.professionalsService.deleteProfessional(id);
  }
}