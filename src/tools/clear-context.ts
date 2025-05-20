import { CallToolRequest, TextContent } from "@modelcontextprotocol/sdk/types.js";
import { DynamicToolMode, HandlerParams, ValidCallToolResult } from "../types.js";
import { MCPContext } from "../context.js";
import { patchSession } from "../session.js";
import { clearToolsCache } from "../tools.js";
import { clearResourcesCache } from "../resources.js";

export const name = "clear_context";

export const modes: DynamicToolMode[] = ["consumerOD", "drive", "file", "folder", "site"];

export const description = `This tool clears the current context of the server. It can be used to reset to the root`;

export const handler = async function (this: MCPContext, params: HandlerParams<CallToolRequest>): Promise<ValidCallToolResult> {

    const { session, server } = params;

    await patchSession(session.sessionId, {
        mode: "not-set",
        currentContextRoot: "",
    });

    // trigger update on tools with new mode
    clearToolsCache().then(() => {
        server.notification({
            method: "notifications/tools/list_changed",
        });
    })

    // trigger update on resources with new mode
    clearResourcesCache().then(() => {
        server.notification({
            method: "notifications/resources/list_changed",
        });
    });

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
