import _ from 'lodash';
import newAjv2 from '../utils/ajv2';
import hera from '../utils/hera';

const ajv = newAjv2();

export interface DB_CONFIG {
    REDIS: string;
    MONGO_CONNECTION: string;
    MONGO_OPTIONS: any;
}

const ajvDbConfig = {
    '+@REDIS': 'string',
    '+@MONGO_CONNECTION': 'string',
    'MONGO_OPTIONS': {}
}

export interface AUTH_CONFIG {
    SECRECT_KEY: string;
    ACCESS_TOKEN_EXPIRES?: number;
    REFRESH_TOKEN_EXPIRES?: number;
}

const ajvAuthConfig = {
    '+@SECRECT_KEY': 'string',
    '@ACCESS_TOKEN_EXPIRES': 'number',
    '@REFRESH_TOKEN_EXPIRES': 'number'
}

export interface ENV_CONFIG extends DB_CONFIG, AUTH_CONFIG {
    NAME: string;
    HTTP_PORT: number;
    LOG_LEVEL: string;
}

const ajvEnvConfig = ajv({
    '+@NAME': 'string',
    '+@HTTP_PORT': 'number',
    '+@LOG_LEVEL': 'string',
    ...ajvDbConfig,
    ...ajvAuthConfig
})

const ENV_DEFAULT: Partial<ENV_CONFIG> = {
    HTTP_PORT: 4365,
    SECRECT_KEY: '123',
    LOG_LEVEL: 'debug',
    MONGO_OPTIONS: {},
}

const envCustomParser = {
    HTTP_PORT: hera.parseInt
}

function loadConfig(): ENV_CONFIG {
    // console.debug('process.env')
    // console.debug(JSON.stringify(process.env, null, 2))
    const config: any = _.cloneDeep(ENV_DEFAULT);
    for (const key in process.env) {
        let val = process.env[key]
        if (envCustomParser[key]) {
            val = envCustomParser[key](val)
        }
        _.set(config, key, val);
    }

    if (!ajvEnvConfig(config)) throw new Error(`Invalid env config; ${JSON.stringify(ajvEnvConfig.errors, null, 2)}`)
    return config;
}

export const ENV: ENV_CONFIG = loadConfig();
export default ENV;
