import * as express from 'express';
import { addMiddlewareDecor, ExpressRouter } from 'express-router-ts';
import { IUser } from '../models/mongo';
import hera, { AppLogicError } from '../utils/hera';
import { JWTAuth } from '../utils/jwt-auth';
import './sess';

export class AuthServ {
    static userAuthenticator: JWTAuth<IUser>;

    static init() {
        this.userAuthenticator = new JWTAuth<IUser>('123');
    }

    static AuthRole(...roles: string[]) {
        return addMiddlewareDecor(async (req: express.Request) => {
            if (!req.session.user) {
                const accessToken = req.header('Authorization');
                if (hera.isEmpty(accessToken)) throw new AppLogicError(`Unauthorized, Invalid access token`, 401);

                let user: IUser = null;
                try {
                    user = await this.userAuthenticator.getData(accessToken);
                }
                catch (err) {
                    throw new AppLogicError(`Unauthorized! ${err}`, 401);
                }

                this.userAuthenticator.renewToken(accessToken);
                req.session.user = user;
            }
        });
    }

    static get SystemKeys() {
        return []
    }

    static AuthAPIKey(...allowedRoles: string[]) {
        return addMiddlewareDecor(async req => {
            const apiKey = req.header('apikey') || req.query.apikey || (req.body && req.body.apikey);
            if (hera.isEmpty(apiKey)) throw ExpressRouter.NEXT;

            const system = this.SystemKeys.find(sk => sk.key == apiKey);
            if (!system) throw ExpressRouter.NEXT;

            const isHasRole = !!allowedRoles.find(r => !!system.roles.find(rr => (r == rr)));
            if (!isHasRole) throw ExpressRouter.NEXT;

            req.session.system = system;
        })
    }
}

export default AuthServ;