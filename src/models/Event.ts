import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany, BaseEntity } from 'typeorm';
import { EventParam } from './EventParam';

@Entity()
export class Event extends BaseEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    eventName!: string;

    @CreateDateColumn()
    eventTime!: Date;

    @Column({ nullable: true })
    userId!: string;

    @OneToMany(() => EventParam, (eventParam) => eventParam.event, { cascade: true })
    params!: EventParam[];
}
