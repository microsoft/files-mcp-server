import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import {
    CallToolRequestSchema,
    ListResourcesRequestSchema,
    ListResourceTemplatesRequestSchema,
    ListToolsRequestSchema,
    ReadResourceRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { callToolHandler, getToolsHandler } from "./tools.js";
import { MCPContext } from "./context.js";
import { getResourcesHandler, readResourceHandler } from "./resources.js";
import { getResourceTemplatesHandler } from "./resourceTemplates.js";

export async function setupMCPServer(context: MCPContext): Promise<Server> {

    // setup the server
    const server = new Server(
        {
            name: "Files-MCP-Server",
            version: "0.0.1",
        },
        {
            capabilities: {
                tools: {},
                resources: {},
            },
        }
    );

    // this allows us to list tools
    server.setRequestHandler(ListToolsRequestSchema, getToolsHandler.bind(context));

    // this handles individual tool requests, mapping them to the appropriate tool
    server.setRequestHandler(CallToolRequestSchema, callToolHandler.bind(context));

    // this allows us to list resources
    server.setRequestHandler(ListResourcesRequestSchema, getResourcesHandler.bind(context));

    // and read a resource
    server.setRequestHandler(ReadResourceRequestSchema, readResourceHandler.bind(context));

    // list all the resource templates
    server.setRequestHandler(ListResourceTemplatesRequestSchema, getResourceTemplatesHandler.bind(context));

    return server;
}
