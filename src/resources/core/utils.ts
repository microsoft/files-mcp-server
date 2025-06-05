import { Resource } from "@modelcontextprotocol/sdk/types";
import { encodePathToBase64 } from "../../utils.js";

export function mapDriveItemResponseToResource(driveItemResponse: { id: string, name: string, file: { mimeType: string }, parentReference: { driveId: string, id: string } }): Resource {

    return {
        uri: createDriveItemResourceKey(driveItemResponse),
        name: driveItemResponse.name,
        mimeType: driveItemResponse.file.mimeType,
    }
}

export function createDriveItemResourceKey(driveItemResponse: { id: string, name: string, file: { mimeType: string }, parentReference: { driveId: string, id: string } }): string {

    const fileBase = `/drives/${driveItemResponse.parentReference.driveId}/items/${driveItemResponse.id}`;

    return `file://${encodePathToBase64(fileBase)}`;
}

export function createSiteResourceKey(siteResponse: { id: string }): string {

    const fileBase = `/sites/${siteResponse.id}`;

    return `site://${encodePathToBase64(fileBase)}`;
}

