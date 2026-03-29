import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Injectable()
export class AppService {

  constructor(private prisma: PrismaService) {}

  async createProfessional(name: string, email: string) {
    return this.prisma.professional.create({
      data: {
        name,
        email,
      },
    });
  }

  async getAllProfessionals() {
  return this.prisma.professional.findMany();
}

}
