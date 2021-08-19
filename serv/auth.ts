import * as express from 'express';
import { addMiddlewareDecor, ExpressRouter, pushDoc } from 'express-router-ts';
import ENV from '../glob/env';
import { IUser } from '../models/mongo';
import hera, { AppLogicError } from '../utils/hera';
import { JWTAuth } from '../utils/jwt-auth';
import './sess';
import { IAuthUser } from './sess';

export class AuthServ {
    static userAuthenticator: JWTAuth<IAuthUser>;

    static init() {
        this.userAuthenticator = new JWTAuth<IAuthUser>(ENV.SECRECT_KEY, ENV.ACCESS_TOKEN_EXPIRES, ENV.REFRESH_TOKEN_EXPIRES);
    }

    static AuthPlayer() {
        return addMiddlewareDecor(async (req: express.Request) => {
            if (!req.session.user) {
                const accessToken = req.header('Authorization');
                if (hera.isEmpty(accessToken)) throw new AppLogicError(`Unauthorized, Invalid access token`, 401);

                let user: IAuthUser = null;
                try {
                    user = await this.userAuthenticator.getData(accessToken);
                }
                catch (err) {
                    throw new AppLogicError(`Unauthorized! ${err}`, 401);
                }

                this.userAuthenticator.renewToken(accessToken);
                req.session.user = user;
            }
        }, pushDoc('security', {AccessToken: []}));
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