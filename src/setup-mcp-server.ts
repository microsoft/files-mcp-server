import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import {
    CallToolRequestSchema,
    ListResourcesRequestSchema,
    ListResourceTemplatesRequestSchema,
    ListToolsRequestSchema,
    Notification,
    ReadResourceRequestSchema,
    Request,
} from "@modelcontextprotocol/sdk/types.js";
import { callToolHandler, getToolsHandler } from "./tools.js";
import { MCPContext } from "./method-context.js";
import { getResourcesHandler, readResourceHandler } from "./resources.js";
import { getResourceTemplatesHandler } from "./resourceTemplates.js";
import { ensureSession } from "./session.js";
import { HandlerParams } from "./types.js";
import { RequestHandlerExtra } from "@modelcontextprotocol/sdk/shared/protocol.js";

export async function setupMCPServer(context: MCPContext): Promise<Server> {

    // setup the server
    const server = new Server(
        {
            name: "Files-MCP-Server",
            version: "0.0.1",
        },
        {
            capabilities: {
                tools: {
                    listChanged: true,
                },
                resources: {
                    listChanged: true,
                },
            },
        }
    );

    // this function allows us to normalize the paramters for handlers, injecting anything we need centrally
    function callHandler<T extends (this: MCPContext, options: HandlerParams) => Promise<any>>(handler: T) {

        return async (request: Request, extra: RequestHandlerExtra<Request, Notification>): Promise<ReturnType<T>> => {

            const session = await ensureSession(extra.sessionId);

            const opts: HandlerParams = {
                server,
                request,
                extra,
                session,
            }

            return handler.call(context, opts);
        }
    }

    // this allows us to list tools
    server.setRequestHandler(ListToolsRequestSchema, callHandler(<any>getToolsHandler));

    // this handles individual tool requests, mapping them to the appropriate tool
    server.setRequestHandler(CallToolRequestSchema, callHandler(<any>callToolHandler));

    // this allows us to list resources
    server.setRequestHandler(ListResourcesRequestSchema, callHandler(<any>getResourcesHandler));

    // and read a resource
    server.setRequestHandler(ReadResourceRequestSchema, callHandler(<any>readResourceHandler));

    // list all the resource templates
    server.setRequestHandler(ListResourceTemplatesRequestSchema, callHandler(<any>getResourceTemplatesHandler));

    return server;
}
