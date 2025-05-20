// resources of a site are libraries and lists, size info

import { ResourceTemplate } from "@modelcontextprotocol/sdk/types";
import { MCPContext } from "src/context";

// resource template file content : /lists/{file id}/content
// resource template file content : /{file id}/metadata
// resource template file content : /{file id}/formats/pdf

export async function publish(this: MCPContext): Promise<ResourceTemplate[]> {

    return <ResourceTemplate[]>[];
}
