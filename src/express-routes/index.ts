import { Application } from "express";
import { registerFileStreamRoutes } from "./file-stream.js";
import { registerOAuthRoutes } from "./oauth-resource.js"

export function registerRoutes(app: Application) {
    registerFileStreamRoutes(app);
    registerOAuthRoutes(app);
}
