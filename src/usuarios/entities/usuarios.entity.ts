import { IsEmail, IsNotEmpty } from "class-validator"
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm"
import { Agendamento } from "../../agendamento/entities/agendamento.entity"
import { ApiProperty } from "@nestjs/swagger/dist/decorators/api-property.decorator"
import { Servicos } from "../../servicos/entities/servicos.entity"

@Entity({name: "tb_usuarios"})
export class Usuarios {

    @PrimaryGeneratedColumn()
    @ApiProperty()   
    id!: number

    @IsNotEmpty()
    @Column({length: 100, nullable: false})
    @ApiProperty()
    nome!: string

    @IsEmail()
    @IsNotEmpty()
    @Column({length: 100, nullable: false})
    @ApiProperty({example: "email@email.com.br"})
    email!: string

    @IsNotEmpty()
    @Column({length: 100, nullable: false})
    @ApiProperty()
    senha!: string

    @Column({length: 100, nullable: false})
    @ApiProperty()
    tipo!: string

    @ApiProperty()
    @OneToMany(() => Agendamento, (agendamento) => agendamento.usuario)
    agendamentos!: Agendamento[]

    @ApiProperty({ type: () => Servicos, isArray: true })
    @OneToMany(() => Servicos, (servico) => servico.usuario) 
    servicos!: Servicos[];
}