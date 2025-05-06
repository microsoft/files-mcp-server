// resources of a site are libraries and lists, size info

import { ResourceTemplate } from "@modelcontextprotocol/sdk/types";
import { MCPContext } from "src/context";


// resource template file content : /lists/{file id}/content
// resource template file content : /{file id}/metadata
// resource template file content : /{file id}/formats/pdf

export async function publish(this: MCPContext): Promise<ResourceTemplate[]> {

    return <ResourceTemplate[]>[{
        uriTemplate: "site://{site-id}",
        name: "Gets a site by its id",
        description: "Allows you to reference a site entity by id, replacing {site-id} with a valid site id. You can get a listing of site ids from ",
        mimeType: "application/json",
    },
    {
        uriTemplate: "file://{file-id}",
        name: "Get a file from this site by id",
        description: "Gets a file's information by file id for files within this site. You can replace {file-id} with a valid file id.",
    }];
}
