import { CallToolRequest, TextContent, ToolAnnotations } from "@modelcontextprotocol/sdk/types.js";
import { DynamicToolMode, ValidCallToolResult } from "../types.js";
import { MCPContext } from "../method-context.js";
import { combine } from "../utils.js";
import { createDriveItemResourceKey } from "../resources/core/utils.js";

export const name = "create_file";

export const annotations: ToolAnnotations = {
    title: "Create File",
};

export const modes: DynamicToolMode[] = ["consumerOD", "library", "folder", "site"];

export const description = `This tool allows you to create a new file.`;

export const inputSchema = {
    type: "object",
    properties: {
        name: {
            type: "string",
            description: "The name of the new file.",
        },
        content: {
            type: "string",
            description: "The content to place in the file.",
        },
    },
    required: ["name", "content"],
};

export const handler = async function (this: MCPContext<CallToolRequest>): Promise<ValidCallToolResult> {

    const { session, request } = this.params;

    let name = <string>request.params.arguments.name;
    let content = <string>request.params.arguments.content;

    let path: string;

    switch (session.mode) {
        case "site":
            path = combine(session.currentContextRoot, `drive/root:/${name}:/content`);
            break;
        case "consumerOD":
            path = combine(session.currentContextRoot, "root/delta");
            break;
        case "folder":
            path = combine(session.currentContextRoot, `:/${name}:/content`);
            break;
        case "library":
            path = combine(session.currentContextRoot, `/root:/${name}:/content`);
            break;
    }

    const result: any = await this.fetch(path, {
        method: "PUT",
        body: content,
    });

    result.file_key = createDriveItemResourceKey(result);

    return <ValidCallToolResult>{
        role: "user",
        content: [
            <TextContent>{
                type: "text",
                text: `The file was successfully created, you can reference it using the resource uri ${result.file_key}. The metadata is also included in this response.`,
            },
            <TextContent>{
                type: "text",
                text: JSON.stringify(result, null, 2),
                mimeType: "application/json",
            }
        ],
    };
};
