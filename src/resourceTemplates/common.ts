import { ListResourceTemplatesRequest, ResourceTemplate } from "@modelcontextprotocol/sdk/types";
import { MCPContext } from "../method-context.js";

export async function publish(this: MCPContext<ListResourceTemplatesRequest>): Promise<ResourceTemplate[]> {

    return <ResourceTemplate[]>[
        {
            uriTemplate: "error://{error-path}",
            name: "Provides additional information about the error codes this server returns.",
            description: "You can use these resources any time to lookup more information about errors this server returns. They will all start with the error:// protocol.",
            mimeType: "application/json",
        },
        {
            uriTemplate: "file://{file-key}",
            name: "Gets a file's metadata by its key",
            description: "Allows you to reference a site entity by key, replacing {site-key} with a valid file key. You can get a listing of file keys by listing the file resources in a library",
        },
        {
            uriTemplate: "folder://{folder-key}",
            name: "Gets a folder's metadata by its key",
            description: "Allows you to reference a folder entity by key, replacing {folder-key} with a valid sitekey.",
        },
                {
            uriTemplate: "library://{library-key}",
            name: "Gets a library's metadata by its key",
            description: "Allows you to reference a library entity by key, replacing {library-key} with a valid sitekey.",
        },
        {
            uriTemplate: "site://{site-key}",
            name: "Gets a site's metadata by its key",
            description: "Allows you to reference a site entity by key, replacing {site-key} with a valid site key.",
            mimeType: "application/json",
        },
        {
            uriTemplate: "list://{list-key}",
            name: "Gets a list's metadata by its key",
            description: "Allows you to reference a site entity bykey, replacing {list-key} with a valid site key.",
            mimeType: "application/json",
        },
        {
            uriTemplate: "listitem://{listitem-key}",
            name: "Gets a list item's metadata by its key",
            description: "Allows you to reference a site entity bykey, replacing {site-key} with a valid sitekey.",
            mimeType: "application/json",
        },
    ];
}

