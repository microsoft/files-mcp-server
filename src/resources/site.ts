// resources of a site are libraries and lists, size info

import { Resource, ReadResourceResult, ReadResourceRequest } from "@modelcontextprotocol/sdk/types";
import { MCPContext } from "src/context";

// resource template file content : /lists/{file id}/content
// resource template file content : /{file id}/metadata
// resource template file content : /{file id}/formats/pdf

export async function publish(this: MCPContext): Promise<Resource[]> {

    return [{
        uri: "site://someid",
        name: "test file 1",
        description: "this is a test resource, my first time publishing one.",
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
