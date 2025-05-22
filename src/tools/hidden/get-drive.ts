import { CallToolRequest } from "@modelcontextprotocol/sdk/types.js";
import { DynamicToolMode, HandlerParams, ValidCallToolResult } from "../../types.js";
import { combine } from "../../utils.js";
import { MCPContext } from "../../method-context.js";

export const name = "files_get_drive";

export const modes: DynamicToolMode[] = ["library"];

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

export const handler = async function (this: MCPContext, params: HandlerParams<CallToolRequest>): Promise<ValidCallToolResult> {

    const { request } = params;

    return this.fetchAndParseToResult(combine("drives", <string>request.params.arguments.drive_id));
};
