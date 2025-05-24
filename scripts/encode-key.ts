function encodeKey(key: string): string {
    return Buffer.from(key).toString('base64');
}

const privateKey = `-----BEGIN RSA PRIVATE KEY-----
{{YOUR KEY HERE}}
-----END RSA PRIVATE KEY-----
`;

console.log(encodeKey(privateKey));
