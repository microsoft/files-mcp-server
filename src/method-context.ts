import { Request } from "@modelcontextprotocol/sdk/types.js";
import { GenericPagedResponse, HandlerParams } from "./types.js";
import { combine, decodePathFromBase64, getNextCursor } from "./utils.js";

export interface MCPContext<RequestParamsType extends Request = Request> {
    fetch<T>(path: string, init?: RequestInit, returnResponse?: boolean, augment?: (vals: T[]) => T[]): Promise<T>;
    fetchAndAggregate<T = any>(path: string, init?: RequestInit, augment?: (vals: T[]) => T[]): Promise<T[]>
    graphBaseUrl: string;
    graphVersionPart: string;
    params: HandlerParams<RequestParamsType>,
}

export async function getMethodContext(): Promise<MCPContext> {

    // context passed to all tool/resource handlers
    return <MCPContext>{
        graphBaseUrl: "https://graph.microsoft.com",
        graphVersionPart: "v1.0",
        async fetchAndAggregate<T = any>(this: MCPContext, path: string, init?: RequestInit, augment?: (vals: T[]) => T[]): Promise<T[]> {

            const resultAggregate = [];

            let response = await this.fetch<GenericPagedResponse>(path, init);

            let [nextCursor] = getNextCursor(response);

            resultAggregate.push(...response.value);

            while (typeof nextCursor !== "undefined") {

                response = await this.fetch<GenericPagedResponse>(decodePathFromBase64(nextCursor));
                resultAggregate.push(...response.value);
                [nextCursor] = getNextCursor(response);
            }

            return typeof augment === "function" ? augment(resultAggregate) : resultAggregate;
        },
        async fetch<T>(this: MCPContext, path: string, init?: RequestInit, returnResponse = false, augment?: (vals: T) => T): Promise<T | Response> {

            const token = this.params.token!;

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

            const json = await response.json();

            return typeof augment === "function" ? augment(json) : json;
        },
        params: {},
    }
}
