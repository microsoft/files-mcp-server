import { getToken } from "./auth.js";
import { ValidCallToolResult, DynamicToolMode } from "./types.js";
import { combine, parseResponseToResult } from "./utils.js";

export interface MCPContext {
    fetch(path: string, init?: RequestInit): Promise<ValidCallToolResult>;
    graphBaseUrl: string;
    graphVersionPart: string;
    mode: DynamicToolMode;
    currentContextRoot: string;
}

export async function getCurrentContext(): Promise<MCPContext> {

    // we would need to determine the current context root from the entity we are using as a base (site, list/library/, folder, file)


    // context passed to all tools
    return <MCPContext>{
        graphBaseUrl: "https://graph.microsoft.com",
        graphVersionPart: "v1.0",
        mode: "site",
        currentContextRoot: "https://graph.microsoft.com/sites/{site id}",
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
    }
}
