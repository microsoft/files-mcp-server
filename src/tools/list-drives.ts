import { CallToolRequest } from "@modelcontextprotocol/sdk/types.js";
import { DynamicToolMode, HandlerParams, ValidCallToolResult } from "../types.js";
import { MCPContext } from "../context.js";
import { withProgress } from "../utils.js";

export const name = "list_drives";

export const modes: DynamicToolMode[] = ["not-set"];

export const description = "Lists the drives in a tenant";

export const handler = async function (this: MCPContext, params: HandlerParams<CallToolRequest>): Promise<ValidCallToolResult> {

    return withProgress(params, this.fetchAndAggregate("drives"));
};
