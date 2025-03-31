import { CallToolRequest, CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { ToolContext } from "../types.js";
import { combine } from "../utils.js";

export const name = "onedrive_list_drives";

export const description = "Lists the drives in a tenant";

export const inputSchema = {};

export const handler = async function (this: ToolContext, request: CallToolRequest): Promise<CallToolResult> {

    return this.fetch(combine(this.graphBaseUrl, this.graphVersionPart, "drives"));
};
