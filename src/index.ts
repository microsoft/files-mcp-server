#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
    CallToolRequest,
    CallToolRequestSchema,
    ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

import { getTools } from "./tools.js";
import { getToken } from "./auth.js";

async function main(): Promise<void> {

    const context = {

        async getToken(): Promise<string> {
            return getToken();
        }
    }

    const server = new Server({
        name: "OneDrive-MCP-Server",
        version: "0.0.1",
    },
        {
            capabilities: {
                tools: {},
            },
        });

    server.setRequestHandler(ListToolsRequestSchema, async () => {

        console.log("Received ListToolsRequest");

        let tools;

        try {

            tools = await getTools();

        } catch (e) {

            console.error(`Error listing tools: ${e}`);
        }

        console.log("Got Tools!");

        return { tools };
    });

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

                return {
                    content: [
                        {
                            type: "text",
                            text: JSON.stringify({
                                error: e instanceof Error ? e.message : String(e),
                            }),
                        },
                    ],
                };

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
