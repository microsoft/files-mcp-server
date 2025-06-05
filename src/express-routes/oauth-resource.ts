import { Application } from "express";
import { clientId, tenantId } from "../environment.js";

/**
 * Registers the /.well-known/oauth-protected-resource route and response handler
 * 
 * @param app the express application
 */
export function registerOAuthRoutes(app: Application) {

    app.options("/.well-known/oauth-protected-resource", function (req, res, next) {
        
        res
            .set({
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "GET,OPTIONS",
                "Access-Control-Allow-Headers": "Authorization",
            })
            .send(200);
    });

    app.get("/.well-known/oauth-protected-resource", function (req, res, next) {

        res
            .status(200)
            .set({ "Content-Type": "application/json", "Cache-Control": "no-store", "Pragma": "no-cache" })
            .send({
                resource_name: "Local testing files MCP Server",
                resource: "http://localhost:3001",
                authorization_servers: [`https://login.microsoftonline.com/${tenantId}/v2.0`],
                bearer_methods_supported: ["header"],
                scopes_supported: [
                    "openid",
                    "profile",
                    "email",
                    "files.readwrite.all",
                    "sites.read.all",
                    // `VSCODE_TENANT:${tenantId}`,
                    `VSCODE_CLIENT_ID:${clientId}`,
                ],
                issuer: `https://login.microsoftonline.com/${tenantId}/v2.0`,
            });
    });
}
