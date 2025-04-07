# Files MCP Server

This library provides an MCP server for local testing with any client that supports the [Model Context Protocol](https://modelcontextprotocol.io/introduction).

## Install

1. Clone this repository locally (will update once we are published to NPM)
2. In your MCP client of choice add this server using `npx -y {ABSOLUTE LOCAL PATH}\files-mcp-server`
3. Edit the server configuration to include the require env vars
   ```json
   {
    "mcp": {
        "servers": {
            "my-mcp-server-1da66260": {
                    "type": "stdio",
                    "command": "npx",
                    "args": [
                        "-y",
                        "D:\\github\\files-mcp-server"
                    ],
                    "env": {
                        "ODMCP_TENANT_ID": "{TENANT_ID}",
                        "ODMCP_CLIENT_ID": "{CLIENT_ID}",
                        "ODMCP_THUMBPRINT": "{THUMBPRINT}",
                        "ODMCP_PRIVATE_KEY": "{BASE64_ENCODED_PRIVATE_KEY}",
                    },
                },
             }
        }
   }
   ```
4. Begin interacting with the server

## Local Testing

Once you have installed the server locally you can make updates in the project and restart it from the client to discover/test new tools.

## Encode private key

To help you base64 encode your certificate's private key you can update the file /src/encodekey.ts with your private key and run `npm run encode-key`. The base64 encoded key will be output on the commandline.

> Do NOT check in updates to the encodekey.ts file including your private key information 🙂.

## Trademarks

This project may contain trademarks or logos for projects, products, or services. Authorized use of Microsoft trademarks or logos is subject to and must follow Microsoft’s Trademark & Brand Guidelines. Use of Microsoft trademarks or logos in modified versions of this project must not cause confusion or imply Microsoft sponsorship. Any use of third-party trademarks or logos are subject to those third-party’s policies.

## Usage

**PLEASE USE THIS ONLY IN A DEVELOPER ENVIRONMENT — NOT FOR PRODUCTION**

> For more information, see the [Microsoft identity platform security guidance](https://learn.microsoft.com/en-us/entra/identity-platform/secure-least-privileged-access).
