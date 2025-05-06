import { ReadResourceRequest, ReadResourceResult, Resource } from "@modelcontextprotocol/sdk/types";
import { MCPContext } from "../context.js";
import { ResourceReadHandlerMap } from "../types.js";

export async function processResourceHandlers(this: MCPContext, uri: URL, request: ReadResourceRequest, handlers: ResourceReadHandlerMap): Promise<ReadResourceResult> {

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
