// resources of a file are alt streams, formats, content, metadata, versions, size info

import { ReadResourceRequest, ReadResourceResult, Resource, ResourceTemplate } from "@modelcontextprotocol/sdk/types";
import { MCPContext } from "../context.js";

export async function publish(this: MCPContext): Promise<(Resource | ResourceTemplate)[]> {

    return [];
}

export async function handler(this: MCPContext, request: ReadResourceRequest): Promise<ReadResourceResult> {

    const uri = new URL(request.params.uri);

    return <ReadResourceResult>{
        contents: [ {
            uri: uri.toString(),
            mimeType: "application/json",
            text: JSON.stringify({
                test: "Hello World!",
            }),
        }]
    };
}
