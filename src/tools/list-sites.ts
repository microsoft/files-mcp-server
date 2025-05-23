import { CallToolRequest, ToolAnnotations } from "@modelcontextprotocol/sdk/types.js";
import { DynamicToolMode, HandlerParams, ValidCallToolResult } from "../types.js";
import { MCPContext } from "../method-context.js";
import { withProgress } from "../utils.js";
import { formatCallToolResult } from "./core/utils.js";

export const name = "list_sites";

export const annotations: ToolAnnotations = {
    title: "List Sites",
    readOnlyHint: true,
};

export const modes: DynamicToolMode[] = ["not-set"];

export const description = "Lists the sites in a tenant";

export const handler = async function (this: MCPContext, params: HandlerParams<CallToolRequest>): Promise<ValidCallToolResult> {

    // this could take along time, so we should alert on progress in case we go over a timeout   
    return withProgress(params, this.fetchAndAggregate("sites/getAllSites").then(result => formatCallToolResult(result, "application/json")));
};
