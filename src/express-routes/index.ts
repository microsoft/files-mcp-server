import { Application } from "express";
import { registerFileStreamRoutes } from "./file-stream.js";
import { registerOAuthRoutes } from "./oauth-resource.js"
import { verbose } from "../environment.js";

export function registerRoutes(app: Application) {
    registerFileStreamRoutes(app);
    registerOAuthRoutes(app);

    if (verbose) {

        // just log all the request/response pairs
        app.use((req, res, next) => {
            console.log(req);
            console.log(res);
            next();
        });
    }
}
