# Files MCP Server

This library provides an MCP server for local testing with any client that supports the [Model Context Protocol](https://modelcontextprotocol.io/introduction).

It is an http server using delegated authentication to access your environment.

## Scopes

This sample users the *Files.ReadWrite.All* and *Sites.Read.All* delegated Graph scopes.

## Install

1. Clone this repository locally (will update once we are published to NPM)
2. In your MCP client of choice add this server using `npx -y {ABSOLUTE LOCAL PATH}\files-mcp-server`
3. Edit the server configuration to include the require env vars
   ```json
{
    "mcp": {
        "servers": {
            "files-localhost-debug": {
                "type": "http",
                "url": "http://localhost:3001/mcp",
            }
        }
    }
}
   ```
4. Begin interacting with the server

## Local Development

1. Create a .env file

```
ODMCP_TENANT_ID="{TENANT_ID}"
ODMCP_CLIENT_ID="{CLIENT_ID}"
```
2. Hit F5 to start the server
3. [Inspector](https://github.com/modelcontextprotocol/inspector) works well for testing the MCP server itself or use your LLM Client of choice!

> To test the delegated authentication flow as of June 5 Visual Studio Code insiders supports the [protected resource flow](https://datatracker.ietf.org/doc/html/rfc9728).

## Trademarks

This project may contain trademarks or logos for projects, products, or services. Authorized use of Microsoft trademarks or logos is subject to and must follow Microsoft’s Trademark & Brand Guidelines. Use of Microsoft trademarks or logos in modified versions of this project must not cause confusion or imply Microsoft sponsorship. Any use of third-party trademarks or logos are subject to those third-party’s policies.

## Usage

**PLEASE USE THIS ONLY IN A DEVELOPER ENVIRONMENT — NOT FOR PRODUCTION**

> For more information, see the [Microsoft identity platform security guidance](https://learn.microsoft.com/en-us/entra/identity-platform/secure-least-privileged-access).
