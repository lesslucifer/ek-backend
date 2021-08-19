import { EKGame } from "./game";

export interface IEKCardActiveResult {

}

export interface IEKCard {
    active(board: EKGame): Promise<IEKCardActiveResult>
}

export interface IEKDeck {
    cards: IEKCard[]
}