import { ReadResourceRequest, ReadResourceResult, Resource, ResourceTemplate } from "@modelcontextprotocol/sdk/types";
import { MCPContext } from "../context.js";
import { processResourceHandlers } from "./process-resource-handlers.js";
import { ResourceReadHandlerMap } from "../types.js";

export async function publish(this: MCPContext): Promise<(Resource | ResourceTemplate)[]> {
    // resources of a file are alt streams, formats, content, metadata, versions, size info
    return [];
}

export async function handler(this: MCPContext, request: ReadResourceRequest): Promise<ReadResourceResult> {

    const uri = new URL(request.params.uri);

    if (!/^file:$/i.test(uri.protocol)) {
        // filter by all the protocols this handler can accept
        // this was misrouted, maybe something elese will pick it up
        return;
    }

    return processResourceHandlers.call(this, uri, request, handlers);
}

/**
 * This is a map of [function, handler] tuples. If the function returns true, the handler is used.
 */
const handlers: ResourceReadHandlerMap = new Map([
    [
        // handle any file based protocol with default handlers
        (uri) => /^file:$/i.test(uri.protocol),
        async function (this: MCPContext, uri: URL, _request: ReadResourceRequest): Promise<Resource[]> {

            const resources = [
                {
                    name: "My Second file File.txt",
                    uri: uri.toString(),
                    mimeType: "text/plain",
                    text: `Hello I am a file resource:${uri.toString()} from another .`,
                },
                {
                    name: "My First File.txt",
                    uri: uri.toString(),
                    mimeType: "text/plain",
                    text: `Hello I am a file resource:${uri.toString()}.`,
                },
            ];

            return resources;
        },
    ],
    [
        // testing multi-handlers
        (uri) => true,
        async function (this: MCPContext, uri: URL, _request: ReadResourceRequest): Promise<Resource[]> {

            const resources = [
                {
                    name: "My third file File.txt",
                    uri: uri.toString(),
                    mimeType: "text/plain",
                    text: `Hello I am a file resource:${uri.toString()} from second handler tuple.`,
                },
            ];

            return resources;
        },
    ],
]);

