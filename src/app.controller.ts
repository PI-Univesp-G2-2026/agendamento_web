import { Controller, Post, Get, Body } from '@nestjs/common';
import { AppService } from './app.service';

@Controller('professionals')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post() 
  async create(@Body() body: { name: string; email: string }) {
    return this.appService.createProfessional(body.name, body.email);
  }
  @Get()
  async findAll() {
  return this.appService.getAllProfessionals();
}
}
