import ENV, { ENV_CONFIG } from './env';
import Redis = require('ioredis');
import * as mongodb from 'mongodb';
import HC from './hc';

// ************ CONFIGS ************
export class AppConnections {
    private redis: Redis.Redis;
    private mongo: mongodb.Db;

    get REDIS() { return this.redis; }
    get MONGO() { return this.mongo }

    async configureConnections(config: ENV_CONFIG) {
        this.redis = new Redis(config.REDIS);
        const mgClient: mongodb.MongoClient = await mongodb.MongoClient.connect(config.MONGO_CONNECTION, <mongodb.ConnectOptions> {
            useUnifiedTopology: true,
            ...config.MONGO_OPTIONS
        });
        const mgURL = new URL(config.MONGO_CONNECTION)
        this.mongo = mgClient.db(mgURL.pathname.slice(1))
    }

    get REDIS_ROOT() {
        return `${HC.APP_NAME}:${ENV.NAME}`;
    }
}

const CONN = new AppConnections();
export default CONN;
