import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Agendamento } from './agendamento/entities/agendamento.entity';
import { AgendamentoModule } from './agendamento/agendamento.module';
import { UsuariosModule } from './usuarios/usuarios.module';
import { ServicosModule } from './servicos/servicos.module';
import { Servicos } from './servicos/entities/servicos.entity';
import { Usuarios } from './usuarios/entities/usuarios.entity';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: 'root',
      database: 'db_agendamentoweb',
      entities: [Agendamento, Servicos, Usuarios],
      synchronize: true,
    }),
    AgendamentoModule,
    ServicosModule,
    UsuariosModule,
    AuthModule
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
