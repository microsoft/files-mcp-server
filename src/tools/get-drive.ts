import { CallToolRequest } from "@modelcontextprotocol/sdk/types.js";
import { ToolContext, ValidCallToolResult } from "../types.js";
import { combine } from "../utils.js";

export const name = "files_get_drive";

export const description = "Get the details about a single Drive by id";

export const inputSchema = {
    type: "object",
    properties: {
        drive_id: {
            type: "string",
            description: "The ID of the drive whose details we seek",
        },
    },
    required: ["drive_id"],
};

export const handler = async function (this: ToolContext, request: CallToolRequest): Promise<ValidCallToolResult> {

    return this.fetch(combine(this.graphBaseUrl, this.graphVersionPart, "drives", <string>request.params.arguments.drive_id));
};
