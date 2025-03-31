import { readdir } from "fs/promises";
import { DynamicTool } from "./types";
import { resolve, dirname } from "path";
import { fileURLToPath } from 'url';

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
