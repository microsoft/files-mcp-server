import { ReadResourceRequest, ReadResourceResult, Resource } from "@modelcontextprotocol/sdk/types";
import { MCPContext } from "../../context.js";
import { HandlerParams, ResourceReadHandlerMap, ResourceReadHandlerResult } from "../../types.js";

// this method allows multiple handlers to run and aggregates the results
// that's a good pattern, but doesn't work well with nextCursor - or we would need a compound next cursor which seems overly complicated
export async function processResourceHandlers<T extends ReadResourceRequest = ReadResourceRequest>(this: MCPContext, uri: URL, params: HandlerParams<T>, handlers: ResourceReadHandlerMap): Promise<ReadResourceResult> {

    const resourcePromises: Promise<Resource[]>[] = [];

    handlers.forEach((func, key) => {
        if (key(uri, params)) {
            resourcePromises.push(func.call(this, uri, params));
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

// this take the first handler result returned, making ordering important in the array of resource handlers
export async function processResourceHandlers_single<T extends ReadResourceRequest = ReadResourceRequest>(this: MCPContext, uri: URL, params: HandlerParams<T>, handlers: ResourceReadHandlerMap): Promise<ReadResourceResult> {

    const handler = handlers.entries().find(h => {
        return h[0].call(this, uri, params);
    });

    if (typeof handler !== "undefined") {

        const result: ResourceReadHandlerResult = await handler[1].call(this, uri, params);

        if (Array.isArray(result)) {
            
            return <ReadResourceResult>{
                uri: uri.toString(),
                contents: result,
            };

        } else {
            
            return <ReadResourceResult>{
                uri: uri.toString(),
                contents: result.resources,
                nextCursor: result.nextCursor,
            };
        }
    }

    return <ReadResourceResult>{
        contents: [{
            uri: "error://resource-not-found",
            mimeType: "application/json",
            text: JSON.stringify({ error: `Resource could not be located in common for uri ${uri.toString()}.` }),
        }],
    };
}
