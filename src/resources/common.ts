// common resources are parent ref

import { ReadResourceRequest, ReadResourceResult, Resource, ResourceTemplate } from "@modelcontextprotocol/sdk/types";
import { MCPContext } from "../context.js";
import { ResourceReadHandlerMap } from "../types.js";
import { processResourceHandlers } from "./process-resource-handlers.js";

export async function publish(this: MCPContext): Promise<(Resource | ResourceTemplate)[]> {

    return [{
        uri: "common://someid2",
        name: "test file 2",
        description: "this is a test resource 2, my first time publishing one.",
        mimeType: "application/json",
    }];
}

export async function handler(this: MCPContext, request: ReadResourceRequest): Promise<ReadResourceResult> {

    const uri = new URL(request.params.uri);

    if (!/^error:$|^common:$/i.test(uri.protocol)) {
        // filter by all the protocols this handler can accept
        // this was misrouted, maybe something else will pick it up
        return;
    }

    return processResourceHandlers.call(this, uri, request, handlers);
}

/**
 * This is a map of [function, handler] tuples. If the function returns true, the handler is used. Multiple can apply
 */
export const handlers: ResourceReadHandlerMap = new Map([
    [
        // handle any file based protocol with default handlers
        (uri) => /^common:$/i.test(uri.protocol),
        async function (this: MCPContext, uri: URL, _request: ReadResourceRequest): Promise<Resource[]> {

            const resources: Resource[] = [];

            resources.push({
                uri: uri.toString(),
                name: uri.host,
                mimeType: "text/plain",
                text: "This is a common resource",
            });

            return resources;
        },
    ],
    [
        // handle any file based protocol with default handlers
        (uri) => /^error:$/i.test(uri.protocol),
        async function (this: MCPContext, uri: URL, _request: ReadResourceRequest): Promise<Resource[]> {

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
                text: "This error indicates we were unable to locate the resource defined by the ",
            }
        ]
    ])
