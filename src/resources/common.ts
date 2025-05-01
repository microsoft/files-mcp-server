// common resources are parent ref

import { ReadResourceRequest, ReadResourceResult, Resource, ResourceTemplate } from "@modelcontextprotocol/sdk/types";
import { MCPContext } from "src/context";

export async function publish(this: MCPContext): Promise<(Resource | ResourceTemplate)[]> {

    return [{
        uri: "common://someid2",
        name: "test file 2",
        description: "this is a test resource 2, my first time publishing one.",
        mimeType: "application/json",
    }];
}

export async function handler(this: MCPContext, request: ReadResourceRequest): Promise<ReadResourceResult> {

    const uri = new URL(request.params.uri);

    return <ReadResourceResult>{
        contents: [
            {
                uri: uri.toString(),
                mimeType: "application/json",
                text: JSON.stringify({
                    test: "Hello World!",
                }),
            }
        ]
    };
}
