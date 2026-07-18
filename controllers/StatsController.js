import {UserStats} from "../models/UserStats.ts";
import {UserAchievement} from "../models/UserAchievement.ts";

export const saveStats = async (req, res) => {
    const userId = req.user.id;

    const records = Object.entries(req.body)
        .map(([key, value]) => ({
            userId,
            difficulty: key,
            ...value
        }));

    await UserStats.bulkCreate(records, {
        updateOnDuplicate: [
            'played', 'won', 'bestTime', 'currentStreak', 'bestStreak'
        ]
    });

    res.sendStatus(200);
}

export const getStats = async (req, res) => {
    const records = await UserStats.findAll({
        where: {userId: req.user.id}
    })

    const data = {}

    for (const stat of records) {
        const {userId, difficulty, ...rest} = stat.dataValues;

        data[difficulty] = rest;
    }

    res.status(200).json(data);
}

export const saveAchievement = async (req, res) => {
    const userId = req.user.id;

    const records = Object.entries(req.body)
        .map(([key, value]) => ({
            userId,
            achievementId: key,
            createdAt: new Date(value)
        }))

    await UserAchievement.bulkCreate(records, {
        ignoreDuplicates: true
    })

    res.sendStatus(200);
}

export const getAchievement = async (req, res) => {
    const userId = req.user.id;

    const achievements = await UserAchievement.findAll({
        where: {userId}
    })

    const data = {}

    for (const achievement of achievements) {
        data[achievement.dataValues.achievementId] = new Date(achievement.dataValues.createdAt).getTime();
    }

    console.log(data)

    return res.status(200).json(data);
}

export const resetStats = async (req, res) => {
    const difficulty = req.body?.difficulty;

    await UserStats.destroy({
        where: difficulty === undefined
            ? {userId: req.user.id}
            : {
                userId: req.user.id,
                difficulty
            }
    })

    res.sendStatus(200);
}
