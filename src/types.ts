import { AudioContent, BlobResourceContents, CallToolRequest, CallToolResult, ImageContent, TextContent, Tool } from "@modelcontextprotocol/sdk/types.js";

export interface ToolContext {
    fetch(path: string, init?: RequestInit, parser?: (Response) => CallToolResult): Promise<CallToolResult>;
    graphBaseUrl: string;
    graphVersionPart: string;
}

export interface DynamicTool extends Tool {
    annotations?: {
        [key: string]: unknown;
    }
    handler: (this: ToolContext, request: CallToolRequest) => Promise<any>;
}

export type ValidCallToolResults = TextContent | ImageContent | AudioContent | BlobResourceContents | { rawResponse: string };
