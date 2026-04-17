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
import { ConfigModule } from '@nestjs/config';
import { ProdService } from './data/services/prod.service';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRootAsync({
	    useClass: ProdService,
      imports: [ConfigModule],
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
