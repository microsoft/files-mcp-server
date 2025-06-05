import { CallToolRequest, ToolAnnotations } from "@modelcontextprotocol/sdk/types.js";
import { DynamicToolMode, ValidCallToolResult } from "../types.js";
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

export const handler = async function (this: MCPContext<CallToolRequest>): Promise<ValidCallToolResult> {

    // we need to write the code to loop all the sites and then make that work.


    // this could take along time, so we should alert on progress in case we go over a timeout   
    return withProgress.call(this, this.fetchAndAggregate("sites?$filter=siteCollection/root ne null&$select=siteCollection,webUrl", {}).then(result => formatCallToolResult(result, "application/json")));
};

// function siteInfoAugmentation(vals: any[]) {
//     return vals.map(v => v.file_key = createSiteResourceKey(v));
// }

