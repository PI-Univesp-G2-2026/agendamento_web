import { IsNotEmpty, IsString, IsEmail } from "class-validator";

export class CreateUsuariosDto {
    @IsNotEmpty()
    @IsString()
    nome!: string;

    @IsNotEmpty()
    @IsEmail()
    email!: string;

    @IsNotEmpty()
    @IsString()
    senha!: string;

    @IsNotEmpty()
    @IsString()
    tipo!: string;
}
