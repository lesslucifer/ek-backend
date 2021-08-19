import * as express from 'express';
import { Body, ExpressRouter, POST, PUT, Req } from 'express-router-ts';
import { User } from '../models/mongo';
// Import models here
// Import services here
import AuthServ from '../serv/auth';
import { UserServ } from '../serv/user';
import { ValidBody } from '../utils/decors';
import { AppLogicError } from '../utils/hera';



class AuthRouter extends ExpressRouter {
    @ValidBody({
        '+@name': 'string',
        '+@password': 'string',
        '++': false
    }, {
        'name': 'vulq',
        'password': '123456'
    })
    @POST()
    async login(@Req() req: express.Request, @Body() body: ILoginBody) {
        const user = await User.findOne({ name: body.name });
    
        if (!user) throw new AppLogicError('Cannot login! Invalid user or user is blocked', 400);
    
        const isPasswordCorrect = user && await UserServ.isValidPassword(user._id, body.password)
        if (!isPasswordCorrect) throw new AppLogicError('Cannot login! Invalid username or password', 400);
    
        const token = await AuthServ.userAuthenticator.genTokens({
            _id: user._id.toHexString(),
            name: user.name
        });
        
        return token;
    }

    @ValidBody({
        '+@refresh_token': 'string',
        '++': false
    }, {
        'refresh_token': 'refresh_token'
    })
    @PUT({path: '/token'})
    async refreshToken(@Req() req: express.Request, @Body('refresh_token') refreshToken: string) {
        const expires = new Date().valueOf() / 1000 + AuthServ.userAuthenticator.accessTokenExpires;
        const accessToken = await AuthServ.userAuthenticator.genAccessToken(refreshToken);
    
        const user = await AuthServ.userAuthenticator.getData(accessToken);
        if (!user) throw new AppLogicError('Invalid token', 401)
    
        const tokens = {
            access_token: accessToken,
            expires_in: expires,
            refresh_token: refreshToken
        }
    
        return tokens;
    }

    @ValidBody({
        '@access_token': 'string',
        '@refresh_token': 'string',
        '++': false
    },{
        'access_token': 'access_token',
        'refresh_token': 'refresh_token'
    })
    @PUT({path: '/logout'})
    async logout(@Req() req: express.Request,
    @Body('access_token') accessToken: string,
    @Body('refresh_token') refreshToken: string,
    @Body('player_id') playerId?: string) {
        AuthServ.userAuthenticator.revokeToken(accessToken);
        AuthServ.userAuthenticator.revokeToken(refreshToken);
    
        return {};
    }

    @ValidBody({
        '+@name': 'string',
        '+@password': 'string|>=6',
        '++': false
    }, {
        'name': 'vulq',
        'password': '123456'
    })
    @POST({path: '/reg'})
    async reg(@Req() req: express.Request, @Body() data: IRegBody) {
        const duplicatedUser = await User.findOne({ name: data.name }, { projection: {_id: 1} });
        if (duplicatedUser) throw new AppLogicError('Cannot create user! Phone is already registered', 400);

        // const duplicatedRef = await UserRef.findOne({ phone: data.phone }, { fields: ['_id'] });
        // if (duplicatedRef) throw new AppLogicError('Cannot create user! Phone is already referenced', 400);
    
        const result = await User.insertOne({
            name: data.name
        });
    
        if (!result.insertedId) throw new AppLogicError('Cannot create user! Cannot insert user', 500);
    
        await UserServ.updatePassword(result.insertedId, data.password);
    
        return {
            _id: result.insertedId
        }
    }
}

interface ILoginBody {
    name: string;
    password: string;
}

interface IRegBody {
    name: string;
    password: string;
}

export default new AuthRouter;