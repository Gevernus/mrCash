import { Entity, Column, BaseEntity, PrimaryGeneratedColumn } from "typeorm"

@Entity()
export class PackItem extends BaseEntity {
    @PrimaryGeneratedColumn()
    id!: string;

    @Column()
    name!: string;

    @Column({ default: "" })
    description!: string;

    @Column({ default: 80 })
    woodPercentage!: number;

    @Column({ default: 15 })
    bronzePercentage!: number;

    @Column({ default: 4 })
    silverPercentage!: number;

    @Column({ default: 1 })
    goldPercentage!: number;

    @Column({ default: 2 })
    count!: number

    @Column({ default: 'stars' })
    currency!: string

    @Column({ default: 100 })
    price!: number

    @Column()
    image!: string
}