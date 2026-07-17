import jwt from "jsonwebtoken";
import {User} from "../models/User.ts";

const authenticate = async (req, res, next) => {
    const token = req.cookies.token;

    let id;

    try {
        id = jwt.verify(token, process.env.JWT_SECRET).id;
    } catch {
        return res.redirect('/login');
    }

    req.user = await User.findOne({
        where: { id }
    });

    next();
}

export default authenticate;