import { CallToolRequest } from "@modelcontextprotocol/sdk/types.js";
import { DynamicToolMode, HandlerParams, ValidCallToolResult } from "../types.js";
import { combine } from "../utils.js";
import { MCPContext } from "../method-context.js";
import { parseResponseToResult } from "./core/utils.js";

export const name = "get_file";

export const description = "Get the content, metadata, or pdf representation of a file. It supports three operations, 'metadata', 'content', or 'pdf'. You can supply one or more operations at a time.";

export const annotations = {
    readOnlyHint: true,
}

export const modes: DynamicToolMode[] = ["file", "folder", "library", "site"];

export const inputSchema = {
    type: "object",
    properties: {
        drive_id: {
            type: "string",
            description: "The ID of the drive containing the item whose details we seek. In the context of a drive or folder this is optional.",
        },
        item_id: {
            type: "string",
            description: "The ID of the drive item whose details we seek",
        },
        operations: {
            type: "array",
            items: { type: "string" },
            description: `What information we want about the file, any of 'metadata' (default), 'content', or 'pdf'. You can supply one or more operations.`,
        },
        address_direct: {
            type: "boolean",
            description: "Optional, if set to true and a drive_id and item_id are supplied any context checks will be skipped and the file will be addressed directly."
        }
    },
    required: ["drive_id", "item_id"],
};

export const handler = async function (this: MCPContext, params: HandlerParams<CallToolRequest>): Promise<ValidCallToolResult> {

    const { request, session } = params;

    const operations: string[] = <string[]>request.params.arguments.operations || ["metadata"];

    let path: string;
    const mode = <boolean>request.params.arguments?.address_direct ? "default" : session.mode;

    switch (mode) {
        case "site":
            path = combine(session.currentContextRoot, "drives", <string>request.params.arguments.drive_id, "items", <string>request.params.arguments.item_id);
            break;
        case "consumerOD":
            path = combine(session.currentContextRoot, "items", <string>request.params.arguments.item_id);
            break;
        case "folder":
            path = combine(session.currentContextRoot, "items", <string>request.params.arguments.item_id);
            break;
        case "library":
            path = combine(session.currentContextRoot, "items", <string>request.params.arguments.item_id);
            break;
        default:
            path = combine(this.graphBaseUrl, this.graphVersionPart, "drives", <string>request.params.arguments.drive_id, "items", <string>request.params.arguments.item_id);
    }

    const responses: ValidCallToolResult[] = [];

    let driveItemPath = path;

    for (let i = 0; i < operations.length; i++) {

        if (/content/i.test(operations[i])) {

            driveItemPath = combine(driveItemPath, "contentStream");

        } else if (/pdf/i.test(operations[i])) {

            driveItemPath = combine(driveItemPath, "content?format=pdf");
        }

        responses.push(await this.fetch(driveItemPath, {}, true).then(parseResponseToResult));
    }

    return <ValidCallToolResult>{
        role: "user",
        content: responses.reduce((pv, v) => {
            pv.push(...v.content);
            return pv;
        }, []),
    };
};
