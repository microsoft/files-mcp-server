import { ReadResourceRequest, ReadResourceResult, Resource, ResourceTemplate } from "@modelcontextprotocol/sdk/types";
import { MCPContext } from "../context.js";
import { processResourceHandlers } from "./core/process-resource-handlers.js";
import { HandlerParams, ResourceReadHandlerMap } from "../types.js";
import { combine, decodePathFromBase64, encodePathToBase64 } from "../utils.js";
import { mapDriveItemResponseToResource } from "./core/utils.js";

export async function publish(this: MCPContext, params: HandlerParams<ReadResourceRequest>): Promise<(Resource | ResourceTemplate)[]> {

    const { session } = params;

    // for file let's just grab some things and create resoureces so they are available

    const resources: Resource[] = [];

    // include metadata
    if (session.mode === "file") {

        //TODO:: eventually we'd cache this
        const metadata = await this.fetch<any>(combine(session.currentContextRoot));
        const resource = mapDriveItemResponseToResource(metadata);
        const key = encodePathToBase64(session.currentContextRoot);

        resources.push(
            // expose metadata resource of file
            resource,

            // expose botspeak representation of file
            {
                uri: combine(resource.uri, "botspeak"),
                name: `Botspeak representation of ${resource.name}`,
                mimeType: "text/plain",
            },

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

export async function handler(this: MCPContext, params: HandlerParams<ReadResourceRequest>): Promise<ReadResourceResult> {

    const { request } = params;

    const uri = new URL(request.params.uri);

    if (!/^file:$/i.test(uri.protocol)) {
        // filter by all the protocols this handler can accept
        // this was misrouted, maybe something elese will pick it up
        return;
    }

    return processResourceHandlers.call(this, uri, params, handlers);
}

/**
 * This is a map of [function, handler] tuples. If the function returns true, the handler is used.
 */
const handlers: ResourceReadHandlerMap = new Map([
    [
        (uri) => /^file:\/\/.*?\/botspeak$/i.test(uri.toString()),
        async function (this: MCPContext, uri: URL, params: HandlerParams<ReadResourceRequest>): Promise<Resource[]> {

            const { request } = params;
            const encodedPath = /^file:\/\/(.*?)\/botspeak$/.exec(request.params.uri);
            const path = decodePathFromBase64(encodedPath[1]);

            const botspeakResponse = await this.fetch<Response>(combine(path, "content?format=botspeak"), {}, true);

            const text = await botspeakResponse.text();

            return [{
                uri: request.params.uri,
                mimeType: botspeakResponse.headers.get("Content-Type"),
                text,
            }];
        }
    ],
    [
        // handle any file based protocol with default handlers
        (uri) => /^file:$/i.test(uri.protocol),
        async function (this: MCPContext, uri: URL, params: HandlerParams<ReadResourceRequest>): Promise<Resource[]> {

            const { request } = params;

            const resources: Resource[] = [];

            if (/^file:\/\//i.test(request.params.uri)) {

                const path = decodePathFromBase64(request.params.uri.replace(/^file:\/\//i, ""));

                if (/\/content$/i.test(uri.pathname)) {

                    const result = await this.fetch<Response>(combine(path, "contentStream"), <any>{
                        responseType: "arraybuffer",
                    }, true);


                    const mimeType = result.headers.get("Content-Type");

                    if (mimeType === "text/plain") {

                        const text = await result.text();

                        resources.push({
                            uri: request.params.uri,
                            mimeType,
                            text,
                        });

                    } else {

                        const buffer = await result.arrayBuffer();

                        resources.push({
                            uri: request.params.uri,
                            mimeType: mimeType || "application/octet-stream",
                            blob: Buffer.from(buffer).toString("base64"),
                        });
                    }

                } else {

                    const result = await this.fetch<Response>(path);

                    resources.push({
                        uri: request.params.uri,
                        mimeType: "application/json",
                        text: JSON.stringify(result, null, 2),
                    });
                }
            }

            if (resources.length < 1) {

                resources.push({
                    uri: request.params.uri,
                    text: `Could not read file ${uri.host}`,
                    isError: true,
                });
            }

            return resources;
        },
    ],
]);
