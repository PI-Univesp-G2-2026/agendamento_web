import { IsNotEmpty, IsString, IsEmail, IsOptional, IsNumber } from "class-validator";

export class UpdateUsuariosDto {
    @IsNotEmpty()
    @IsNumber()
    id!: number;

    @IsOptional()
    @IsString()
    nome?: string;

    @IsOptional()
    @IsEmail()
    email?: string;

    @IsOptional()
    @IsString()
    senha?: string;

    @IsOptional()
    @IsString()
    tipo?: string;
}
