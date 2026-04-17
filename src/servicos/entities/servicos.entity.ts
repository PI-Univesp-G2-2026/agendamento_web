import { IsNotEmpty } from "class-validator"
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm"
import { Agendamento } from "../../agendamento/entities/agendamento.entity"
import { ApiProperty } from "@nestjs/swagger/dist/decorators/api-property.decorator"

@Entity({name: "tb_servicos"})
export class Servicos {

    @PrimaryGeneratedColumn()
    @ApiProperty()   
    id!: number


    @IsNotEmpty()
    @Column({ length: 100, nullable: false })
    @ApiProperty()
    nome!: string

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    @ApiProperty()
    preco!: number

    @Column()
    @ApiProperty()
    duracao_minutos!: number // Importante para calcular o end_time no agendamento automaticamente

    @ApiProperty()
    @OneToMany(() => Agendamento, (agendamento) => agendamento.servico)
    agendamentos!: Agendamento[]
}