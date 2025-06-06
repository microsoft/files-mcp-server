import { CallToolRequest, ToolAnnotations } from "@modelcontextprotocol/sdk/types.js";
import { DynamicToolMode, ValidCallToolResult } from "../types.js";
import { MCPContext } from "../method-context.js";
import { combine, withProgress } from "../utils.js";
import { formatCallToolResult } from "./core/utils.js";

export const name = "list_libraries";

export const annotations: ToolAnnotations = {
    title: "List Libraries",
    readOnlyHint: true,
};

export const modes: DynamicToolMode[] = ["not-set", "site"];

export const description = "Lists the libraris in the current context. If no context is set, the root site collection's libraries will be listed. Libraries contain files which can be accessed withing the library.";

export const handler = async function (this: MCPContext<CallToolRequest>): Promise<ValidCallToolResult> {

    const { session } = this.params;

    let path: string;

    switch (session.mode) {
        case "site":
            path = combine(session.currentContextRoot, "drives");
            break;
        default:
            path = "drives";
    }

    return withProgress.call(this, this.fetchAndAggregate(path).then(result => formatCallToolResult(result, "application/json")));
};
