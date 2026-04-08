import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class ProfessionalsService {
  constructor(private prisma: PrismaService) {}

  // 1. CREATE: Agora protegido contra e-mails repetidos
  async createProfessional(name: string, email: string) {
    try {
      return await this.prisma.professional.create({
        data: { name, email },
      });
    } catch (error) {
      // P2002 é o código do Prisma para falha de restrição UNIQUE (Unique Constraint)
      if (error.code === 'P2002') {
        throw new ConflictException('Este e-mail já está registado.');
      }
      throw error;
    }
  }

  // 2. GET ALL: Perfeito, intocável.
  async getAllProfessionals() {
    return this.prisma.professional.findMany({
      where: { isActive: true },
    });
  }

  // 3. GET BY ID: Perfeito, intocável. Funciona como o nosso "Guarda-Costas".
  async getProfessionalById(id: number) {
    const professional = await this.prisma.professional.findFirst({
      where: { 
        id, 
        isActive: true 
      },
    });

    if (!professional) {
      throw new NotFoundException(`Profissional com ID ${id} não encontrado ou inativo.`);
    }
    
    return professional;
  }

  // 4. UPDATE: Agora impede edições em utilizadores inativos
  async updateProfessional(id: number, data: { name?: string; email?: string }) {
    // Chama o Guarda-Costas: Se não existir ou for inativo, isto lança erro e para a execução!
    await this.getProfessionalById(id);

    try {
      return await this.prisma.professional.update({
        where: { id },
        data, // data: data pode ser encurtado para apenas data
      });
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException('Este novo e-mail já está em uso por outro profissional.');
      }
      throw error;
    }
  }

  // 5. DELETE: Reaproveita a verificação para não apagar o que já está apagado
  async deleteProfessional(id: number) {
    // Chama o Guarda-Costas: Garante que o profissional existe e está ativo antes de desativar
    await this.getProfessionalById(id);

    return await this.prisma.professional.update({
      where: { id },
      data: { isActive: false },
    });
  }
}