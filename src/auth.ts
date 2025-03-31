import { ConfidentialClientApplication } from "@azure/msal-node";
import { decodeKey } from "./utils.js";

const tentantId = process.env.ODMCP_TENANT_ID;
const clientId = process.env.ODMCP_CLIENT_ID;
const thumbprint = process.env.ODMCP_THUMBPRINT;
const privateKey = decodeKey(process.env.ODMCP_PRIVATE_KEY);

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
