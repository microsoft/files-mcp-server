import { CallToolRequest } from "@modelcontextprotocol/sdk/types.js";
import { DynamicToolMode, HandlerParams, ValidCallToolResult } from "../types.js";
import { MCPContext } from "../context.js";
import { withProgress } from "../utils.js";

export const name = "list_sites";

export const modes: DynamicToolMode[] = ["not-set"];

export const description = "Lists the sites in a tenant";

export const handler = async function (this: MCPContext, params: HandlerParams<CallToolRequest>): Promise<ValidCallToolResult> {

    // this could take along time, so we should alert on progress in case we go over a timeout   
    return withProgress(params, this.fetchAndAggregate("sites/getAllSites"));
};
