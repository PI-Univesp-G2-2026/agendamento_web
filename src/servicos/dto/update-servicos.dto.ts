import { IsNotEmpty, IsNumber, IsString, IsPositive, IsOptional } from "class-validator";

export class UpdateServicosDto {
    @IsNotEmpty()
    @IsNumber()
    id!: number;

    @IsOptional()
    @IsString()
    nome?: string;

    @IsOptional()
    @IsNumber()
    @IsPositive()
    preco?: number;

    @IsOptional()
    @IsNumber()
    @IsPositive()
    duracao_minutos?: number;
}
