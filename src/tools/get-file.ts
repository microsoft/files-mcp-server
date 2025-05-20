import { CallToolRequest } from "@modelcontextprotocol/sdk/types.js";
import { DynamicToolMode, HandlerParams, ValidCallToolResult } from "../types.js";
import { combine } from "../utils.js";
import { MCPContext } from "../context.js";

export const name = "get_file_information";

export const description = "Get the content, metadata, or pdf representation of a file. It supports three operations, 'metadata', 'content', or 'pdf'. You can supply one or more operations at a time.";

export const annotations = {
    readOnlyHint: true,
}

export const modes: DynamicToolMode[] = ["file"];

export const inputSchema = {
    type: "object",
    properties: {
        drive_id: {
            type: "string",
            description: "The ID of the drive containing the item whose details we seek",
        },
        item_id: {
            type: "string",
            description: "The ID of the drive item whose details we seek",
        },
        operations: {
            type: "array",
            items: { type: "string" },
            description: `What information we want about the file, any of metadata (default), content, contentStream, or pdf. You can supply one or more operations - except contentStream must be used alone.
                          contentStream will return a streaming response of the file contents with appropriate content-type header.`,
        },
    },
    required: ["drive_id", "item_id"],
};

export const handler = async function (this: MCPContext, params: HandlerParams<CallToolRequest>): Promise<ValidCallToolResult> {

    const { request } = params;

    const operations: string[] = <string[]>request.params.arguments.operations || ["metadata"];

    const driveItemPathBase = combine("drives", <string>request.params.arguments.drive_id, "items", <string>request.params.arguments.item_id);

    const responses: ValidCallToolResult[] = [];

    let driveItemPath = driveItemPathBase;

    for (let i = 0; i < operations.length; i++) {

        if (/content/i.test(operations[i])) {

            driveItemPath = combine(driveItemPath, "contentStream");

        } else if (/pdf/i.test(operations[i])) {

            driveItemPath = combine(driveItemPath, "content?format=pdf");
        }

        responses.push(await this.fetch(driveItemPath, {}));
    }

    return <ValidCallToolResult>{
        role: "user",
        content: responses.reduce((pv, v, i) => {
            pv.push(...v.content);
            return pv;
        }, []),
    };
};
