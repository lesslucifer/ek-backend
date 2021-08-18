import moment from 'moment';
import CONN from '../glob/conn';
import HC from '../glob/hc';
import { QPR } from '../utils/qpr'
import bases = require('bases')
import pad = require('string-padding')

export class UniqueCodeGenerator {
    static readonly QPRPrime = QPR.findQPRPrime(34000000);
    static readonly CODE_XOR1 = 14846697;
    static readonly CODE_XOR2 = 23794873;

    static async genCode() {
        const todayNum = moment().diff(HC.FIRST_DAY, 'd');
        const todayCode = bases.toAlphabet(todayNum, HC.HUMAN32_ALPHABET);
        const todayXOR = QPR.generate(todayNum, this.QPRPrime, this.CODE_XOR1, this.CODE_XOR2);
        const key = `${CONN.REDIS_ROOT}:ucr:${todayCode}`
        const codeInNumber: number = await CONN.REDIS.incr(key)
        const code = bases.toAlphabet(QPR.generate(codeInNumber, this.QPRPrime, this.CODE_XOR1, todayXOR), HC.HUMAN32_ALPHABET);
        return `EK${pad(todayCode, 3, '0')}${pad(code, 5, '0')}`;
    }
}