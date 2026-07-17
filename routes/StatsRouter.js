import express from "express";
import {saveStats, getStats, saveAchievement, getAchievement} from "../controllers/StatsController.js";

const router = express.Router();

router.get('/', getStats);
router.put('/', saveStats);
router.get('/achievements', getAchievement);
router.put('/achievements', saveAchievement);

export default router;