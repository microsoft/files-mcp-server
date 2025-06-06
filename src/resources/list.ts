import { ReadResourceRequest, ReadResourceResult, Resource, ResourceTemplate } from "@modelcontextprotocol/sdk/types";
import { MCPContext } from "../method-context.js";
import { ResourceReadHandlerMap } from "../types.js";
import { getDefaultResourceHandlerMapEntryFor } from "./core/default-resource-handler.js";
import { processResourceHandlers } from "./core/process-resource-handlers.js";

export async function publish(this: MCPContext): Promise<(Resource | ResourceTemplate)[]> {

    return [];
}

export async function handler(this: MCPContext<ReadResourceRequest>): Promise<ReadResourceResult> {

    const { request } = this.params;

    const uri = new URL(request.params.uri);

    if (!/^list:$/i.test(uri.protocol)) {
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
    getDefaultResourceHandlerMapEntryFor("list"),
]);

