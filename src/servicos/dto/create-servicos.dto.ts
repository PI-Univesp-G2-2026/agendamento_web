import { IsNotEmpty, IsNumber, IsString, IsPositive, IsInt } from "class-validator";

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

    @IsNotEmpty({ message: 'O ID do usuário prestador é obrigatório.' })
    @IsInt() 
    @IsPositive()
    usuarioId!: number;
}
