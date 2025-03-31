import { CallToolRequest, CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { ToolContext } from "../types.js";
import { parseResposneToResult } from "../utils.js";

export const name = "onedrive_get_drive";

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

export const handler = async function (this: ToolContext, request: CallToolRequest): Promise<CallToolResult> {

    const token = await this.getToken();

    const response = await fetch(`https://graph.microsoft.com/v1.0/drives/${request.params.arguments.drive_id}`, {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${token}`,
        }
    });

    return parseResposneToResult(response);
};
