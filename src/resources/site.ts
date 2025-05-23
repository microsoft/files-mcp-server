// resources of a site are libraries and lists, size info

import { Resource, ReadResourceResult, ReadResourceRequest } from "@modelcontextprotocol/sdk/types.js";
import { MCPContext } from "../method-context.js";
import { HandlerParams, ResourceReadHandlerMap } from "../types.js";
import { processResourceHandlers } from "./core/process-resource-handlers.js";
import { getDefaultResourceHandlerMapEntryFor } from "./core/default-resource-handler.js";

// resource template file content : /lists/{file id}/content
// resource template file content : /{file id}/metadata
// resource template file content : /{file id}/formats/pdf

export async function publish(this: MCPContext): Promise<Resource[]> {

    return [];
}

export async function handler(this: MCPContext, params: HandlerParams<ReadResourceRequest>): Promise<ReadResourceResult> {

    const { request } = params;

    const uri = new URL(request.params.uri);

    if (!/^site:$/i.test(uri.protocol)) {
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
    getDefaultResourceHandlerMapEntryFor("site"),
]);
