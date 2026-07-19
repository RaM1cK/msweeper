import express from "express";
import {
    auth,
    getRegisterPage,
    register,
    logout
} from '../controllers/UserController.js'
import TokenBucket from "../classes/TokenBucket.ts";
import authMiddleware from "../controllers/authMiddleware.js";

const MAX_REGISTERED_REQUEST = 10;
const INTERVAL_REGISTERED_REQUEST = 60;

TokenBucket.init(MAX_REGISTERED_REQUEST, INTERVAL_REGISTERED_REQUEST)

const slidingLimiter = async (req, res, next) => {
    if (TokenBucket.request(req.ip)) {
        next();
    }
    else return res.status(429).send({message: "Too many requests"});
}

const router = express.Router();

router.use(slidingLimiter);
router.post('/register', register);
router.post('/auth', auth);
router.post('/logout', logout);

export default router;