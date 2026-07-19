import express from "express";
import {
    saveStats,
    getStats,
    saveAchievement,
    getAchievement,
    resetStats
} from "../controllers/StatsController.js";

const router = express.Router();

router.get('/', getStats);
router.put('/', saveStats);
router.delete('/', resetStats)
router.get('/achievements', getAchievement);
router.put('/achievements', saveAchievement);

export default router;