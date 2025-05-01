import { readdir } from "fs/promises";
import { DynamicResource, DynamicToolMode } from "./types.js";
import { resolve, dirname, parse } from "path";
import { fileURLToPath } from 'url';
import { ListResourcesResult, ReadResourceRequest, Resource } from "@modelcontextprotocol/sdk/types.js";
import { MCPContext } from "./context.js";

const COMMON = "common";
const __dirname = dirname(fileURLToPath(import.meta.url));
const resources = new Map<string, DynamicResource>();

export async function getResources(): Promise<Map<string, DynamicResource>> {

    if (resources.size < 1) {

        // Load tools from the tools directory
        const dirPath = resolve(__dirname, "resources")
        const toolFiles = await readdir(dirPath);

        for (let i = 0; i < toolFiles.length; i++) {

            const toolFile = toolFiles[i];

            if (/\.js$/.test(toolFile)) {

                resources.set(parse(toolFile).name, await import("file://" + resolve(dirPath, toolFile)));
            }
        }
    }

    return resources;
}

export async function getResourcesHandler(this: MCPContext): Promise<ListResourcesResult> {

    const resources = await getResources();

    const usedResourcesP: Promise<Resource[]>[] = [];

    resources.forEach((value, key) => {

        if (key === COMMON || key === this.mode) {
            usedResourcesP.push(value.publish.call(this));
        }
    });

    const usedResources = (await Promise.all(usedResourcesP)).flat(2);

    return {
        resources: usedResources.map<Resource>(resource => ({
            ...resource,
        })),
    };
}

export async function readResourceHandler(this: MCPContext, request: ReadResourceRequest) {

    const resources = await getResources();

    const uri = new URL(request.params.uri);
    const mode = <DynamicToolMode>uri.protocol.replace(/:$/,"");

    try {

        if (resources.has(mode)) {
            return resources.get(mode).handler.call(this, request);
        } else {
            return resources.get(COMMON).handler.call(this, request);
        }

    } catch (e) {
        console.error(e);
    }

    throw new Error(`Unknown resource: ${uri.toString()}`);
}
