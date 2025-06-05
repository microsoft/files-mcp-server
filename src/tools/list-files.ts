import { CallToolRequest, ToolAnnotations } from "@modelcontextprotocol/sdk/types.js";
import { DynamicToolMode, ValidCallToolResult } from "../types.js";
import { MCPContext } from "../method-context.js";
import { combine, withProgress } from "../utils.js";
import { formatCallToolResult } from "./core/utils.js";
import { createDriveItemResourceKey } from "../resources/core/utils.js";

export const name = "list_files";

export const annotations: ToolAnnotations = {
    title: "List Files",
    readOnlyHint: true,
};

export const modes: DynamicToolMode[] = ["site", "consumerOD", "folder", "library"];

export const description = `Lists the files in the current context. If no context is available it will use the tenant's root site's default drive. If the context is a site, it will list the files
                            in that site's default document library. If the context is a drive or a folder, it will list all the child files and folders.`;

export const handler = async function (this: MCPContext<CallToolRequest>): Promise<ValidCallToolResult> {

    const { session } = this.params;

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
        case "library":
            path = combine(session.currentContextRoot, "root/delta");
            break;
    }

    return withProgress.call(this, this.fetchAndAggregate(path, {}, fileInfoAugmentation).then(result => formatCallToolResult(result, "application/json")));
};

function fileInfoAugmentation(vals: any[]) {
    return vals.map(v => {
        v.file_key = createDriveItemResourceKey(v);
        return v;
    });
}
