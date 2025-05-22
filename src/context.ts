import { getToken } from "./auth.js";
import { MCPSession } from "./session.js";
import { GenericPagedResponse, ValidCallToolResult } from "./types.js";
import { combine, decodePathFromBase64, formatCallToolResult, getNextCursor, parseResponseToResult } from "./utils.js";

export interface MCPContext {
    fetchAndParseToResult(path: string, init?: RequestInit): Promise<ValidCallToolResult>;
    fetch<T>(path: string, init?: RequestInit, returnResponse?: boolean): Promise<T>;
    fetchAndAggregate(path: string, init?: RequestInit): Promise<ValidCallToolResult>
    graphBaseUrl: string;
    graphVersionPart: string;
    getSession(): Promise<MCPSession>;
}

export async function getMethodContext(): Promise<MCPContext> {

    // context passed to all tools
    return <MCPContext>{
        graphBaseUrl: "https://graph.microsoft.com",
        graphVersionPart: "v1.0",
        async fetchAndParseToResult(path: string, init?: RequestInit): Promise<ValidCallToolResult> {

            const token = await getToken(this);

            const absPath = combine(this.graphBaseUrl, this.graphVersionPart, path);

            console.log(`FETCH PATH: ${absPath}`);

            const response = await fetch(absPath, {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`,
                },
                ...init,
            });

            return parseResponseToResult(response);
        },
        async fetchAndAggregate(this: MCPContext, path: string, init?: RequestInit): Promise<ValidCallToolResult> {

            const absPath = combine(this.graphBaseUrl, this.graphVersionPart, path);

            const resultAggregate = [];

            let response = await this.fetch<GenericPagedResponse>(absPath);

            let [nextCursor] = getNextCursor(response);

            resultAggregate.push(...response.value);

            while (typeof nextCursor !== "undefined") {

                response = await this.fetch<GenericPagedResponse>(decodePathFromBase64(nextCursor));
                resultAggregate.push(...response.value);
                [nextCursor] = getNextCursor(response);
            }

            return formatCallToolResult(resultAggregate, "application/json");
        },
        async fetch<T>(path: string, init?: RequestInit, returnResponse = false): Promise<T | Response> {

            const token = await getToken(this);

            const absPath = /https?:\/\//i.test(path) ? path : combine(this.graphBaseUrl, this.graphVersionPart, path);

            console.log(`FETCH PATH: ${absPath}`);

            const response = await fetch(absPath, {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`,
                },
                ...init,
            });

            if (!response.ok) {
                const txt = await response.text();
                throw Error(`Error: ${txt}`);
            }

            if (returnResponse) {
                return response;
            }

            return response.json();
        },
    }
}
