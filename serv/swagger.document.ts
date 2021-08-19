import { EROpenAPIDocument, ExpressRouter } from "express-router-ts";
import hera from "../utils/hera";
import _ from "lodash";
import HC from "../glob/hc";
import ENV from "../glob/env";

export class SwaggerDocument {
    public static async generate(): Promise<string> {
        const doc = new EROpenAPIDocument()
        doc.components = EROpenAPIDocument.COMPONENTS
        doc.info.title = HC.APP_NAME
        doc.info.version = '1.0.0'
        doc.servers.push(<any>{url: `http://localhost:${ENV.HTTP_PORT}`})
        doc.components.securitySchemes = {
            "AccessToken": {
                "type":"apiKey",
                "name":"Authorization",
                "in":"header",
                "description": "Access token",
            },
            "ServiceKeyHeader": {
              "type": "apiKey",
              "name": "apiKey",
              "description": "API Key",
              "in": "header"
            }
        }

        const routers = await ExpressRouter.loadRoutersInDir(`${__dirname}/../routes`, {
            log: console.error.bind(console)
        })
        await hera.sleep()

        routers.forEach(r => {
            // console.log(`Importing file ${r.file}`)
            doc.addRouter(r.er, undefined, r.path)
            // console.log(`Imported file ${r.file}`)
        })

        return JSON.stringify(doc)
    }
}
