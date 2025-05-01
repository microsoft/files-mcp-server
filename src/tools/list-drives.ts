import { CallToolRequest } from "@modelcontextprotocol/sdk/types.js";
import { ValidCallToolResult } from "../types.js";
import { MCPContext } from "../context.js";

export const name = "files_list_drives";

export const description = "Lists the drives in a tenant";

export const handler = async function (this: MCPContext, request: CallToolRequest): Promise<ValidCallToolResult> {

    return this.fetch("drives");
};
