import ERR from "../glob/err"
import hera from "../utils/hera"
import { GameLogicError } from "./base"

export type EKGameState = 'WAITING_LOBBY' | 'RUNNING' | 'PAUSED' | 'STOPPED'

export interface IEKGameSystemConfig {
    interval: number,
    minSleepTime: number
}

export class EKGame {
    id: string;
    state: EKGameState = 'WAITING_LOBBY'
    sysConfig: IEKGameSystemConfig = {
        interval: 60,
        minSleepTime: 10
    }

    constructor(gameId: string) {
        this.id = gameId
    }
    
    async start() {
        if (this.state != 'WAITING_LOBBY') throw new GameLogicError('Cannot start board! Invalid status', ERR.INVALID_OBJECT_STATUS, {state: this.state})
        this.state = 'RUNNING'
        return true
    }

    async run(): Promise<void> {
        if (this.state != 'RUNNING') throw new GameLogicError('Cannot start board! Invalid status', ERR.INVALID_OBJECT_STATUS, {state: this.state})
        while (this.state == 'RUNNING') {
            const time = Date.now()
            try {
                // Frame logic here
                // console.log(`Game ${this.id} is running at: ${time}`)
            }
            catch (err) {
                // Handle error each frame
                console.log('Frame error: ')
                console.error(err)
            }
            finally {
                const endTime = Date.now()
                const dur = endTime - time
                if (dur < this.sysConfig.interval) {
                    await hera.sleep(Math.max(this.sysConfig.interval - dur, this.sysConfig.minSleepTime))
                }
            }
        }
    }

    async stop(): Promise<boolean> {
        if (this.state != 'RUNNING') throw new GameLogicError('Cannot start board! Invalid status', ERR.INVALID_OBJECT_STATUS, {state: this.state})
        this.state = 'STOPPED'
        return true
    }
}