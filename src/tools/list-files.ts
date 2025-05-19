import { CallToolRequest } from "@modelcontextprotocol/sdk/types.js";
import { DynamicToolMode, HandlerParams, ValidCallToolResult } from "../types.js";
import { MCPContext } from "../context.js";

export const name = "list_files";

export const modes: DynamicToolMode[] = ["site", "consumerOD", "folder", "drive"];

export const description = "Lists the sites in a tenant";

export const inputSchema = {
    type: "object",
    properties: {
        response_type: {
            type: "string",
            description: `Controls how the response is formatted. Valid values are 'resources' or 'json'. If 'resources' is passed the results will be resources with a uri and name. If 'json' is passed
                          the results will be the raw API json response. The default is 'json' and it is not required to supply a value if json results are desired.`,
        },
    },
    required: [],
};

export const handler = async function (this: MCPContext, params: HandlerParams<CallToolRequest>): Promise<ValidCallToolResult> {

    // const { session } = params;

    // const result = this.fetchDirect("")

    // site
    // folder
    // drive
    // not-set


    // {
    //   "type": "resource",
    //   "resource": {
    //     "uri": "resource://example",
    //     "mimeType": "text/plain",
    //     "text": "Resource content"
    //   }
    // }



    // TODO: need to add next page handling
    return this.fetch("sites/getAllSites()");
};
