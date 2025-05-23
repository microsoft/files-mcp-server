import { CallToolRequest, TextContent, TextResourceContents } from "@modelcontextprotocol/sdk/types.js";
import { COMMON, DynamicToolMode, HandlerParams, ValidCallToolResult } from "../types.js";
import { MCPContext } from "../method-context.js";
import { patchSession } from "../session.js";
import { clearToolsCache } from "../tools.js";
import { clearResourcesCache } from "../resources.js";
import { combine, decodePathFromBase64, encodePathToBase64 } from "../utils.js";

export const name = "set_context";

export const modes: DynamicToolMode[] = [COMMON];

export const description = `This tool allows you to change the context of this mcp server by providing a URL (or a valid resource URI obtained from this server) to a resource to use as the contextual entry point.
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

interface ResolvedEntityInfo {
    mode: DynamicToolMode;
    contextBase: string;
    metadata: any;
}

export const handler = async function (this: MCPContext, params: HandlerParams<CallToolRequest>): Promise<ValidCallToolResult> {

    const { request, session, server } = params;

    const contextUrl = <string>request.params.arguments.context_url;
    const shareKey = "u!" + Buffer.from(contextUrl, "utf8").toString("base64").replace(/=$/i, "").replace("/", "_").replace("+", "-");

    // these are roughly in order of our estimation on usage.
    const resolvers: (() => Promise<ResolvedEntityInfo>)[] = [
        async () => {

            const uri = new URL(contextUrl);
            const cleanProtocol: DynamicToolMode = <any>uri.protocol.replace(/:$/, "");

            if ((<DynamicToolMode[]>["file", "folder", "site", "list", "library", "listitem"]).indexOf(cleanProtocol) > -1) {

                // this is not a share, this is one of our resource URIs

                const decodedPath = decodePathFromBase64(contextUrl.replace(/^.*?:\/\//, ""));

                const metadata = await this.fetch(decodedPath);

                return {
                    mode: cleanProtocol,
                    contextBase: decodedPath,
                    metadata,
                };
            }

            throw Error(`Failed to parse resource id path ${contextUrl}.`);
        },
        async () => {

            // file/folder
            const result = await this.fetch<{ driveItem: { id: string, root?: any; folder?: any; parentReference: { driveId } } }>(`/shares/${shareKey}?$expand=driveItem`);
            let mode: DynamicToolMode;
            let contextBase: string;

            if (result.driveItem?.root) {
                mode = "library";
                contextBase = `/drives/${result.driveItem.parentReference.driveId}`;
            } else {
                mode = result.driveItem?.folder ? "folder" : "file";
                contextBase = `/drives/${result.driveItem.parentReference.driveId}/items/${result.driveItem.id}`;
            }

            return {
                mode,
                contextBase,
                metadata: result.driveItem,
            };
        },
        async () => {
            // list
            const result = await this.fetch<{ list: { id: string, parentReference: { siteId: string } } }>(`/shares/${shareKey}?$expand=list`);
            return {
                mode: "list",
                contextBase: `/sites/${result.list.parentReference.siteId}/lists/${result.list.id}`,
                metadata: result.list,
            };
        },
        async () => {
            // site
            const result = await this.fetch<{ site: { id: string } }>(`/shares/${shareKey}?$expand=site`);
            return {
                mode: "site",
                contextBase: `/sites/${result.site.id}`,
                metadata: result.site,
            };
        },
        async () => {
            // tenant root, site path, or site id
            let parsedURI = URL.parse(contextUrl);
            const result = await this.fetch<{ id: string }>(`/sites/${combine(parsedURI.host, parsedURI.pathname)}`);
            return {
                mode: "site",
                contextBase: `/sites/${result.id}`,
                metadata: result,
            };
        }
    ]

    const resolverErrors = [];

    for (let i = 0; i < resolvers.length; i++) {

        try {

            const { mode, contextBase, metadata } = await resolvers[i]();
            await patchSession(session.sessionId, {
                mode,
                currentContextRoot: contextBase,
            });

            // trigger update on tools with new mode
            await clearToolsCache(server);

            // trigger update on resources with new mode
            await clearResourcesCache(server);

            const uriStr = `${mode}://${encodePathToBase64(contextBase)}`;

            return <ValidCallToolResult>{
                role: "user",
                content: [
                    <TextContent>{
                        type: "text",
                        text: `We located the requested context using the path '${contextUrl}', it appears to be a ${mode}. We've also include some initial metadata.`,
                    },
                    <TextResourceContents>{
                        uri: uriStr,
                        type: "text",
                        mimeType: "application/json",
                        text: JSON.stringify(metadata, null, 2),
                    },
                    <TextContent>{
                        type: "text",
                        text: `The uri '${uriStr}' can be used with resource templates where the uri host represents the key required for the available protocols. Keys only work with the protocol they are delivered with, but work for any 
                               resource template associated with that protocol. This key is not the same as the id value returned in entity metadata and is unique to this server.`,
                    },
                ],
            };

        } catch (e) {
            resolverErrors.push(e.message);
        }
    }

    throw Error(resolverErrors.join("; "));
};
