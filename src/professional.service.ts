import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { Professional } from '@prisma/client';

@Injectable()
export class ProfessionalService {
  constructor(private prisma: PrismaService) {}

  // Método para criar um novo prestador (o teu "save")
  async createProfessional(data: { name: string; email: string }): Promise<Professional> {
    return this.prisma.professional.create({
      data,
    });
  }

  // Método para listar todos (o teu "findAll")
  async getAll(): Promise<Professional[]> {
    return this.prisma.professional.findMany();
  }
}