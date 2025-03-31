import { CallToolRequest, CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { ToolContext } from "../types.js";
import { parseResposneToResult } from "../utils.js";

export const name = "onedrive_list_drives";

export const description = "Lists the drives in a tenant";

export const inputSchema = {};

export const handler = async function (this: ToolContext, request: CallToolRequest): Promise<CallToolResult> {

    const token = await this.getToken();

    const response = await fetch("https://graph.microsoft.com/v1.0/drives", {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${token}`,
        }
    });

    return parseResposneToResult(response);    
};
