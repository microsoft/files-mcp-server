import { CallToolRequest, TextContent, ToolAnnotations } from "@modelcontextprotocol/sdk/types.js";
import { DynamicToolMode, ValidCallToolResult } from "../types.js";
import { MCPContext } from "../method-context.js";

export const name = "get_context";

export const annotations: ToolAnnotations = {
    title: "Get Context",
    readOnlyHint: true,
};

export const modes: DynamicToolMode[] = ["consumerOD", "library", "file", "folder", "site"];

export const description = `This tool gets the current context of the server. It will also supply additional contextual information.
                            The setting can be managed using the set_context tool.`;

export const handler = async function (this: MCPContext<CallToolRequest>): Promise<ValidCallToolResult> {

    const { session } = this.params;

    return <ValidCallToolResult>{
        role: "user",
        content: [
            <TextContent>{
                type: "text",
                text: `The current contextual mode is ${session.mode} with a base url of ${session.currentContextRoot}`,
            },
        ],
    };
};
