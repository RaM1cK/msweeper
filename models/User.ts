import {
    type CreationOptional,
    type InferAttributes,
    type InferCreationAttributes,
    Model,
    DataTypes, sql, type NonAttribute
} from "@sequelize/core";
import {Attribute, Default, HasMany, HasOne, PrimaryKey, Table, Unique} from "@sequelize/core/decorators-legacy";
import {UserAchievement} from "./UserAchievement.js";
import {UserStats} from "./UserStats.js";

@Table({underscored: true})
export class User extends Model<InferAttributes<User>, InferCreationAttributes<User>>{
    @PrimaryKey
    @Attribute(DataTypes.UUID)
    @Default(sql.uuidV4)
    declare id: CreationOptional<string>

    @Unique
    @Attribute(DataTypes.STRING(20))
    declare username: string

    @Attribute(DataTypes.STRING)
    declare password: string

    @HasMany(() => UserAchievement, 'userId')
    declare achievements: NonAttribute<UserAchievement[]>;

    @HasMany(() => UserStats, 'userId')
    declare stats: NonAttribute<UserStats>;
}