import { encodeKey } from "./auth.js";

const privateKey = `-----BEGIN RSA PRIVATE KEY-----
{{YOUR KEY HERE}}
-----END RSA PRIVATE KEY-----
`;

console.log(encodeKey(privateKey));
