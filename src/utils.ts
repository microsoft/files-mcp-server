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
