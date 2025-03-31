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

## Contributing

You can easily contribute new tools in the `/src/tools` folder by adding a module and following the patter:

```TS
export const name = "{NAME OF THE TOOL}";

export const description = "{DESCRIPTION OF THE TOOL}";

export const inputSchema = {}; // ANY REQUIRED INPUT SCHEMA

// UPDATE THE HANDLER LOGIC AS REQUIRED
export const handler = async function (this: ToolContext, request: CallToolRequest): Promise<CallToolResult> {

    return this.fetch("https://graph.microsoft.com/v1.0/drives");
};
```
