import { Entity, Column, BaseEntity, PrimaryGeneratedColumn, OneToMany } from "typeorm"
import { UserItem } from "./UserItem";

@Entity()
export class ShopItem extends BaseEntity {
    @PrimaryGeneratedColumn()
    id!: string;

    @Column()
    name!: string

    @Column()
    description!: string

    @Column()
    rarity!: string

    @Column()
    image!: string

    @Column("float", { default: 0 })
    passive_bonus!: number

    @Column("float", { default: 0 })
    wild_bonus!: number

    @Column("float", { default: 0 })
    win_bonus!: number

    @Column("int", { nullable: true, default: 0 })
    tap_bonus!: number

    @Column("int", { nullable: true, default: 0 })
    coins_bonus!: number

    @Column("int", { nullable: true, default: 0 })
    energy_bonus!: number

    @OneToMany(() => UserItem, userItem => userItem.item)
    userItems!: UserItem[]
}

