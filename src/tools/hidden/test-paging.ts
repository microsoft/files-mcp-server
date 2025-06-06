import { CallToolRequest } from "@modelcontextprotocol/sdk/types.js";
import { DynamicToolMode, GenericPagedResponse, ValidCallToolResult } from "../../types.js";
import { MCPContext } from "../../method-context.js";
import { getNextCursor } from "../../utils.js";

// Paging doesn't seem supported for tool results as of May 14
export const name = "test_paging";

export const modes: DynamicToolMode[] = ["hidden"];

export const description = "A test tool for trying out paging";

export const inputSchema = {
    type: "object",
    properties: {
        page_size: {
            type: "number",
            description: "The page size of returned results.",
        },
        cursor: {
            type: "string",
            description: "The nextCursor from previous requests.",
        },
    },
    required: [],
};

export const handler = async function (this: MCPContext<CallToolRequest>): Promise<ValidCallToolResult> {

    const { request } = this.params;

    let urlBase = "/sites/delta";

    const pageSize = request.params?.arguments?.page_size || 25;

    if (request.params?.arguments?.cursor) {
        // continue 
        urlBase += `?token=${request.params.arguments.cursor}&$top=${pageSize}`;
    } else {
        urlBase += `?$top=${pageSize}`;
    }

    const result = await this.fetch<GenericPagedResponse>(urlBase);

    const results = result.value;
    const nextCursor = getNextCursor(result);

    return {
        role: "user",
        content: [{
            type: "text",
            mimeType: "application/json",
            text: JSON.stringify(results, null, 2),
        }],
        nextCursor,
    };
};
