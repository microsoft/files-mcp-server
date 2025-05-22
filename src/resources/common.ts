import { ReadResourceRequest, ReadResourceResult, Resource, ResourceTemplate } from "@modelcontextprotocol/sdk/types";
import { MCPContext } from "../method-context.js";
import { HandlerParams, ResourceReadHandlerMap } from "../types.js";
import { processResourceHandlers } from "./core/process-resource-handlers.js";

export async function publish(this: MCPContext): Promise<(Resource | ResourceTemplate)[]> {

    return [];
}

export async function handler(this: MCPContext, params: HandlerParams<ReadResourceRequest>): Promise<ReadResourceResult> {

    const { request } = params;

    const uri = new URL(request.params.uri);

    if (!/^error:$|^common:$/i.test(uri.protocol)) {
        // filter by all the protocols this handler can accept
        // this was misrouted, maybe something else will pick it up
        return;
    }

    return processResourceHandlers.call(this, uri, params, handlers);
}

/**
 * This is a map of [function, handler] tuples. If the function returns true, the handler is used. Multiple can apply
 */
const handlers: ResourceReadHandlerMap = new Map([
    [
        // handle any file based protocol with default handlers
        (uri) => /^common:$/i.test(uri.protocol),
        async function (this: MCPContext, uri: URL, params: HandlerParams<ReadResourceRequest>): Promise<Resource[]> {

            const resources: Resource[] = [];

            resources.push({
                uri: uri.toString(),
                name: uri.host,
                mimeType: "text/plain",
                text: `This is a common resource with uri ${uri.toString()}`,
            });

            return resources;
        },
    ],
    [
        // handle any file based protocol with default handlers
        (uri) => /^error:$/i.test(uri.protocol),
        async function (this: MCPContext, uri: URL, params: HandlerParams<ReadResourceRequest>): Promise<Resource[]> {

            const resources: Resource[] = [];

            if (errorMap.has(uri.host)) {

                resources.push({
                    uri: uri.toString(),
                    name: uri.host,
                    ...errorMap.get(uri.host)
                });
            }

            return resources;
        },
    ],
]);

const errorMap = new Map<string, Resource>(
    [
        [
            "resource-not-found",
            {
                mimeType: "text/plain",
                text: "This error indicates we were unable to locate the resource defined by the uri.",
            }
        ],
        [
            "file-map-error",
            {
                mimeType: "text/plain",
                text: "This error indicates we were unable to map a file response to an appropriate resource entry.",
            }
        ]
    ])
