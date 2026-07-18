import express from 'express';
import cors from 'cors';
import StatsRouter from './routes/StatsRouter.js';
import UserRouter from "./routes/UserRouter.js";
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser'
import sequelize from "./models/index.js"
import authMiddleware from './controllers/authMiddleware.js'
import {getRegisterPage} from "./controllers/UserController.js";
import router from "./routes/UserRouter.js";

dotenv.config();

const app = express();

app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true,
}));
app.use(cookieParser());
app.use(express.json());

app.use('/login', getRegisterPage);
app.use('/user', UserRouter);

app.use(express.static('public', {index: false}));
app.use(authMiddleware);
app.get('/', (_, res) =>
    res.sendFile('index.html', {root: 'public'}))
app.use('/stats', StatsRouter);

try {
    await sequelize.authenticate();
    await sequelize.sync({alter: true});
} catch (err) {
    console.error(err);

    await sequelize.close();

    process.exit(1);
}

app.listen(3000, () => {
    console.log("Server started on port 3000");
});