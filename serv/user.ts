import { ObjectID } from 'bson';
import * as randomstring from 'randomstring';
import { User, UserAuth } from '../models/mongo';
import hera from '../utils/hera';
import sha1 = require('sha1');

export class UserServ {
    static getUser(uid: string) {
        const id = new ObjectID(uid);
        return User.findOne({_id: id});
    }

    static async isValidPassword(userId: ObjectID, password: string) {
        const auth = await UserAuth.findOne({user: userId});
        if (hera.isEmpty(auth)) {
            return false;
        }

        const _sha1 = this.genSHA1(password, auth.passwordSalt);
        if (_sha1 != auth.passwordSHA1) {
            return false;
        }

        return true;
    }

    static genSHA1(password: string, salt: string): string {
        return sha1(`${password}${salt}`);
    }

    static updatePassword(uid: ObjectID, newPass: string) {
        const salt = randomstring.generate({length: 16});
        const hash = UserServ.genSHA1(newPass, salt);
        return UserAuth.updateOne({user: uid}, {$set: {
            user: uid,
            passwordSHA1: hash,
            passwordSalt: salt
        }}, {upsert: true});
    }
}