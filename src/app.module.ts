import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Agendamento } from './agendamento/entities/agendamento.entity';
import { AgendamentoModule } from './agendamento/agendamento.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: 'root',
      database: 'db_agendamentoweb',
      entities: [Agendamento],
      synchronize: true,
    }),
    AgendamentoModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
