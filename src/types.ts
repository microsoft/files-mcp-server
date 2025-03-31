import { CallToolRequest, CallToolResult, Tool } from "@modelcontextprotocol/sdk/types";

export interface ToolContext {
    fetch(path: string, body?: any): Promise<CallToolResult>;
    graphBaseUrl: string;
    graphVersionPart: string;
}

export interface DynamicTool extends Tool {
    handler : (this: ToolContext, request: CallToolRequest) => Promise<any>;
}

