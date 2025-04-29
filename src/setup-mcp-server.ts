import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { parseResponseToResult } from "./utils.js";
import { CallToolRequestSchema, ListToolsRequestSchema, CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { callToolHandler, getToolsHandler } from "./tools.js";
import { ToolContext } from "./types.js";
import { getToken } from "./auth.js";

export async function setupMCPServer(): Promise<Server> {

    // setup the server
    const server = new Server(
        {
            name: "Files-MCP-Server",
            version: "0.0.1",
        },
        {
            capabilities: {
                tools: {},
            },
        }
    );

    // context passed to all tools
    const context: ToolContext = {
        graphBaseUrl: "https://graph.microsoft.com",
        graphVersionPart: "v1.0",
        async fetch(path: string, init?: RequestInit): Promise<CallToolResult> {

            const token = await getToken(this);

            console.log(`FETCH PATH: ${path}`);

            const response = await fetch(path, {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`,
                },
                ...init,
            });

            return parseResponseToResult(response);
        },
    }

    // this allows us to list tools
    server.setRequestHandler(ListToolsRequestSchema, getToolsHandler);

    // this handles individual tool requests, mapping them to the appropriate tool
    server.setRequestHandler(CallToolRequestSchema, callToolHandler.bind(context));

    return server;
}
