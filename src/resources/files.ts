import { ReadResourceRequest, ReadResourceResult, Resource, ResourceTemplate } from "@modelcontextprotocol/sdk/types";
import { MCPContext } from "../context.js";
import { processResourceHandlers_single } from "./process-resource-handlers.js";
import { GenericDeltaResponse, HandlerParams, ResourceReadHandlerMap, ResourceReadHandlerResult } from "../types.js";
import { combine } from "../utils.js";
import { getNextCursor } from "../utils.js";

export async function publish(this: MCPContext): Promise<(Resource | ResourceTemplate)[]> {
    // resources of a file are alt streams, formats, content, metadata, versions, size info
    return [{
        mimeType: "application/json",
        uri: "/files",
        name: "list_files",
        description: "Lists all of the files as resources, mapping to a unique uri supported by several resource templates."
    }];
}

export async function handler(this: MCPContext, params: HandlerParams<ReadResourceRequest>): Promise<ReadResourceResult> {

    const { request } = params;

    const uri = new URL(request.params.uri);

    if (!/^files:$/i.test(uri.protocol)) {
        // filter by all the protocols this handler can accept
        // this was misrouted, maybe something elese will pick it up
        return;
    }

    return processResourceHandlers_single.call(this, uri, params, handlers);
}

/**
 * This is a map of [function, handler] tuples. If the function returns true, the handler is used.
 */
const handlers: ResourceReadHandlerMap = new Map([
    [
        // handle any file based protocol with default handlers
        (uri) => /^files:$/i.test(uri.protocol),
        async function (this: MCPContext, uri: URL, params: HandlerParams<ReadResourceRequest>): Promise<ResourceReadHandlerResult> {

            const { session } = params;

            let requestUrl = "";

            switch (session.mode) {

                case "site":
                    // https://graph.microsoft.com/v1.0/sites/318studios.sharepoint.com,80c0b48a-973d-4586-9c73-ecd5cecdd0e6,2cbc891c-749e-46fc-be2c-e5d53d80acff/drive/root/delta
                    requestUrl = combine(session.currentContextRoot, "drive/root/delta");
                    break;

            }

            const result: GenericDeltaResponse = await this.fetchDirect(requestUrl);
            const nextCursor = getNextCursor(result);

            const resources: Resource[] = result.value.map(mapFileDeltaToResource.bind(null, session.currentContextRoot));

            if (typeof nextCursor === "undefined") {

                return [{
                    uri: `files://`,
                    mimeType: "application/json",
                    text: JSON.stringify(resources, null, 1),
                }];

            } else {

                return {
                    nextCursor,
                    resources: [{
                        uri: uri.toString(),
                        mimeType: "application/json",
                        text: JSON.stringify(resources, null, 1),
                    }],
                }
            }
        },
    ],
]);

interface fileDeltaResponse {
    "@odata.type": string;
    createdDateTime: string;
    name: string;
    folder?: {
        childCount: number;
    };
    id: string;
    parentReference: {
        driveId: string;
    }
}

/**
 * 
 * @param graphPath path starting with the first non-version node. /drives or /sites or /groups etc.
 */
export function encodeFileKey(graphPath: string): string {
    return "f!" + Buffer.from(graphPath).toString("base64").replace(/=$/i, "").replace("/", "_").replace("+", "-");
}

/**
 * 
 * @param grapthPath 
 */
export function decodeFileKey(fileKey: string): string {

    if (/^f!/i.test(fileKey)) {

        // this is the _f! format we made up for testing
        // undo the replaces in reverse order
        const s = fileKey.replace(/^f!/i, "").replace("-", "+").replace("_", "/").concat("=");

        // create a base64 buffer from that
        const buff = Buffer.from(s, "base64");

        // convert to a utf-8 string
        return buff.toString("utf8");
    }

    throw Error("decodeFileKey: format not recognized.");
}

function mapFileDeltaToResource(contextRoot: string, fileEntry: fileDeltaResponse): Resource {

    if (fileEntry["@odata.type"] === "#microsoft.graph.driveItem") {

        // contextual root
        // contextRoot/drives/{drive id}/items/{item id}

        const fileUrl = combine(contextRoot, "drives", fileEntry.parentReference.driveId, "items", fileEntry.id);
        const fileKey = encodeFileKey(fileUrl);

        return {
            uri: `file://${fileKey}`,
            name: fileEntry.name,
        };

    } else {

        return {
            uri: `error://file-map-error`,
            description: `We could not map this file entry to a suitable file resource entry. Here is the raw json we tried to process: ${JSON.stringify(fileEntry, null, 1)}`,
        };
    }
}


//    resources: files.map((file) => ({
//       uri: `gdrive:///${file.id}`,
//       mimeType: file.mimeType,
//       name: file.name,
//     })),


// @odata.type =
// '#microsoft.graph.driveItem'
// createdDateTime =
// '2019-07-01T08:44:30Z'
// fileSystemInfo =
// {createdDateTime: '2019-07-01T08:44:30Z', lastModifiedDateTime: '2025-05-15T14:09:12Z'}
// folder =
// {childCount: 4}
// id =
// '01C2OT7VN6Y2GOVW7725BZO354PWSELRRZ'
// lastModifiedDateTime =
// '2025-05-15T14:09:12Z'
// name =
// 'root'
// parentReference =
// {driveType: 'documentLibrary', driveId: 'b!ia3hbYlblEO6pBDLmIYn_5CaRyUJ-g9FnKsdJ1XZ3P7miM4vqOMsS778K12OVV81'}
// driveId =
// 'b!ia3hbYlblEO6pBDLmIYn_5CaRyUJ-g9FnKsdJ1XZ3P7miM4vqOMsS778K12OVV81'
// driveType =
// 'documentLibrary'
// [[Prototype]] =
// Object
// root =
// {}
// size =
// 33778
// webUrl =
// 'https://318studios.sharepoint.com/sites/dev2/Shared%20Documents'
