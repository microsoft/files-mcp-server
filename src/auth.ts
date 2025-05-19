import { ConfidentialClientApplication } from "@azure/msal-node";
import { combine, decodeKey, stringIsNullOrEmpty } from "./utils.js";
import { RequestHandler } from "express";
import { MCPContext } from "./context.js";

function safeReadEnv(name: string): string {

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

export async function getToken(context: MCPContext): Promise<string> {

    const tokenResponse = await confidentialClient.acquireTokenByClientCredential({
        scopes: [combine(context.graphBaseUrl, ".default")],
    });

    return tokenResponse.accessToken;
}

export function requireAuthentication(wrapped: RequestHandler): RequestHandler {

    return async (req, res) => {

        // TODO: Waiting for client support to test new auth flows
        // const unauthorizedResponse = () => {
        //     res.set("Access-Control-Expose-Headers", "WWW-Authenticate");
        //     res.set("WWW-Authenticate", `Bearer authorization="https://login.microsoftonline.com/common/oauth2/v2.0/authorize", resource="http://localhost:3001"`);
        //     res.status(401).send();
        // }

        // if (req.headers.authorization) {

        //     const parts = req.headers.authorization.split(" ");

        //     // TODO: validate auth here
        //     if (!/bearer/i.test(parts[0]) || parts[1] !== "123") {
        //         unauthorizedResponse();
        //     } else {
        //         wrapped(req, res, null);
        //     }
        // }

        // unauthorizedResponse();

        return wrapped(req, res, null);
    }
}



// HTTP/1.1 200 OK
// Content-Type: application/json

// {
//  "issuer":
//    "https://server.example.com",
//  "authorization_endpoint":
//    "https://server.example.com/authorize",
//  "token_endpoint":
//    "https://server.example.com/token",
//  "token_endpoint_auth_methods_supported":
//    ["client_secret_basic", "private_key_jwt"],
//  "token_endpoint_auth_signing_alg_values_supported":
//    ["RS256", "ES256"],
//  "userinfo_endpoint":
//    "https://server.example.com/userinfo",
//  "jwks_uri":
//    "https://server.example.com/jwks.json",
//  "registration_endpoint":
//    "https://server.example.com/register",
//  "scopes_supported":
//    ["openid", "profile", "email", "address",
//     "phone", "offline_access"],
//  "response_types_supported":
//    ["code", "code token"],
//  "service_documentation":
//    "http://server.example.com/service_documentation.html",
//  "ui_locales_supported":
//    ["en-US", "en-GB", "en-CA", "fr-FR", "fr-CA"]
// }





