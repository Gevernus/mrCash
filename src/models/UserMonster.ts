import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, ManyToOne, JoinColumn } from "typeorm"
import { Monster } from "./Monster"

@Entity()
export class UserMonster extends BaseEntity {
    @PrimaryGeneratedColumn()
    id!: number

    @Column()
    user_id!: string

    @Column()
    monster_id!: number

    @Column()
    level!: number

    @ManyToOne(() => Monster, monster => monster.userMonsters)
    @JoinColumn({ name: "monster_id" })
    monster!: Monster
}