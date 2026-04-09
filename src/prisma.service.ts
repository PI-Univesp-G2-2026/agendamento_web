import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  // Isto é como o @PostConstruct: corre quando o servidor liga
  async onModuleInit() {
    await this.$connect();
  }
}