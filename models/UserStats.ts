import {DataTypes, type InferAttributes, type InferCreationAttributes, Model} from "@sequelize/core";
import {AllowNull, Attribute, Default, NotNull, PrimaryKey, Table} from "@sequelize/core/decorators-legacy";

@Table({
    underscored: true,
    timestamps: false
})
export class UserStats extends Model<InferAttributes<UserStats>, InferCreationAttributes<UserStats>>{
    @Attribute(DataTypes.UUID)
    @PrimaryKey
    declare userId: string;

    @Attribute(DataTypes.STRING)
    @PrimaryKey
    declare difficulty: string;

    @Attribute(DataTypes.INTEGER)
    @Default(0)
    declare played: number;

    @Attribute(DataTypes.INTEGER)
    @Default(0)
    declare won: number;

    @Attribute(DataTypes.FLOAT)
    @AllowNull
    declare bestTime: number | null;

    @Attribute(DataTypes.INTEGER)
    @Default(0)
    declare currentStreak: number;

    @Attribute(DataTypes.INTEGER)
    @Default(0)
    declare bestStreak: number;
}