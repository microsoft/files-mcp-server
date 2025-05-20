import { ResourceTemplate } from "@modelcontextprotocol/sdk/types";
import { MCPContext } from "src/context";

export async function publish(this: MCPContext): Promise<ResourceTemplate[]> {

    return <ResourceTemplate[]>[
        {
            uriTemplate: "error://{error-path}",
            name: "Provides additional information about the error codes this server returns.",
            description: "You can use these resources any time to lookup more information about errors this server returns. They will all start with the error:// protocol.",
            mimeType: "application/json",
        },
        {
            uriTemplate: "file://{file-id}",
            name: "Gets a file's metadata by its id",
            description: "Allows you to reference a site entity by id, replacing {site-id} with a valid site id. You can get a listing of site ids from ",
        },
        {
            uriTemplate: "file://{file-id}/content",
            name: "Gets a file's content by its id",
            description: "Allows you to reference a site entity by id, replacing {site-id} with a valid site id. You can get a listing of site ids from ",
        },
                {
            uriTemplate: "folder://{folder-id}",
            name: "Gets a file's metadata by its id",
            description: "Allows you to reference a site entity by id, replacing {site-id} with a valid site id. You can get a listing of site ids from ",
        },
        {
            uriTemplate: "folder://{folder-id}/files",
            name: "Gets a folder's content by its id",
            description: "Allows you to reference a site entity by id, replacing {site-id} with a valid site id. You can get a listing of site ids from ",
        },
        {
            uriTemplate: "site://{site-id}",
            name: "Gets a site by its id",
            description: "Allows you to reference a site entity by id, replacing {site-id} with a valid site id. You can get a listing of site ids from ",
            mimeType: "application/json",
        },
        {
            uriTemplate: "site://{site-id}/files",
            name: "Gets a listing of all the files in this site's default document library. If the currect mode is 'site' use the current context url as the site id, or leave out the id.",
            description: "Allows you to reference file resources and the available options they expose.",
            mimeType: "application/json",
        }
    ];
}

