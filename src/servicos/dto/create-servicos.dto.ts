import { IsNotEmpty, IsNumber, IsString, IsPositive } from "class-validator";

export class CreateServicosDto {
    @IsNotEmpty()
    @IsString()
    nome!: string;

    @IsNotEmpty()
    @IsNumber()
    @IsPositive()
    preco!: number;

    @IsNotEmpty()
    @IsNumber()
    @IsPositive()
    duracao_minutos!: number;
}
