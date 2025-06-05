import { AudioContent, BlobResourceContents, ImageContent, TextContent } from "@modelcontextprotocol/sdk/types.js";
import { ValidCallToolContent, ValidCallToolResult } from "../../types.js";

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
export function formatCallToolResult(value: any, mimeType: string = "text/json", uriStr?: string): ValidCallToolResult {

    let resultContent: ValidCallToolContent[] = [];

    if (/text|json/i.test(mimeType)) {

        resultContent.push(
            <TextContent>{
                type: "text",
                text: JSON.stringify(value, null, 2),
                mimeType,
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