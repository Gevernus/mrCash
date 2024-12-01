import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, OneToMany } from "typeorm"
import { UserMonster } from "./UserMonster"

@Entity()
export class Monster extends BaseEntity {
    @PrimaryGeneratedColumn()
    id!: number

    @Column()
    name!: string

    @Column()
    type!: string

    @Column()
    description!: string

    @Column()
    rarity!: string

    @Column()
    effect!: string

    @Column()
    image!: string

    @OneToMany(() => UserMonster, userMonster => userMonster.monster)
    userMonsters!: UserMonster[]
}