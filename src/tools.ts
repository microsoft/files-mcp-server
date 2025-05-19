import { readdir } from "fs/promises";
import { COMMON, DynamicTool, HandlerParams } from "./types.js";
import { resolve, dirname } from "path";
import { fileURLToPath } from 'url';
import { CallToolRequest, ListToolsRequest, ListToolsResult } from "@modelcontextprotocol/sdk/types.js";
import { formatCallToolResult } from "./utils.js";
import { MCPContext } from "./context.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const tools = [];

export async function clearToolsCache(): Promise<void> {
    tools.length = 0;
}

export async function getTools(): Promise<DynamicTool[]> {

    if (tools.length < 1) {

        // Load tools from the tools directory
        const dirPath = resolve(__dirname, "tools");
        const allFiles = await readdir(dirPath);
        const toolFiles = allFiles.filter(f => /\.js$/.test(f))

        for (let i = 0; i < toolFiles.length; i++) {

            const toolFile = toolFiles[i];
            tools.push(await import("file://" + resolve(dirPath, toolFile)));
        }
    }

    return tools;
}

export async function getToolsHandler(this: MCPContext, params: HandlerParams<ListToolsRequest>): Promise<ListToolsResult> {

    const { session } = params;

    const tools = await getTools();

    return {
        tools: tools.filter(t => t.modes.includes(COMMON) || t.modes.includes(session.mode)).map(tool => (
            {
                // include default empty input schema, required by some clients
                inputSchema: {
                    type: "object",
                    properties: {},
                    required: [],
                },
                ...tool,
            })),
    };
}

export async function callToolHandler(this: MCPContext, params: HandlerParams<CallToolRequest>) {

    const { request } = params;

    const tools = await getTools();

    try {

        const tool = tools.filter(t => t.name === request.params.name);
        if (tool.length < 1) {
            throw Error(`Could not locate tool "${request.params.name}".`);
        }

        return tool[0].handler.call(this, params)

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
