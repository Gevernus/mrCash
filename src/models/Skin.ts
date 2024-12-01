import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, OneToMany } from "typeorm"
import { UserSkin } from "./UserSkin"

@Entity()
export class Skin extends BaseEntity {
    @PrimaryGeneratedColumn()
    id!: number

    @Column()
    name!: string

    @Column()
    type!: string

    @Column()
    price!: number

    @Column({ default: "coins" })
    currency!: string

    @Column()
    image!: string

    @OneToMany(() => UserSkin, userSkin => userSkin.skin)
    userSkins!: UserSkin[]
}