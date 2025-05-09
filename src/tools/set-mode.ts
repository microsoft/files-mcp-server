import { CallToolRequest, ResourceContents, TextContent, TextResourceContents } from "@modelcontextprotocol/sdk/types.js";
import { COMMON, DynamicToolMode, HandlerParams, ValidCallToolResult } from "../types.js";
import { MCPContext } from "../context.js";
import { patchSession } from "../session.js";

export const name = "files_set_mode";

export const modes: DynamicToolMode[] = [COMMON];

export const description = "This tool allows you to change the context of the tool by providing a URL to a resource to use as the contextual entry point.";

export const inputSchema = {
    type: "object",
    properties: {
        item_url: {
            type: "string",
            description: "The url to the new contextual base.",
        },
    },
    required: ["item_url"],
};

export const handler = async function (this: MCPContext, params: HandlerParams<CallToolRequest>): Promise<ValidCallToolResult> {

    const { request, session, server } = params;

    const url = <string>request.params.arguments.item_url;

    const shareKey = "u!" + Buffer.from(url, "utf8").toString("base64").replace(/=$/i, "").replace("/", "_").replace("+", "-");

    let result: any;
    let failed: boolean = false;
    let mode: DynamicToolMode;
    let contextBase = "";
    let uriStr = "";
    let sentResult: any = {};

    try {

        // let's start with file? is that more common?
        result = await this.fetchDirect(`/shares/${shareKey}?$expand=driveItem`);
        mode = result?.folder ? "folder" : "file";
        contextBase = `/drives/${1}/items/${result.driveItem.id}`;
        uriStr = `${mode}://${result.driveItem.id}`;
        sentResult = result.driveItem;

    } catch (e) {

        try {

            result = await this.fetchDirect(`/shares/${shareKey}?$expand=site`);
            mode = "site";
            contextBase = `/sites/${result.site.id}`;
            uriStr = `site://${result.site.id}`;
            sentResult = result.site;

        } catch {

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

    // trigger update on tools and resource with new mode
    server.notification({
        method: "notifications/tools/list_changed",
    });

    return <ValidCallToolResult>{
        role: "user",
        content: [
            <TextContent>{
                type: "text",
                text: `We were able to locate the requested context using the path ${url}. It appears to be a ${mode}. We've also include some initial metadata.`,
            },
            <TextResourceContents>{
                uri: uriStr,
                type: "text",
                mimeType: "application/json",
                text: JSON.stringify(sentResult, null, 2),
            },
        ],
    };
};
