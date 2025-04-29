import { CallToolRequest } from "@modelcontextprotocol/sdk/types.js";
import { ToolContext, ValidCallToolResult } from "../types.js";
import { combine } from "../utils.js";

export const name = "files_list_drives";

export const description = "Lists the drives in a tenant";

export const handler = async function (this: ToolContext, request: CallToolRequest): Promise<ValidCallToolResult> {

    return this.fetch(combine(this.graphBaseUrl, this.graphVersionPart, "drives"));
};
