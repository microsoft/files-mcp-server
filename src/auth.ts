import { ConfidentialClientApplication } from "@azure/msal-node";
import { decodeKey } from "./utils.js";

function safeReadEnv(name: string) {

    if (typeof process.env[name] === "string" && process.env[name] !== null && process.env[name].length > 0) {
        return process.env[name];
    }

    throw Error(`Could not read env property ${name}`);
}

const tentantId = safeReadEnv("ODMCP_TENANT_ID");
const clientId = safeReadEnv("ODMCP_CLIENT_ID");;
const thumbprint = safeReadEnv("ODMCP_THUMBPRINT");
const privateKey = decodeKey(safeReadEnv("ODMCP_PRIVATE_KEY"));

const confidentialClient = new ConfidentialClientApplication({
    auth: {
        authority: `https://login.microsoftonline.com/${tentantId}/`,
        clientCertificate: {
            thumbprint,
            privateKey,
        },
        clientId,
    },
});

export async function getToken(): Promise<string> {

    const tokenResponse = await confidentialClient.acquireTokenByClientCredential({
        scopes: ["https://graph.microsoft.com/.default"],
    });

    return tokenResponse.accessToken;
}
