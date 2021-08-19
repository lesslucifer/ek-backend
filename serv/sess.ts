import * as express from 'express';
import * as uuid from 'uuid';
import { IUser } from '../models/mongo';


interface IReqSession<UserType> {
    user?: UserType;
    system?: string;
}

declare module "express-serve-static-core" {
    interface Request {
        nonce: string;
        session: IReqSession<IUser>
    }
}

export default function createSesssionObject(): express.RequestHandler {
    return (req, resp, next) => {
        req.session = {};
        req.nonce = uuid.v4();
        next();
    };
}

