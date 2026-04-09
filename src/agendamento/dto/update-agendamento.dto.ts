import { IsInt, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class UpdateAgendamentoDto {
    @IsInt()
    @IsNotEmpty()
    id!: number;

    @IsInt()
    @IsOptional()
    servicoId?: number;

    @IsInt()
    @IsOptional()
    usuarioId?: number;

    @IsOptional()
    @IsString()
    start_time?: string;

    @IsOptional()
    @IsString()
    status?: string;
}
