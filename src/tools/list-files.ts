import { CallToolRequest } from "@modelcontextprotocol/sdk/types.js";
import { DynamicToolMode, HandlerParams, ValidCallToolResult } from "../types.js";
import { MCPContext } from "../context.js";
import { combine, withProgress } from "../utils.js";

export const name = "list_files";

export const modes: DynamicToolMode[] = ["site", "consumerOD", "folder", "drive"];

export const description = `Lists the files in the current context. If no context is available it will use the tenant's root site's default drive. If the context is a site, it will list the files
                            in that site's default document library. If the context is a drive or a folder, it will list all the child files and folders.`;

export const handler = async function (this: MCPContext, params: HandlerParams<CallToolRequest>): Promise<ValidCallToolResult> {

    const { session } = params;

    let path: string;

    switch (session.mode) {
        case "site":
            path = combine(session.currentContextRoot, "drive/root/delta");
            break;
        case "consumerOD":
            path = combine(session.currentContextRoot, "root/delta");
            break;
        case "folder":
            path = combine(session.currentContextRoot, "delta");
            break;
        case "drive":
            path = combine(session.currentContextRoot, "root/delta");
            break;
    }

    return withProgress(params, this.fetchAndAggregate(path));
};
