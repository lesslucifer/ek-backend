import { EKGame } from "./game";

export class GameLogicError extends Error {
    constructor(msg: string, public errCode?: string, public params?: any) {
        super(msg);
    }
}

export interface IEKCardActiveResult {

}

export interface IEKCard {
    active(board: EKGame): Promise<IEKCardActiveResult>
}

export interface IEKDeck {
    cards: IEKCard[]
}