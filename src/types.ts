import {
    AudioContent,
    BlobResourceContents,
    CallToolRequest,
    CallToolResult,
    ImageContent,
    ReadResourceRequest,
    ReadResourceResult,
    Resource,
    ResourceTemplate,
    TextContent,
    Tool,
} from "@modelcontextprotocol/sdk/types.js";
import { MCPContext } from "./context.js";

export type DynamicToolMode = "site" | "drive" | "folder" | "file" | "consumerOD";

export interface DynamicTool extends Tool {
    annotations?: {
        [key: string]: unknown;
    }
    modes: DynamicToolMode[];
    handler: (this: MCPContext, request: CallToolRequest) => Promise<ValidCallToolResult>;
}

export interface DynamicResource {
    publish(this: MCPContext): Promise<Resource[]>;
    handler(this: MCPContext, request: ReadResourceRequest): Promise<ReadResourceResult>;
}

export interface DynamicResourceTemplate {
    publish(this: MCPContext): Promise<ResourceTemplate[]>;
}

export type ValidCallToolContent = TextContent | ImageContent | AudioContent | BlobResourceContents;

export type ValidCallToolResult = CallToolResult & {
    role: "user" | "assistant",
    content: ValidCallToolContent,
}
