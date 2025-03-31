const privateKey = `-----BEGIN RSA PRIVATE KEY-----
-----END RSA PRIVATE KEY-----
`;

var msalInit = {
    auth: {
        authority: "https://login.microsoftonline.com/{tenant-id}/",
        clientCertificate: {
            thumbprint: "{thumbprint}",
            privateKey: privateKey,
        },
        clientId: "{client id}",
    }
}

export const msal = {
    init: msalInit,
    scopes: ["https://graph.microsoft.com/.default"]
};

