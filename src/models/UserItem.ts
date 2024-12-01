import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, ManyToOne, JoinColumn } from "typeorm"
import { ShopItem } from "./ShopItem"

@Entity()
export class UserItem extends BaseEntity {
    @PrimaryGeneratedColumn()
    id!: number

    @Column()
    user_id!: string

    @Column()
    item_id!: string

    @ManyToOne(() => ShopItem, item => item.id)
    @JoinColumn({ name: "item_id" })
    item!: ShopItem
}