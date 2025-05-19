import { AudioContent, BlobResourceContents, ImageContent, TextContent } from "@modelcontextprotocol/sdk/types.js";
import { GenericDeltaResponse, ValidCallToolContent, ValidCallToolResult } from "./types.js";

// TODO: structured error response isError: true,


export async function parseResponseToResult(response: Response): Promise<ValidCallToolResult> {

    if (!response.ok) {
        throw Error(`(${response.status}): ${JSON.stringify(await response.text())}`);
    }

    let responseData: any;
    let mimeType = response.headers.get("Content-Type");

    try {

        if (/text|json/i.test(mimeType)) {

            const responseText = await response.text();
            // Try to parse as JSON
            responseData = responseText ? JSON.parse(responseText) : {};







        } else {

            const buffer = await response.arrayBuffer();
            responseData = Buffer.from(buffer).toString("base64");
        }

    } catch (e) {

        console.error(e);

        // If not JSON, use the raw text
        responseData = { rawResponse: `Error: ${e}` };
    }

    return formatCallToolResult(responseData, mimeType);
}

// https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/MIME_types/Common_types
export function formatCallToolResult(value: any, mimeType: string = "text/json"): ValidCallToolResult {

    let resultContent: ValidCallToolContent[] = [];

    if (/text|json/i.test(mimeType)) {

        resultContent.push(
            <TextContent>{
                type: "text",
                text: JSON.stringify(value, null, 2),
            });

    } else if (/image\//i.test(mimeType)) {

        resultContent.push(
            <ImageContent>{
                type: "image",
                data: value,
                mimeType: mimeType,
            });

    } else if (/audio\//i.test(mimeType)) {

        resultContent.push(
            <AudioContent>{
                type: "audio",
                data: value,
                mimeType,
            });

    } else {

        resultContent.push(
            <BlobResourceContents>{
                type: "resource",
                mimeType,
                blob: value,
            });
    }

    return <ValidCallToolResult>{
        role: "user",
        content: resultContent,
    };
}

export function encodeKey(key: string): string {
    return Buffer.from(key).toString('base64');
}

export function decodeKey(key: string): string {
    return Buffer.from(key, 'base64').toString('ascii');
}

/**
 * Combines an arbitrary set of paths ensuring and normalizes the slashes
 *
 * @param paths 0 to n path parts to combine
 */
export function combine(...paths: (string | null | undefined)[]): string {

    return paths
        .filter(path => !stringIsNullOrEmpty(path))
        .map(path => path.replace(/^[\\|/]/, "").replace(/[\\|/]$/, ""))
        .join("/")
        .replace(/\\/g, "/");
}

/**
 * Determines if a string is null or empty or undefined
 *
 * @param s The string to test
 */
export function stringIsNullOrEmpty(s: string | undefined | null): s is undefined | null | "" {
    return typeof s === "undefined" || s === null || s.length < 1;
}

export function getNextCursor(result: GenericDeltaResponse): string | undefined {

    let nextCursor;

    if (result["@odata.nextLink"]) {

        // we first page through this result set
        const temp = new URL(result["@odata.nextLink"]);
        if (temp.searchParams.has("token")) {
            nextCursor = temp.searchParams.get("token");
        }

    } else if (result["@odata.deltaLink"]) {

        // otherwise we send the token to get the next delta response
        const temp = new URL(result["@odata.deltaLink"]);
        if (temp.searchParams.has("token")) {
            nextCursor = temp.searchParams.get("token");
        }
    }

    return nextCursor;
}
