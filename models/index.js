import { Sequelize } from '@sequelize/core'
import { PostgresDialect } from '@sequelize/postgres'
import dotenv from "dotenv";
import {User} from "./User.ts";
import {UserAchievement} from "./UserAchievement.ts";
import {UserStats} from "./UserStats.ts";

dotenv.config();

const env = process.env;

const sequelize = new Sequelize({
    dialect: PostgresDialect,
    database: env.DB_NAME,
    user: env.DB_USER,
    password: env.DB_PASSWORD,
    host: env.DB_HOST,
    port: 5432,
    logging: console.log,
    models: [User, UserAchievement, UserStats]
})

export default sequelize;