import { IsNotEmpty } from "class-validator"
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm"
import { Agendamento } from "../../agendamento/entities/agendamento.entity"

@Entity({name: "tb_servicos"})
export class Servicos {
    @PrimaryGeneratedColumn()    
    id!: number

    @IsNotEmpty()
    @Column({ length: 100, nullable: false })
    nome!: string

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    preco!: number

    @Column()
    duracao_minutos!: number // Importante para calcular o end_time no agendamento automaticamente

    @OneToMany(() => Agendamento, (agendamento) => agendamento.servico)
    agendamentos!: Agendamento[]
}