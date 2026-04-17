import { IsNotEmpty } from "class-validator"
import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm"
import { Usuarios } from "../../usuarios/entities/usuarios.entity"
import { Servicos } from "../../servicos/entities/servicos.entity"
import { ApiProperty } from "@nestjs/swagger/dist/decorators/api-property.decorator"

@Entity({name: "tb_agendamentos"})
export class Agendamento {

    @PrimaryGeneratedColumn()
    @ApiProperty()  
    id!: number

    @IsNotEmpty()
    @Column({ type: 'timestamp', nullable: false }) // Alterado para timestamp para cálculos de data
    @ApiProperty()
    start_time!: Date

    @IsNotEmpty()
    @Column({ type: 'timestamp', nullable: false })
    @ApiProperty()
    end_time!: Date

    @IsNotEmpty()
    @Column({ default: 'pendente' }) // Definindo um valor padrão
    @ApiProperty()
    status!: string

    @CreateDateColumn() // Registra quando o agendamento foi criado
    @ApiProperty()
    created_at!: Date

    @UpdateDateColumn()
    @ApiProperty()
    updated_at!: Date

    @ApiProperty({ type: () => Usuarios })
    @ManyToOne(() => Usuarios, (usuario) => usuario.agendamentos)
    usuario!: Usuarios // O cliente que agendou
    
    @ApiProperty({ type: () => Servicos })
    @ManyToOne(() => Servicos, (servico) => servico.agendamentos)
    servico!: Servicos // O serviço escolhido
    
}