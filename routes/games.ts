import { ExpressRouter, GET, POST } from "express-router-ts";
import { EKGame } from "../game/game";
import HC from "../glob/hc";
import AuthServ from "../serv/auth";
import { UniqueCodeGenerator } from "../serv/unique-code-generator";
import { DocIdResponse, DocResponse, DocSuccessResponse } from "../utils/decors";

class EKGamesRouter extends ExpressRouter {
    document = {
        'tags': ['Games']
    }
    
    @AuthServ.AuthPlayer()
    @DocIdResponse()
    @POST({path: "/"})
    async createGame() {
        const game = new EKGame(await UniqueCodeGenerator.genCode())
        await game.start()
        game.run()

        setTimeout(() => {
            game.stop()
        }, 100000)

        return {
            id: game.id
        }
    }
}

export default new EKGamesRouter()
