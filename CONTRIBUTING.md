# Contributing

We welcome your contributions!

You can contibute both to the overall solution, and by adding/updating tools.

## Tools

You can easily contribute new tools in the `/src/tools` folder by adding a module and following the pattern:

```TS
export const name = "{NAME OF THE TOOL}";

export const description = "{DESCRIPTION OF THE TOOL}";

export const inputSchema = {}; // ANY REQUIRED INPUT SCHEMA

// UPDATE THE HANDLER LOGIC AS REQUIRED
export const handler = async function (this: ToolContext, request: CallToolRequest): Promise<CallToolResult> {

    return this.fetch("https://graph.microsoft.com/v1.0/drives");
};
```

## Project

We welcome improvements/ideas for the main project as well, if you have ideas for large changes, please open an issue to discuss before doing the work. We'd hate for you to invest time in an area where we may have other plans.

## Process

Regardless of your change, big or small, open a PR against MAIN for review. We will review and respond, please remain engaged in case we have any questions. Once approved we will merge your PR.

We do not have a set release schedule, but once merged your changes will be included in the next NPM release.

