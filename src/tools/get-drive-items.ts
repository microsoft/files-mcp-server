import { CallToolRequest, CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { ToolContext } from "../types.js";
import { combine } from "../utils.js";

export const name = "files_list_drive_items";

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

export const handler = async function (this: ToolContext, request: CallToolRequest): Promise<CallToolResult> {

    const query = `$filter=${<string>request.params.arguments.filter}`;

    return this.fetch(combine(this.graphBaseUrl, this.graphVersionPart, "drives", <string>request.params.arguments.drive_id, "items") + `?${query}`);
};
