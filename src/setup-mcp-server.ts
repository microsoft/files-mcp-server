import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { formatResponse, parseResponseToResult } from "./utils.js";
import { CallToolRequest, CallToolRequestSchema, ListToolsRequestSchema, ListToolsResult, Tool, CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { getTools } from "./tools.js";
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
    server.setRequestHandler(ListToolsRequestSchema, async () => {
        const tools = await getTools();

        const returnTools = [];

        // map to accepted array
        for (let i = 0; i < tools.length; i++) {

            let tool: Tool = {
                name: tools[i].name,
                description: tools[i].description,
            }

            if (tools[i].inputSchema) {
                tool.inputSchema = tools[i].inputSchema;
            }

            returnTools.push(tool);
        }

        return <ListToolsResult>{
            tools: returnTools,
        };
    });

    // this handles individual tool requests, mapping them to the appropriate tool
    server.setRequestHandler(
        CallToolRequestSchema,
        async (request: CallToolRequest) => {

            const tools = await getTools();

            try {

                const tool = tools.filter(t => t.name === request.params.name);
                if (tool.length < 1) {
                    throw Error(`Could not locate tool "${request.params.name}".`);
                }

                return tool[0].handler.call(context, request)

            } catch (e) {

                console.error("Fatal error in calling tool:", e);

                return formatResponse({
                    error: e instanceof Error ? e.message : String(e),
                });
            }
        });

    return server;
}
