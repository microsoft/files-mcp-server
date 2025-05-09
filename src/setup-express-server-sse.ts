import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import express from "express";
import { requireAuthentication } from "./auth.js";
import { registerWellKnownRoutes } from "./express-routes/well-known-oauth.js";

export async function setupExpressServer(server: Server) {

    let transport: SSEServerTransport;

    const app = express();

    registerWellKnownRoutes(app);

    app.get("/sse", requireAuthentication(async (_req, res) => {

        console.log("Received connection");
        transport = new SSEServerTransport("/message", res);

        await server.connect(transport);

        server.notification({
            method: "notifications/tools/list_changed"
        })

        server.onclose = async () => {
            await server.close();
        };
    }));

    app.post("/message", requireAuthentication(async (req, res) => {
        await transport.handlePostMessage(req, res);
    }));

    // just catch stuff for debugging to see if clients are calling in ways we don't handle.
    app.all(/.*/, (req, res) => {

        const reqPath = req.path.toString();

        console.warn(`Unhandled path: ${req.method} ${reqPath}`);
        res.setHeader('Content-Type', 'application/json')
        res.status(404);
        res.send({ error: `${reqPath} not found.` });
    });

    return app;
}
