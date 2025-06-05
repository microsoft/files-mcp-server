import { RequestHandler } from "express";
import { clientId } from "./environment.js";

export function requireAuthentication(wrapped: RequestHandler): RequestHandler {

    return async (req, res) => {

        const unauthorizedResponse = () => {
            res
                .status(401)
                .set({
                    "Access-Control-Expose-Headers": "WWW-Authenticate",
                    "WWW-Authenticate": `Bearer resource_metadata="http://localhost:3001/.well-known/oauth-protected-resource"`,
                })
                .send();
        }

        if (req.headers.authorization) {

            const parts = req.headers.authorization.split(" ");

            if (!/bearer/i.test(parts[0])) {
                unauthorizedResponse();
            } else {

                // we need to pipe through the auth information to the MCP SDK which looks for an "auth" property
                const headerValue = req.headers.authorization.split(" ");
                if (headerValue[0] === "Bearer") {
                    (<any>req).auth = {
                        token: headerValue[1],
                        clientId,
                        scopes: ["Files.ReadWrite.All", "Sites.Read.All"],
                    };
                }

                // we have the Bearer header in the req here - so we need to pipe it through
                wrapped(req, res, null);
            }

        } else {
            unauthorizedResponse();
        }
    }
}
