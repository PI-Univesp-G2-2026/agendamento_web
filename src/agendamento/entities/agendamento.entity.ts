import { IsNotEmpty } from "class-validator"
import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm"
import { Usuarios } from "../../usuarios/entities/usuarios.entity"
import { Servicos } from "../../servicos/entities/servicos.entity"

@Entity({name: "tb_agendamentos"})
export class Agendamento {

    @PrimaryGeneratedColumn()    
    id!: number

    @IsNotEmpty()
    @Column({ type: 'timestamp', nullable: false }) // Alterado para timestamp para cálculos de data
    start_time!: Date

    @IsNotEmpty()
    @Column({ type: 'timestamp', nullable: false })
    end_time!: Date

    @IsNotEmpty()
    @Column({ default: 'pendente' }) // Definindo um valor padrão
    status!: string

    @CreateDateColumn() // Registra quando o agendamento foi criado
    created_at!: Date

    @UpdateDateColumn()
    updated_at!: Date

    @ManyToOne(() => Usuarios, (usuario) => usuario.agendamentos)
    usuario!: Usuarios // O cliente que agendou

    @ManyToOne(() => Servicos, (servico) => servico.agendamentos)
    servico!: Servicos // O serviço escolhido
    
}