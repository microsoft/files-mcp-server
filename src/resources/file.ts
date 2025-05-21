import { ReadResourceRequest, ReadResourceResult, Resource, ResourceTemplate } from "@modelcontextprotocol/sdk/types";
import { MCPContext } from "../context.js";
import { processResourceHandlers } from "./core/process-resource-handlers.js";
import { HandlerParams, ResourceReadHandlerMap } from "../types.js";
import { combine, decodePathFromBase64 } from "../utils.js";

export async function publish(this: MCPContext): Promise<(Resource | ResourceTemplate)[]> {
    // resources of a file are alt streams, formats, content, metadata, versions, size info
    return [];
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
        // handle any file based protocol with default handlers
        (uri) => /^file:$/i.test(uri.protocol),
        async function (this: MCPContext, uri: URL, params: HandlerParams<ReadResourceRequest>): Promise<Resource[]> {

            const { request } = params;

            const resources: Resource[] = [];

            if (/^file:\/\//i.test(request.params.uri)) {

                const path = decodePathFromBase64(request.params.uri.replace(/^file:\/\//i, ""));

                if (/\/content$/i.test(uri.pathname)) {

                    const result = await this.fetchDirect<Response>(combine(path, "contentStream"), <any>{
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

                    const result = await this.fetchDirect<Response>(path);

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
