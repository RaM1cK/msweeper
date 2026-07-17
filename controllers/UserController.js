import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt'
import {User} from "../models/User.ts";
import sequelize from "../models/index.js";

export const getRegisterPage = (req, res) => {
    res.sendFile('register.html', {root: 'public'});
}

const createCookieToken = (data, res) => {
     const token = jwt.sign(data, process.env.JWT_SECRET, {expiresIn: '7d'});

     res.cookie("token", token, {
         httpOnly: true,
         sameSite: 'strict',
         maxAge: 7 * 24 * 60 * 60 * 1000
     });
}

export const checkUser = (req, res) => {
    if (!req.cookies.token)
        return res.json({redirect: '/user/login'});

    res.sendStatus(200);
}

export const register = async (req, res) => {
    const data = req.body;

    console.log(data);

    let user = await User.findOne({
        where: {
            username: data.username
        }
    });

    if (user) {
        return res.status(409).send({ message: "User already exists"});
    }

    data.password = await bcrypt.hash(data.password, 10);

    await sequelize.transaction(async t => {
        user = await User.create(data, {transaction: t});
    })

    createCookieToken({id: user.id}, res);

    res.status(200).json({redirect: '/'});
}

export const auth = async (req, res) => {
    const data = req.body;

    const user = await User.findOne({
        where: {
            username: data.username
        }
    });

    if (!user) {
        return res.status(409).send({ message: "User not found"});
    } else {
        const match = await bcrypt.compare(data.password, user.password);
        if (!match)
            return res.status(409).send({ message: "Invalid username or password"});
    }

    createCookieToken({id: user.id}, res);

    res.status(200).json({redirect: '/'});
}