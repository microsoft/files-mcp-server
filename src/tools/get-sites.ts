import { CallToolRequest } from "@modelcontextprotocol/sdk/types.js";
import { DynamicToolMode, HandlerParams, ValidCallToolResult } from "../types.js";
import { MCPContext } from "../context.js";

export const name = "get_sites";

export const modes: DynamicToolMode[] = ["site"];

export const description = "Lists the sites in a tenant";

export const handler = async function (this: MCPContext, params: HandlerParams<CallToolRequest>): Promise<ValidCallToolResult> {


    












    // TODO: need to add next page handling
    return this.fetch("sites/getAllSites()");
};
