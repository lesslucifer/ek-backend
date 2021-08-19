import * as mongodb from 'mongodb';
import * as _ from 'lodash';

import { IMigration } from './migration';
import { IUser } from './user';
import { IUserAuth } from './user-auth';

export * from './migration';
export * from './user';
export * from './user-auth';

export let Migration: mongodb.Collection<IMigration>;
export let User: mongodb.Collection<IUser>;
export let UserAuth: mongodb.Collection<IUserAuth>;

export function init(db: mongodb.Db) {
    Migration = db.collection<IMigration>('migration');
    User = db.collection<IUser>('user');
    UserAuth = db.collection<IUserAuth>('user-auth');
}