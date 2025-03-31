import { CallToolRequest, Tool } from "@modelcontextprotocol/sdk/types";

export interface ToolContext {
    getToken(): Promise<string>;
}

export interface DynamicTool extends Tool {
    handler : (this: ToolContext, request: CallToolRequest) => Promise<any>;
}

