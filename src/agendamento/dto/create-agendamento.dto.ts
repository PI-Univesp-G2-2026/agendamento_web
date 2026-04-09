import { IsInt, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateAgendamentoDto {
    @IsInt()
    servicoId!: number;

    @IsInt()
    usuarioId!: number;

    @IsNotEmpty()
    @IsString()
    start_time!: string;

    @IsOptional()
    @IsString()
    status?: string;
}
