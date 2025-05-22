import { CallToolRequest, TextContent } from "@modelcontextprotocol/sdk/types.js";
import { DynamicToolMode, HandlerParams, ValidCallToolResult } from "../types.js";
import { MCPContext } from "../method-context.js";

export const name = "get_context";

export const modes: DynamicToolMode[] = ["consumerOD", "library", "file", "folder", "site"];

export const description = `This tool gets the current context of the server. It will also supply additional contextual information.
                            The setting can be managed using the set_context tool.`;

export const handler = async function (this: MCPContext, params: HandlerParams<CallToolRequest>): Promise<ValidCallToolResult> {

    const { session } = params;

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
