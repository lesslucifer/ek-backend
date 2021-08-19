import * as mongodb from 'mongodb';
import { IUser } from './user';
import { IUserAuth } from './user-auth';

export * from './user';
export * from './user-auth';

export let User: mongodb.Collection<IUser>;
export let UserAuth: mongodb.Collection<IUserAuth>;

export class AppMongoModels {
    static async init(db: mongodb.Db) {
        User = db.collection<IUser>('user');
        UserAuth = db.collection<IUserAuth>('user-auth');

        await this.migrate(db)
    }

    static MIGRATIONS = [initUserIndexes]

    static async migrate(db: mongodb.Db) {
        const dbConfig = await db.collection('config').findOne({type: 'db'});
        const migrations: string[] = (dbConfig && dbConfig.migrations) || [];
        for (const mig of this.MIGRATIONS) {
            if (!migrations.includes(mig.name)) {
                await mig();
                await db.collection('config').updateOne({type: 'db'}, {$push: {migrations: mig.name}}, {upsert: true});
            }
        }
    }
}

async function initUserIndexes() {
    await User.createIndex({ name: 1 }, { unique: true})
    await UserAuth.createIndex({ user: 1 }, { unique: true})
}