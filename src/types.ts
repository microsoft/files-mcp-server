import { AudioContent, BlobResourceContents, CallToolRequest, CallToolResult, ImageContent, TextContent, Tool } from "@modelcontextprotocol/sdk/types.js";

export interface ToolContext {
    fetch(path: string, init?: RequestInit, parser?: (Response) => CallToolResult): Promise<ValidCallToolResult>;
    graphBaseUrl: string;
    graphVersionPart: string;
}

export interface DynamicTool extends Tool {
    annotations?: {
        [key: string]: unknown;
    }
    handler: (this: ToolContext, request: CallToolRequest) => Promise<ValidCallToolResult>;
}

export type ValidCallToolContent = TextContent | ImageContent | AudioContent | BlobResourceContents;

export type ValidCallToolResult = CallToolResult & {
    role: "user" | "assistant",
    content: ValidCallToolContent,
}
