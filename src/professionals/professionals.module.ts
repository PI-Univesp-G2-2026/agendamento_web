import { Module } from '@nestjs/common';
import { ProfessionalsController } from './professionals.controller';
import { ProfessionalsService } from './professionals.service';
import { PrismaService } from '../prisma.service';

@Module({
  imports: [],
  controllers: [ProfessionalsController],
  providers: [ProfessionalsService, PrismaService],
})
export class ProfessionalsModule {}
