# OneDrive MCP Server

This library provides an MCP server for local testing with any client that supports the [Model Context Protocol](https://modelcontextprotocol.io/introduction).

## Install

1. Clone this repository locally (will update once we are published to NPM)
2. Create a copt of `/src/settings-example.ts` at `/src/settings.ts` and update the required values with your EntraId Application details. You will need Application/Files.Read.All role.
3. In your MCP client of choice add this server using `npx -y {ABSOLUTE LOCAL PATH}\onedrive-mcp-server`
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

    const token = await this.getToken();

    const response = await fetch("https://graph.microsoft.com/v1.0/drives", {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${token}`,
        }
    });

    return parseResposneToResult(response);    
};
```
