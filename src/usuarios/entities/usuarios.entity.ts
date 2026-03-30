import { IsEmail, IsNotEmpty } from "class-validator"
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm"
import { Agendamento } from "../../agendamento/entities/agendamento.entity"

@Entity({name: "tb_usuarios"})
export class Usuarios {

    @PrimaryGeneratedColumn()    
    id!: number

    @IsNotEmpty()
    @Column({length: 100, nullable: false})
    nome!: string

    @IsEmail()
    @IsNotEmpty()
    @Column({length: 100, nullable: false})
    email!: string

    @IsNotEmpty()
    @Column({length: 100, nullable: false})
    senha!: string

    @Column({length: 100, nullable: false})
    tipo!: string

    @OneToMany(() => Agendamento, (agendamento) => agendamento.usuario)
    agendamentos!: Agendamento[]
}