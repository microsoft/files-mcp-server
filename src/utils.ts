import { AudioContent, BlobResourceContents, ImageContent, TextContent } from "@modelcontextprotocol/sdk/types.js";
import { GenericPagedResponse, HandlerParams, ValidCallToolContent, ValidCallToolResult } from "./types.js";

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

export function encodePathToBase64(path: string): string {

    if (stringIsNullOrEmpty(path)) {
        return path;
    }

    return Buffer.from(path).toString("base64").replace(/=$/i, "").replace("/", "_").replace("+", "-");
}

export function decodePathFromBase64(base64: string): string {

    return Buffer.from(base64.replace("-", "+").replace("_", "/").concat("="), "base64").toString("utf8");
}

export function parseNextCursor(cursor: string): string {
    return cursor;
}

export interface GetNextCursorOptions {
    encode: boolean;
    includeDelta: boolean;
}

export function getNextCursor(result: GenericPagedResponse, options?: Partial<GetNextCursorOptions>): [string | undefined, boolean] {

    let nextCursor;
    let isDelta = false;

    const { encode, includeDelta } = {
        encode: true,
        includeDelta: false,
        ...options,
    };

    if (result["@odata.nextLink"]) {

        // we first page through this result set       
        nextCursor = result["@odata.nextLink"];

    } else if (includeDelta && result["@odata.deltaLink"]) {

        isDelta = true;
        // otherwise we send the token to get the next delta response
        nextCursor = result["@odata.deltaLink"];
    }

    if (encode) {
        nextCursor = encodePathToBase64(nextCursor);
    }

    return [nextCursor, isDelta];
}

export interface WithProgressOptions {
    timeout: number;
}

export async function withProgress<T>(params: HandlerParams, promise: Promise<T>, options?: WithProgressOptions) {

    const { server, request } = params;
    const progressToken = request.params._meta?.progressToken;
    let steps = 0;
    let clear;

    const { timeout } = {
        timeout: 5000,
        ...options,
    };

    const progress = () => {

        clear = setTimeout(async () => {

            await server.notification({
                method: "notifications/progress",
                params: {
                    progress: ++steps,
                    total: steps + 1,
                    progressToken,
                },
            });

            progress();

        }, timeout);
    }

    progress();

    const result = await promise;

    clearTimeout(clear);

    return result;
}
