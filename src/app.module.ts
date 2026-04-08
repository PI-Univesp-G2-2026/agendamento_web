import { Module } from '@nestjs/common';
import { ProfessionalsModule } from './professionals/professionals.module';

@Module({
  imports: [ProfessionalsModule], 
  controllers: [],
  providers: [],
})
export class AppModule {}