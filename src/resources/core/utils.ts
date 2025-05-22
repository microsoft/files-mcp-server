import { Resource } from "@modelcontextprotocol/sdk/types";
import { encodePathToBase64 } from "../../utils.js";

export function mapDriveItemResponseToResource(driveItemResponse: { id: string, name: string, file: { mimeType: string }, parentReference: { driveId: string, id: string } }): Resource {

    const fileBase = `/drives/${driveItemResponse.parentReference.driveId}/items/${driveItemResponse.id}`;

    return {
        uri: `file://${encodePathToBase64(fileBase)}`,
        name: driveItemResponse.name,
        mimeType: driveItemResponse.file.mimeType,
    }
}
