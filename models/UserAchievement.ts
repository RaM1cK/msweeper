import {DataTypes, type InferAttributes, type InferCreationAttributes, Model} from "@sequelize/core";
import {Attribute, NotNull, PrimaryKey, Table} from "@sequelize/core/decorators-legacy";

@Table({
    underscored: true,
    updatedAt: false
})
export class UserAchievement extends Model<InferAttributes<UserAchievement>, InferCreationAttributes<UserAchievement>>{
    @Attribute(DataTypes.UUID)
    @PrimaryKey
    declare userId: string;

    @Attribute(DataTypes.STRING)
    @PrimaryKey
    declare achievementId: string;
}