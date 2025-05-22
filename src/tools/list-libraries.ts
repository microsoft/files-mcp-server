import { CallToolRequest } from "@modelcontextprotocol/sdk/types.js";
import { DynamicToolMode, HandlerParams, ValidCallToolResult } from "../types.js";
import { MCPContext } from "../method-context.js";
import { combine, withProgress } from "../utils.js";

export const name = "list_libraries";

export const modes: DynamicToolMode[] = ["not-set", "site"];

export const description = "Lists the libraris in this tenant. Libraries contain files which can be accessed withing the library.";

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
