import { ReadResourceRequest, ReadResourceResult, Resource, ResourceTemplate } from "@modelcontextprotocol/sdk/types";
import { MCPContext } from "../context.js";
import { HandlerParams } from "../types.js";
import { decodePathFromBase64 } from "../utils.js";

export async function publish(this: MCPContext): Promise<(Resource | ResourceTemplate)[]> {

    return [];
}

export async function handler(this: MCPContext, params: HandlerParams<ReadResourceRequest>): Promise<ReadResourceResult> {

    const { request } = params;

    const path = decodePathFromBase64(request.params.uri.replace(/list:\/\//i, ""));

    return this.fetchAndParseToResult(path);
}

