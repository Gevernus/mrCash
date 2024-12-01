import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, BaseEntity } from "typeorm";
import { User } from "./User";
import { Task } from "./Task";

@Entity()
export class UserTask extends BaseEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @ManyToOne(() => User, user => user.tasks)
    user!: User;

    @ManyToOne(() => Task, task => task.userTasks)
    task!: Task;

    @Column("int", { default: 0 })
    progress!: number;

    @Column({ default: false })
    completed!: boolean;

    @Column({ default: false })
    claimed!: boolean;

    @Column({ type: 'timestamp', nullable: true })
    claimedAt?: Date;
}