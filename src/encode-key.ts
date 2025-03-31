import { encodeKey } from "./utils.js";

const privateKey = `-----BEGIN RSA PRIVATE KEY-----
{{YOUR KEY HERE}}
-----END RSA PRIVATE KEY-----
`;

console.log(encodeKey(privateKey));
