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

    return {
        content: [
            {
                type: "text",
                text: JSON.stringify(responseData, null, 4),
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
