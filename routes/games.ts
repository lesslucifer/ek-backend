import { ExpressRouter, GET, POST } from "express-router-ts";
import { EKGame } from "../game/game";
import HC from "../glob/hc";
import { UniqueCodeGenerator } from "../serv/unique-code-generator";
import { DocResponse, DocSuccessResponse } from "../utils/decors";

class EKGamesRouter extends ExpressRouter {
    document = {
        'tags': ['Games']
    }
    
    @DocResponse({
        '+@id': 'string'
    })
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
