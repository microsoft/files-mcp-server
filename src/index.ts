#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
    CallToolResult,
    CallToolRequest,
    CallToolRequestSchema,
    ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

import { getTools } from "./tools.js";
import { getToken } from "./auth.js";
import { formatResponse, parseResposneToResult } from "./utils.js";
import { ToolContext } from "./types.js";

async function main(): Promise<void> {

    // setup the server
    const server = new Server(
        {
            name: "OneDrive-MCP-Server",
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
        async fetch(path: string, method: "GET" = "GET", body?: any): Promise<CallToolResult> {

            const token = await getToken(this);

            const response = await fetch(path, {
                method,
                headers: {
                    "Authorization": `Bearer ${token}`,
                }
            });

            return parseResposneToResult(response);
        },
    }

    // this allows us to list tools
    server.setRequestHandler(ListToolsRequestSchema, async () => {

        console.log("Received ListToolsRequest");

        const tools = await getTools();

        console.log("Got Tools!");

        return { tools };
    });

    // this handles individual tool requests, mapping them to the appropriate tool
    server.setRequestHandler(
        CallToolRequestSchema,
        async (request: CallToolRequest) => {

            console.log("Received CallToolRequest:", request);

            const tools = await getTools();

            try {

                const tool = tools.filter(t => t.name === request.params.name);
                if (tool.length < 1) {
                    throw Error(`Could not locate tool "${request.params.name}".`);
                }

                return tool[0].handler.call(context, request)

            } catch (e) {

                return formatResponse({
                    error: e instanceof Error ? e.message : String(e),
                });
            }
        });

    const transport = new StdioServerTransport();
    console.error("Connecting server to transport...");
    await server.connect(transport);
    console.log("Running.");
}

main().catch((error) => {
    console.error("Fatal error in main():", error);
    process.exit(1);
});
