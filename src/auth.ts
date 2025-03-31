import { ConfidentialClientApplication } from "@azure/msal-node";
import { combine, decodeKey, stringIsNullOrEmpty } from "./utils.js";
import { ToolContext } from "./types.js";

function safeReadEnv(name: string): string {

    console.error("here2: " + name);

    if (!stringIsNullOrEmpty(process.env[name])) {
        return process.env[name];
    }

    throw Error(`Could not read env property ${name}`);
}

const confidentialClient = new ConfidentialClientApplication({
    auth: {
        authority: `https://login.microsoftonline.com/${safeReadEnv("ODMCP_TENANT_ID")}/`,
        clientCertificate: {
            thumbprint: safeReadEnv("ODMCP_THUMBPRINT"),
            privateKey: decodeKey(safeReadEnv("ODMCP_PRIVATE_KEY")),
        },
        clientId: safeReadEnv("ODMCP_CLIENT_ID"),
    },
});

export async function getToken(context: ToolContext): Promise<string> {

    const tokenResponse = await confidentialClient.acquireTokenByClientCredential({
        scopes: [combine(context.graphBaseUrl, ".default")],
    });

    return tokenResponse.accessToken;
}
