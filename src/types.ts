import {
    AudioContent,
    BlobResourceContents,
    CallToolResult,
    ImageContent,
    Notification,
    ReadResourceRequest,
    ReadResourceResult,
    Request,
    RequestId,
    RequestMeta,
    Resource,
    ResourceTemplate,
    TextContent,
    Tool,
} from "@modelcontextprotocol/sdk/types.js";
import { MCPContext } from "./method-context.js";
import { AuthInfo } from "@modelcontextprotocol/sdk/server/auth/types.js";
import { RequestHandlerExtra } from "@modelcontextprotocol/sdk/shared/protocol.js";
import { MCPSession } from "./session.js";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";

export const COMMON = "common";

export type DynamicToolMode = "site" | "library" | "folder" | "list" | "file" | "consumerOD" | typeof COMMON | "not-set"| "hidden";

export interface DynamicTool extends Tool {
    annotations?: {
        [key: string]: unknown;
    }
    modes: DynamicToolMode[];
    handler: (this: MCPContext, params: HandlerParams) => Promise<ValidCallToolResult>;
}

export interface DynamicResource {
    publish(this: MCPContext): Promise<Resource[]>;
    handler(this: MCPContext, params: HandlerParams): Promise<ReadResourceResult>;
}

export interface DynamicResourceTemplate {
    publish(this: MCPContext): Promise<ResourceTemplate[]>;
}

export type ValidCallToolContent = TextContent | ImageContent | AudioContent | BlobResourceContents;

export type ValidCallToolResult = CallToolResult & {
    role: "user" | "assistant",
    content: ValidCallToolContent[],
}

export type ResourceReadHandlerResult = Resource[] | {
    resources: Resource[];
    nextCursor: string;
};

export type ResourceReadHandlerTest<T extends ReadResourceRequest = ReadResourceRequest> = (uri: URL, params: HandlerParams<T>) => boolean;

export type ResourceReadHandler<T extends ReadResourceRequest = ReadResourceRequest> = (this: MCPContext, uri: URL, params: HandlerParams<T>) => Promise<ResourceReadHandlerResult>;

export type ResourceReadHandlerMap<T extends ReadResourceRequest = ReadResourceRequest> = Map<ResourceReadHandlerTest<T>, ResourceReadHandler<T>>;

export interface DynamicToolExtra {
    /**
     * An abort signal used to communicate if the request was cancelled from the sender's side.
     */
    signal: AbortSignal;
    /**
     * Information about a validated access token, provided to request handlers.
     */
    authInfo?: AuthInfo;
    /**
     * The session ID from the transport, if available.
     */
    sessionId?: string;
    /**
     * Metadata from the original request.
     */
    _meta?: RequestMeta;
    /**
     * The JSON-RPC ID of the request being handled.
     * This can be useful for tracking or logging purposes.
     */
    requestId: RequestId;
}

export interface HandlerParams<RequestT extends Request = Request> {
    server: Server;
    request: RequestT;
    extra: RequestHandlerExtra<RequestT, Notification>;
    session: MCPSession;
}

export interface GenericPagedResponse {
    value: {
        id: string,
        [key: string]: any
    }[];
    "@odata.nextLink"?: string;
    "@odata.deltaLink"?: string;
}


