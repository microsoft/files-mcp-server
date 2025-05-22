import { ReadResourceRequest, ReadResourceResult, Resource, ResourceTemplate } from "@modelcontextprotocol/sdk/types";
import { MCPContext } from "../method-context.js";
import { HandlerParams, ResourceReadHandlerMap } from "../types.js";
import { combine } from "../utils.js";
import { mapDriveItemResponseToResource } from "./core/utils.js";
import { processResourceHandlers } from "./core/process-resource-handlers.js";
import { getDefaultResourceHandlerFor } from "./core/default-resource-handler.js";

export async function publish(this: MCPContext, params: HandlerParams<ReadResourceRequest>): Promise<(Resource | ResourceTemplate)[]> {

    const { session } = params;

    const resources = [];

    // add recent files in context of drives
    if (session.mode === "consumerOD" || session.mode === "library") {

        // in the context of a drive, we can list all the files as resources - which will take a bit.
        // so instead what if we list the most recent files in that drive?
        try {
            const recentFiles = await this.fetch<any[]>(combine(session.currentContextRoot, "recent"));

            resources.push(...recentFiles.map(mapDriveItemResponseToResource));

        } catch (e) {

            // this only works for delegated so for now it will just fail
            console.error(e);
        }
    }

    return resources;
}

export async function handler(this: MCPContext, params: HandlerParams<ReadResourceRequest>): Promise<ReadResourceResult> {

    const { request } = params;

    const uri = new URL(request.params.uri);

    if (!/^library:$/i.test(uri.protocol)) {
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
    getDefaultResourceHandlerFor("library"),
]);
