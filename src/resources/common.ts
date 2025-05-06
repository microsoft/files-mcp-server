// common resources are parent ref

import { ReadResourceRequest, ReadResourceResult, Resource, ResourceTemplate } from "@modelcontextprotocol/sdk/types";
import { MCPContext } from "src/context";

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

    if (!/^error:$/i.test(uri.protocol)) {
        // filter by all the protocols this handler can accept
        // this was misrouted, maybe something else will pick it up
        return;
    }

    const resourcePromises: Promise<Resource[]>[] = [];

    handlers.forEach((func, key) => {
        if (key(uri)) {
            resourcePromises.push(func.call(this, uri, request));
        }
    });

    const resources = (await Promise.all(resourcePromises)).flat();

    if (resources.length < 1) {

        resources.push({
            uri: "error://resource-not-found",
            mimeType: "application/json",
            text: JSON.stringify({ error: `Resource could not be located in common for uri ${uri.toString()}.` }),
        });
    }

    return <ReadResourceResult>{
        contents: resources,
    };
}

/**
 * This is a map of [function, handler] tuples. If the function returns true, the handler is used.
 */
const handlers = new Map<(uri: URL) => boolean, (this: MCPContext, uri: URL, request: ReadResourceRequest) => Promise<Resource[]>>([
    [
        // handle any file based protocol with default handlers
        (uri) => /^error:$/i.test(uri.protocol),
        async function (this: MCPContext, uri: URL, _request: ReadResourceRequest): Promise<Resource[]> {

            const resources: Resource[] = [];

            switch (uri.host) {

                case "resource-not-found":

                    resources.push({
                        name: "resource-not-found",
                        uri: uri.toString(),
                        mimeType: "text/plain",
                        text: "This error indicates we were unable to locate the resource defined by the ",
                    });
                    break;
            }

            return resources;
        },
    ],
]);
