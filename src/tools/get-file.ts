import { CallToolRequest, ToolAnnotations } from "@modelcontextprotocol/sdk/types.js";
import { DynamicToolMode, ValidCallToolResult } from "../types.js";
import { combine, decodePathFromBase64 } from "../utils.js";
import { MCPContext } from "../method-context.js";
import { parseResponseToResult } from "./core/utils.js";

export const name = "get_file";

export const annotations: ToolAnnotations = {
    title: "Get File Content and Info",
    readOnlyHint: true,
};

export const description = "Get the content, metadata, or pdf representation of a file. It supports three operations, 'metadata', 'content', or 'pdf'. You can supply one or more operations at a time.";

export const modes: DynamicToolMode[] = ["file", "folder", "library", "site"];

export const inputSchema = {
    type: "object",
    properties: {
        file_key: {
            type: "string",
            description: "The resource identifier using file:// protocol. You can provide the entire resource uri, or just the key part represented by the uri host value.",
        },
        operations: {
            type: "array",
            items: { type: "string" },
            description: `What information we want about the file, any of 'metadata' (default), 'content', or 'pdf'. You can supply one or more operations.`,
        },
    },
    required: ["file_key"],
};

export const handler = async function (this: MCPContext<CallToolRequest>): Promise<ValidCallToolResult> {

    const { request } = this.params;

    const operations: string[] = <string[]>request.params.arguments.operations || ["metadata"];

    // let path: string;
    let fileKey = <string>request.params.arguments.file_key

    fileKey = fileKey.replace(/^file:\/\//i, "");

    const path = decodePathFromBase64(fileKey);

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
