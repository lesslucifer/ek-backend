import * as express from 'express';
import { Body, ExpressRouter, GET, PUT, Query, Req } from 'express-router-ts';
import { GQLFieldFilter, GQLGlobal, GQLU } from 'gql-ts';
import HC from '../glob/hc';
import { GQLUser } from '../models/gql/user';
import { IUser } from '../models/mongo';
// Import models here
// Import services here
import AuthServ from '../serv/auth';
import { UserServ } from '../serv/user';
import { Sess, ValidBody } from '../utils/decors';
import { AppLogicError } from '../utils/hera';

class UserRouter extends ExpressRouter {

    @AuthServ.AuthPlayer()
    @GET({path: '/me'})
    async getUserProfile(@Sess('user') user: IUser, @Query() q) {
        const query = GQLGlobal.queryFromHttpQuery(q, GQLUser);
        GQLU.whiteListFilter(query);
        query.filter.add(new GQLFieldFilter('_id', user._id.toHexString()));
    
        const [me] = await query.resolve();
        return me;
    }

    @AuthServ.AuthPlayer()
    @ValidBody({
        '+@oldPassword': 'string',
        '+@newPassword': 'string|len>=6',
        '++': false
    })
    @PUT({path: '/me/password'})
    async updatePassword(@Req() req: express.Request, @Sess('user') user: IUser,
        @Body('oldPassword') oldPass: string,
        @Body('newPassword') newPass: string) {
        const isOldPassValid = await UserServ.isValidPassword(user._id, oldPass);
        if (!isOldPassValid) {
            throw new AppLogicError('Cannot update password! The old password is not correct', 400);
        }
    
        await UserServ.updatePassword(user._id, newPass);
        
        return HC.SUCCESS;
    }
}

export default new UserRouter();