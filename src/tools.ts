import { readdir } from "fs/promises";
import { DynamicTool, ToolContext } from "./types.js";
import { resolve, dirname } from "path";
import { fileURLToPath } from 'url';
import { CallToolRequest, ListToolsResult } from "@modelcontextprotocol/sdk/types.js";
import { formatCallToolResult } from "./utils.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

const tools = [];

export async function getTools(): Promise<DynamicTool[]> {

    if (tools.length < 1) {

        // Load tools from the tools directory
        const dirPath = resolve(__dirname, "tools")
        const toolFiles = await readdir(dirPath);

        for (let i = 0; i < toolFiles.length; i++) {

            const toolFile = toolFiles[i];

            if (/\.js$/.test(toolFile)) {

                tools.push(await import("file://" + resolve(dirPath, toolFile)));
            }
        }
    }

    return tools;
}

export async function getToolsHandler(): Promise<ListToolsResult> {

    const tools = await getTools();

    return {
        tools: tools.map(tool => (
            {
                inputSchema: {
                    type: "object",
                    properties: {},
                    required: [],
                },
                ...tool,
            })),
    };
}

export async function callToolHandler(this: ToolContext, request: CallToolRequest) {

    const tools = await getTools();

    try {

        const tool = tools.filter(t => t.name === request.params.name);
        if (tool.length < 1) {
            throw Error(`Could not locate tool "${request.params.name}".`);
        }

        return tool[0].handler.call(this, request)

    } catch (e) {

        console.error("Fatal error in calling tool:", e);

        return formatCallToolResult({
            error: e instanceof Error ? e.message : String(e),
        });
    }
}

export function clearTools() {
    tools.length = 0;
}
