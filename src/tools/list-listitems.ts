import { CallToolRequest, ToolAnnotations } from "@modelcontextprotocol/sdk/types.js";
import { DynamicToolMode, ValidCallToolResult } from "../types.js";
import { MCPContext } from "../method-context.js";
import { combine, withProgress } from "../utils.js";
import { formatCallToolResult } from "./core/utils.js";

export const name = "list_listitems";

export const annotations: ToolAnnotations = {
    title: "List ListItems",
    readOnlyHint: true,
};

//TODO:: test consumer OD lists
export const modes: DynamicToolMode[] = ["list", "folder", "library"];

export const description = `Lists the items in the current context. This works for lists and folders within lists. It also works for libraries to list the underlying SharePoint metadata`;

export const handler = async function (this: MCPContext<CallToolRequest>): Promise<ValidCallToolResult> {

    const { session } = this.params;

    let path: string;

    switch (session.mode) {

        case "folder":
            //TODO:: test this
            path = combine(session.currentContextRoot, "delta");
            break;

        case "library":
        case "list":
            path = combine(session.currentContextRoot, "items/delta");
            break;
    }

    return withProgress.call(this, this.fetchAndAggregate(path).then(result => formatCallToolResult(result, "application/json")));
};
