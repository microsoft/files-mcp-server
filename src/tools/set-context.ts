import { CallToolRequest, TextContent, TextResourceContents } from "@modelcontextprotocol/sdk/types.js";
import { COMMON, DynamicToolMode, HandlerParams, ValidCallToolResult } from "../types.js";
import { MCPContext } from "../context.js";
import { patchSession } from "../session.js";
import { clearToolsCache } from "../tools.js";
import { clearResourcesCache } from "../resources.js";
import { encodePathToBase64 } from "../utils.js";

export const name = "set_context";

export const modes: DynamicToolMode[] = [COMMON];

export const description = `This tool allows you to change the context of this mcp server by providing a URL to a resource to use as the contextual entry point.
                            Almost any valid SharePoint or OneDrive url will work, and the tool will return an error if the context cannot be identified.
                            The context can be a site, folder, or file. Changing the context will update the list of available tools and resources. Most
                            entities include a webUrl in the response which you can use with this tool.`;

export const inputSchema = {
    type: "object",
    properties: {
        context_url: {
            type: "string",
            description: "The url to the new contextual root.",
        },
    },
    required: ["context_url"],
};

export const handler = async function (this: MCPContext, params: HandlerParams<CallToolRequest>): Promise<ValidCallToolResult> {

    const { request, session, server } = params;

    const url = <string>request.params.arguments.context_url;

    const shareKey = "u!" + Buffer.from(url, "utf8").toString("base64").replace(/=$/i, "").replace("/", "_").replace("+", "-");

    let result: any;
    let failed: boolean = false;
    let mode: DynamicToolMode;
    let contextBase = "";
    let sentResult: any = {};

    try {

        // let's start with file? is that more common?
        result = await this.fetchDirect(`/shares/${shareKey}?$expand=driveItem`);

        if (result.driveItem?.root) {
            mode = "drive";
            contextBase = `/drives/${result.driveItem.parentReference.driveId}`;
        } else {
            mode = result.driveItem?.folder ? "folder" : "file";
            contextBase = `/drives/${result.driveItem.parentReference.driveId}/items/${result.driveItem.id}`;
        }

        sentResult = result.driveItem;

    } catch (e) {

        try {

            result = await this.fetchDirect(`/shares/${shareKey}?$expand=site`);
            mode = "site";
            contextBase = `/sites/${result.site.id}`;
            sentResult = result.site;

        } catch {

            // this is amazing error handling.
            failed = true;
        }

    } finally {

        if (!failed) {

            await patchSession(session.sessionId, {
                mode,
                currentContextRoot: contextBase,
            });

        } else {

            throw Error(`Could not locate a valid context using ${url}.`);
        }
    }

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

    const uriStr = `${mode}://${encodePathToBase64(contextBase)}`;

    return <ValidCallToolResult>{
        role: "user",
        content: [
            <TextContent>{
                type: "text",
                text: `We located the requested context using the path '${url}', it appears to be a ${mode}. We've also include some initial metadata.`,
            },
            <TextResourceContents>{
                uri: uriStr,
                type: "text",
                mimeType: "application/json",
                text: JSON.stringify(sentResult, null, 2),
            },
            <TextContent>{
                type: "text",
                text: `The uri '${uriStr}' can be used with resource templates where the uri host represents the key required for the available protocols. Keys only work with the protocol they are delivered with.`,
            },
        ],
    };
};
