import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, BaseEntity } from "typeorm";
import { UserTask } from "./UserTask";

@Entity()
export class Task extends BaseEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    name!: string;

    @Column()
    description!: string;

    @Column()
    image!: string;

    @Column()
    targetAction!: string;

    @Column()
    requiredActionCount!: number;

    @Column({ default: false })
    daily!: boolean;

    @Column("int", { default: 0 })
    coins_bonus!: number

    @OneToMany(() => UserTask, userTask => userTask.task)
    userTasks!: UserTask[];
}