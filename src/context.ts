import { getToken } from "./auth.js";
import { MCPSession } from "./session.js";
import { ValidCallToolResult } from "./types.js";
import { combine, parseResponseToResult } from "./utils.js";

export interface MCPContext {
    fetch(path: string, init?: RequestInit): Promise<ValidCallToolResult>;
    fetchDirect<T>(path: string, init?: RequestInit, returnResponse?: boolean): Promise<T>;
    graphBaseUrl: string;
    graphVersionPart: string;
    getSession(): Promise<MCPSession>;
}

export async function getMethodContext(): Promise<MCPContext> {

    // context passed to all tools
    return <MCPContext>{
        graphBaseUrl: "https://graph.microsoft.com",
        graphVersionPart: "v1.0",
        async fetch(path: string, init?: RequestInit): Promise<ValidCallToolResult> {

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
        async fetchDirect<T>(path: string, init?: RequestInit, returnResponse = false): Promise<T | Response> {

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
