import { CallToolRequest, TextContent, ToolAnnotations } from "@modelcontextprotocol/sdk/types.js";
import { DynamicToolMode, ValidCallToolResult } from "../types.js";
import { MCPContext } from "../method-context.js";
import { patchSession } from "../session.js";
import { clearToolsCache } from "../tools.js";
import { clearResourcesCache } from "../resources.js";

export const name = "clear_context";

export const annotations: ToolAnnotations = {
    title: "Clear Context",
};

export const modes: DynamicToolMode[] = ["consumerOD", "library", "file", "folder", "site"];

export const description = `This tool clears the current context of the server. It can be used to reset to the root`;

export const handler = async function (this: MCPContext<CallToolRequest>): Promise<ValidCallToolResult> {

    const { session, server } = this.params;

    await patchSession(session.sessionId, {
        mode: "not-set",
        currentContextRoot: "",
    });

    // trigger update on tools with new mode
    await clearToolsCache(server);

    // trigger update on resources with new mode
    await clearResourcesCache(server);

    return <ValidCallToolResult>{
        role: "user",
        content: [
            <TextContent>{
                type: "text",
                text: `The current context has been cleared.`,
            },
        ],
    };
};
