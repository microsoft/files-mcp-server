import { CallToolRequest, ToolAnnotations } from "@modelcontextprotocol/sdk/types.js";
import { DynamicToolMode, ValidCallToolResult } from "../types.js";
import { MCPContext } from "../method-context.js";
import { combine, withProgress } from "../utils.js";
import { formatCallToolResult } from "./core/utils.js";

export const name = "list_lists";

export const annotations: ToolAnnotations = {
    title: "List Lists",
    readOnlyHint: true,
};

export const modes: DynamicToolMode[] = ["site"];

export const description = "Lists the SharePoint Lists in the current site.";

export const handler = async function (this: MCPContext<CallToolRequest>): Promise<ValidCallToolResult> {

    const { session } = this.params;

    let path: string;

    switch (session.mode) {
        case "site":
            path = combine(session.currentContextRoot, "lists");
            break;
        default:
            path = "lists";
    }

    return withProgress.call(this, this.fetchAndAggregate(path).then(result => formatCallToolResult(result, "application/json")));
};
