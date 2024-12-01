import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, ManyToOne, JoinColumn } from "typeorm"
import { Skin } from "./Skin"

@Entity()
export class UserSkin extends BaseEntity {
    @PrimaryGeneratedColumn()
    id!: number

    @Column()
    user_id!: string

    @Column()
    skin_id!: number

    @ManyToOne(() => Skin, skin => skin.id)
    @JoinColumn({ name: "skin_id" })
    skin!: Skin
}