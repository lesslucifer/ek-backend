import * as jwt from "jsonwebtoken";

export interface IAuthToken {
    access_token: string
    expires_in: number
    refresh_token: string
}

export interface ITokenData<T> {
    data: T,
    type: 'ACCESS' | 'REFRESH'
}

export class JWTAuth<T> {
    readonly secrect: string;
    readonly accessTokenExpires: number;
    readonly refreshTokenExpires: number;

    constructor(
        secrect: string,
        accessTokenExpires: number = 2*60*60, // default is 2 hours
        refreshTokenExpires?: number
    ) {
        this.secrect = secrect;
        this.accessTokenExpires = accessTokenExpires;
        this.refreshTokenExpires = refreshTokenExpires ?? accessTokenExpires * 1000; // default is 1000 times longer than the access token
    }

    async genTokens(data: T): Promise<IAuthToken> {
        const refreshToken = await this.genRefreshToken(data);
        const now = new Date();
        const accessToken = await this.genAccessToken(refreshToken);
        const accessTokenExpiresIn = now.valueOf() / 1000 + this.accessTokenExpires;
        return {
            access_token: accessToken,
            expires_in: accessTokenExpiresIn,
            refresh_token: refreshToken
        };
    }

    async genRefreshToken(data: T) {
        const refreshToken = jwt.sign({
                data,
                type: "REFRESH",
            },
            this.secrect,
            { expiresIn: this.refreshTokenExpires }
        );
        return refreshToken;
    }

    async genAccessToken(refreshToken: string) {
        const tokenData: ITokenData<T> = <any> jwt.verify(refreshToken, this.secrect);
        if (tokenData.type == "REFRESH") {
            return jwt.sign({
                    data: tokenData.data,
                    type: "ACCESS",
                },
                this.secrect,
                { expiresIn: this.accessTokenExpires }
            );
        }

        return null;
    }

    async renewToken(accessToken: string): Promise<void> {
        // cannot renew jwt token
    }

    async revokeToken(token: string): Promise<void> {
        // cannot revoke jwt token
    }

    async getData(accessToken: string): Promise<T> {
        const tokenData: ITokenData<T> = <any> jwt.verify(accessToken, this.secrect);
        if (tokenData.type == "ACCESS") {
            return tokenData.data
        }

        return null;
    }
}
