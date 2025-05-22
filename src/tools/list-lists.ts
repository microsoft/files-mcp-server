import { CallToolRequest } from "@modelcontextprotocol/sdk/types.js";
import { DynamicToolMode, HandlerParams, ValidCallToolResult } from "../types.js";
import { MCPContext } from "../method-context.js";
import { combine, withProgress } from "../utils.js";

export const name = "list_lists";

export const modes: DynamicToolMode[] = ["site"];

export const description = "Lists the SharePoint Lists in the current site.";

export const handler = async function (this: MCPContext, params: HandlerParams<CallToolRequest>): Promise<ValidCallToolResult> {

    const { session } = params;

    let path: string;

    switch (session.mode) {
        case "site":
            path = combine(session.currentContextRoot, "lists");
            break;
        default:
            path = "lists";
    }

    return withProgress(params, this.fetchAndAggregate(path));
};
