import { CallToolRequest } from "@modelcontextprotocol/sdk/types.js";
import { DynamicToolMode, HandlerParams, ValidCallToolResult } from "../types.js";
import { combine } from "../utils.js";
import { MCPContext } from "../context.js";

export const name = "files_list_drive_children";

export const modes: DynamicToolMode[] = ["drive"];

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

export const handler = async function (this: MCPContext, params: HandlerParams<CallToolRequest>): Promise<ValidCallToolResult> {

    const { request } = params;

    return this.fetch(combine("drives", <string>request.params.arguments.drive_id, "root", "children"));
};
