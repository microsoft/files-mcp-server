import { CallToolRequest } from "@modelcontextprotocol/sdk/types.js";
import { DynamicToolMode, HandlerParams, ValidCallToolResult } from "../types.js";
import { MCPContext } from "../context.js";
import { combine, withProgress } from "../utils.js";

export const name = "list_drives";

export const modes: DynamicToolMode[] = ["not-set", "site"];

export const description = "Lists the drives in a tenant";

export const handler = async function (this: MCPContext, params: HandlerParams<CallToolRequest>): Promise<ValidCallToolResult> {

    const { session } = params;

    let path: string;

    switch (session.mode) {
        case "site":
            path = combine(session.currentContextRoot, "drives");
            break;
        default:
            path = "drives";
    }

    return withProgress(params, this.fetchAndAggregate(path));
};
