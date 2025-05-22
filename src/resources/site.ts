// resources of a site are libraries and lists, size info

import { Resource, ReadResourceResult, ReadResourceRequest } from "@modelcontextprotocol/sdk/types.js";
import { MCPContext } from "../context.js";
import { HandlerParams } from "../types.js";
import { decodePathFromBase64 } from "../utils.js";

// resource template file content : /lists/{file id}/content
// resource template file content : /{file id}/metadata
// resource template file content : /{file id}/formats/pdf

export async function publish(this: MCPContext): Promise<Resource[]> {

    return [];
}

export async function handler(this: MCPContext, params: HandlerParams<ReadResourceRequest>): Promise<ReadResourceResult> {

    const { request } = params;

    const path = decodePathFromBase64(request.params.uri.replace(/site:\/\//i, ""));

    return this.fetchAndParseToResult(path);
}
