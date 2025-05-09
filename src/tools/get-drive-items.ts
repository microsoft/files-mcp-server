import { CallToolRequest } from "@modelcontextprotocol/sdk/types.js";
import { DynamicToolMode, HandlerParams, ValidCallToolResult } from "../types.js";
import { combine } from "../utils.js";
import { MCPContext } from "../context.js";

export const name = "files_list_drive_items";

export const modes: DynamicToolMode[] = ["drive"];

export const description = "Lists items in a drive, using a filter to limit the information returned";

export const inputSchema = {
    type: "object",
    properties: {
        drive_id: {
            type: "string",
            description: "The ID of the drive whose children we seek to list",
        },
        filter: {
            type: "string",
            description: "Odata filter expression used to limit the drive items returned",
        },
    },
    required: ["drive_id", "filter"],
};

export const handler = async function (this: MCPContext, params: HandlerParams<CallToolRequest>): Promise<ValidCallToolResult> {

    const { request } = params;

    const query = `$filter=${<string>request.params.arguments.filter}`;

    return this.fetch(combine("drives", <string>request.params.arguments.drive_id, "items") + `?${query}`);
};
