// resources of a site are libraries and lists, size info

import { Resource, ReadResourceResult, ReadResourceRequest } from "@modelcontextprotocol/sdk/types.js";
import { MCPContext } from "../context.js";
import { HandlerParams } from "../types.js";

// resource template file content : /lists/{file id}/content
// resource template file content : /{file id}/metadata
// resource template file content : /{file id}/formats/pdf

export async function publish(this: MCPContext): Promise<Resource[]> {

    return [
        {
            uri: "files://list",
            name: "List Files",
            description: "Allows you to list all of the files in this site's default document library.",
            mimeType: "application/json",
        }
    ];
}

export async function handler(this: MCPContext, params: HandlerParams<ReadResourceRequest>): Promise<ReadResourceResult> {

    const { request } = params;

    const uri = new URL(request.params.uri);

    return <ReadResourceResult>{
        contents: [
            {
                uri: uri.toString(),
                mimeType: "application/json",
                text: JSON.stringify({
                    test: `Hello World! ${uri.toString}`,
                }),
            }
        ]
    };
}
