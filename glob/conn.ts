import ENV, { ENV_CONFIG } from './env';
import Redis = require('ioredis');
import HC from './hc';

// ************ CONFIGS ************
export class AppConnections {
    private redis: Redis.Redis;

    get REDIS() { return this.redis; }

    async configureConnections(config: ENV_CONFIG) {
        this.redis = new Redis(config.REDIS);
    }

    get REDIS_ROOT() {
        return `${HC.APP_NAME}:${ENV.NAME}`;
    }
}

const CONN = new AppConnections();
export default CONN;
