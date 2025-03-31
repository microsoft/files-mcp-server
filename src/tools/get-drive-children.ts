import { CallToolRequest, CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { ToolContext } from "../types.js";
import { combine } from "../utils.js";

export const name = "onedrive_list_drive_children";

export const description = "Lists the children of a drive";

export const inputSchema = {
    type: "object",
    properties: {
        drive_id: {
            type: "string",
            description: "The ID of the drive whose children we seek to list",
        },
    },
    required: ["drive_id"],
};

export const handler = async function (this: ToolContext, request: CallToolRequest): Promise<CallToolResult> {

    return this.fetch(combine(this.graphBaseUrl, this.graphVersionPart, "drives", <string>request.params.arguments.drive_id, "root", "children"));
};
