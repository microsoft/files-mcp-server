import { ReadResourceRequest, ReadResourceResult, Resource, ResourceTemplate } from "@modelcontextprotocol/sdk/types";
import { MCPContext } from "../context.js";
import { HandlerParams } from "../types.js";
import { decodePathFromBase64 } from "../utils.js";

export async function publish(this: MCPContext): Promise<(Resource | ResourceTemplate)[]> {

    return [];
}

export async function handler(this: MCPContext, params: HandlerParams<ReadResourceRequest>): Promise<ReadResourceResult> {

    const { request } = params;

    const path = decodePathFromBase64(request.params.uri.replace(/drive:\/\//i, ""));

    return this.fetch(path);
}



// resources of a drive are files, size info


// resource for listing all files /files
// resource template file content : /{file id}/content
// resource template file content : /{file id}/metadata
// resource template file content : /{file id}/formats/pdf
// resource template file content : /folders













// {
//     uri: string;           // Unique identifier for the resource
//     name: string;          // Human-readable name
//     description?: string;  // Optional description
//     mimeType?: string;     // Optional MIME type
//   }


// {
//     uriTemplate: string;   // URI template following RFC 6570 (https://www.rfc-editor.org/rfc/rfc6570)
//     name: string;          // Human-readable name for this type
//     description?: string;  // Optional description
//     mimeType?: string;     // Optional MIME type for all matching resources
//   }
