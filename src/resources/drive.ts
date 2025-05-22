import { ReadResourceRequest, ReadResourceResult, Resource, ResourceTemplate } from "@modelcontextprotocol/sdk/types";
import { MCPContext } from "../context.js";
import { HandlerParams } from "../types.js";
import { combine, decodePathFromBase64 } from "../utils.js";
import { mapDriveItemResponseToResource } from "./core/utils.js";

export async function publish(this: MCPContext, params: HandlerParams<ReadResourceRequest>): Promise<(Resource | ResourceTemplate)[]> {

    const { session } = params;

    const resources = [];

    // add recent files in context of drives
    if (session.mode === "consumerOD" || session.mode === "drive") {

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

    const path = decodePathFromBase64(request.params.uri.replace(/drive:\/\//i, ""));

    return this.fetchAndParseToResult(path);
}
