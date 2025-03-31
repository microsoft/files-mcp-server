import { CallToolResult } from "@modelcontextprotocol/sdk/types";

export async function parseResposneToResult(response: Response): Promise<CallToolResult> {

    const responseText = await response.text();

    if (!response.ok) {
        throw Error(`(${response.status}): ${JSON.stringify(responseText)}`);
    }

    let responseData: any;

    try {
        // Try to parse as JSON
        responseData = responseText ? JSON.parse(responseText) : {};
    } catch (e) {
        // If not JSON, use the raw text
        responseData = { rawResponse: responseText };
    }

    return formatResponse(responseData);
}

export function formatResponse(value: any, type: "text" = "text"): CallToolResult {
    return {
        content: [
            {
                type,
                text: JSON.stringify(value, null, 4),
            },
        ],
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
