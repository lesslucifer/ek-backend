import * as express from 'express';
import * as uuid from 'uuid';
import { IUser } from '../models/mongo';

export interface IAuthUser {
    _id: string;
    name: string;
}

interface IReqSession<UserType> {
    user?: UserType;
    system?: string;
}

declare module "express-serve-static-core" {
    interface Request {
        nonce: string;
        session: IReqSession<IAuthUser>
    }
}

export default function createSesssionObject(): express.RequestHandler {
    return (req, resp, next) => {
        req.session = {};
        req.nonce = uuid.v4();
        next();
    };
}

