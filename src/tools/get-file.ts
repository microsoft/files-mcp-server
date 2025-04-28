import { CallToolRequest, CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { ToolContext } from "../types.js";
import { combine, parseResponseToResult } from "../utils.js";

export const name = "files_get_file_2";

export const description = "Get the content, metadata, or pdf representation of a file. It supports three operations, 'metadata', 'content', or 'pdf'. You can supply one or more operations at a time.";

// export const annotations = {
//     readOnlyHint: true,
// }

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
            description: "What information we want about the file, any of metadata (default), content, or pdf. You can supply one or more operations.",
        },
    },
    required: ["drive_id", "item_id"],
};

export const handler = async function (this: ToolContext, request: CallToolRequest): Promise<CallToolResult> {

        const operations: string[] = <string[]>request.params.arguments.operations || ["metadata"];

        const driveItemPathBase = combine(this.graphBaseUrl, this.graphVersionPart, "drives", <string>request.params.arguments.drive_id, "items", <string>request.params.arguments.item_id);

        // const responses: CallToolResult[] = [];

        let driveItemPath = driveItemPathBase;

        for (let i = 0; i < operations.length; i++) {            

            if (/content/i.test(operations[i])) {

                driveItemPath = combine(driveItemPath, "contentStream");

            } else if (/pdf/i.test(operations[i])) {

                driveItemPath = combine(driveItemPath, "content?format=pdf");
            }

            // responses.push(await this.fetch(driveItemPath, {}, parser);
        }

        // just testing, trying to work out returning binary data
        return this.fetch(driveItemPath, {}, parseResponseToResult.bind(this));
};
