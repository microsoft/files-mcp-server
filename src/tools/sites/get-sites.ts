import { CallToolRequest } from "@modelcontextprotocol/sdk/types.js";
import { ValidCallToolResult } from "../../types.js";
import { MCPContext } from "../../context.js";

export const name = "files_get_sites";

export const description = "Lists the sites in a tenant";

export const handler = async function (this: MCPContext, request: CallToolRequest): Promise<ValidCallToolResult> {

    // TODO: need to add next page handling
    return this.fetch("sites/getAllSites()");
};
