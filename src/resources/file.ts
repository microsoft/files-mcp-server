import { ReadResourceRequest, ReadResourceResult, Resource, ResourceTemplate } from "@modelcontextprotocol/sdk/types";
import { MCPContext } from "../method-context.js";
import { processResourceHandlers } from "./core/process-resource-handlers.js";
import { ResourceReadHandlerMap } from "../types.js";
import { combine, decodePathFromBase64, encodePathToBase64 } from "../utils.js";
import { mapDriveItemResponseToResource } from "./core/utils.js";
import { getDefaultResourceHandlerMapEntryFor } from "./core/default-resource-handler.js";

export async function publish(this: MCPContext<ReadResourceRequest>): Promise<(Resource | ResourceTemplate)[]> {

    const { session } = this.params;

    // for file let's just grab some things and create resoureces so they are available

    const resources: Resource[] = [];

    // include metadata
    if (session.mode === "file") {

        const metadata = await this.fetch<any>(session.currentContextRoot);
        const resource = mapDriveItemResponseToResource(metadata);
        const key = encodePathToBase64(session.currentContextRoot);

        resources.push(

            // expose metadata resource of file
            resource,

            // expose direct download
            {
                uri: combine("/", "file", key, "contentStream"),
                name: `Directly download the content of the file: ${resource.name}`,
                description: "This resources represents a direct download of the file. To access it do not sent a resource request, instead make a request using the supplied path to the server. You should include authentication information as normal.",
                mimeType: resource.mimeType,
            });
    }

    return resources;
}

export async function handler(this: MCPContext<ReadResourceRequest>): Promise<ReadResourceResult> {

    const { request } = this.params;

    const uri = new URL(request.params.uri);

    if (!/^file:$/i.test.call(this, uri.protocol)) {
        // filter by all the protocols this handler can accept
        // this was misrouted, maybe something elese will pick it up
        return;
    }

    return processResourceHandlers.call(this, uri, handlers);
}

/**
 * This is a map of [function, handler] tuples. If the function returns true, the handler is used.
 */
const handlers: ResourceReadHandlerMap = new Map([
    [
        (uri) => /^file:\/\/.*?\/content$/i.test(uri.toString()),
        async function (this: MCPContext<ReadResourceRequest>, uri: URL): Promise<Resource[]> {

            const { request } = this.params;
            const encodedPath = /^file:\/\/(.*?)\/content$/.exec(request.params.uri);
            const path = decodePathFromBase64(encodedPath[1]);

            const result = await this.fetch<Response>(combine(path, "contentStream"), <any>{
                responseType: "arraybuffer",
            }, true);

            const mimeType = result.headers.get("Content-Type");

            if (mimeType === "text/plain") {

                const text = await result.text();

                return [{
                    uri: request.params.uri,
                    mimeType,
                    text,
                }];

            } else {

                const buffer = await result.arrayBuffer();

                return [{
                    uri: request.params.uri,
                    mimeType: mimeType || "application/octet-stream",
                    blob: Buffer.from(buffer).toString("base64"),
                }];
            }
        }
    ],
    getDefaultResourceHandlerMapEntryFor("file"),
]);
