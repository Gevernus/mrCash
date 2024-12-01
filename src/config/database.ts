import { DataSourceOptions } from 'typeorm';
import { User } from '../models/User';
import { Referral } from '../models/Referral';
import { State } from '../models/State';
import dotenv from 'dotenv';
import { ShopItem } from '../models/ShopItem';
import { Monster } from '../models/Monster';
import { UserMonster } from '../models/UserMonster';
import { UserItem } from '../models/UserItem';
import { UserTask } from '../models/UserTask';
import { Task } from '../models/Task';
import { PackItem } from '../models/PackItem';
import { EventParam } from '../models/EventParam';
import { Event } from '../models/Event';
import { Skin } from '../models/Skin';
import { UserSkin } from '../models/UserSkin';

// Load environment variables from .env file
dotenv.config();

const dbConfig: DataSourceOptions = {
    type: "postgres",
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    entities: [User, Referral, State, UserItem, ShopItem, Monster, UserMonster, Task, UserTask, PackItem, Event, EventParam, Skin, UserSkin],
    synchronize: process.env.NODE_ENV !== 'production',
    logging: process.env.NODE_ENV === 'development'
};

export default dbConfig;