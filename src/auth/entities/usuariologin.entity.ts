import { ApiProperty } from "@nestjs/swagger"
import { IsEmail, IsNotEmpty } from "class-validator";

export class UsuarioLogin {

  @IsEmail()
  @IsNotEmpty()
  @ApiProperty()
  email!: string;

  @IsNotEmpty()
  @ApiProperty()
  senha!: string;

}