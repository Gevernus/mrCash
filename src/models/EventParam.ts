import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, BaseEntity } from 'typeorm';
import { Event } from './Event';

@Entity()
export class EventParam extends BaseEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    paramName!: string;

    @Column()
    paramValue!: string;

    @ManyToOne(() => Event, (event) => event.params, { onDelete: 'CASCADE' })
    event!: Event;
}
