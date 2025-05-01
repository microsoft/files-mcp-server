import { readdir } from "fs/promises";
import { DynamicResourceTemplate } from "./types.js";
import { resolve, dirname, parse } from "path";
import { fileURLToPath } from 'url';
import { ListResourceTemplatesResult, ResourceTemplate } from "@modelcontextprotocol/sdk/types.js";
import { MCPContext } from "./context.js";

const COMMON = "common";
const __dirname = dirname(fileURLToPath(import.meta.url));
const resources = new Map<string, DynamicResourceTemplate>();

export async function getResourceTemplates(): Promise<Map<string, DynamicResourceTemplate>> {

    if (resources.size < 1) {

        // Load tools from the tools directory
        const dirPath = resolve(__dirname, "resourceTemplates")
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

export async function getResourceTemplatesHandler(this: MCPContext): Promise<ListResourceTemplatesResult> {

    const resources = await getResourceTemplates();

    const usedResourcesP: Promise<DynamicResourceTemplate[]>[] = [];

    resources.forEach((value, key) => {

        if (key === COMMON || key === this.mode) {
            usedResourcesP.push(value.publish.call(this));
        }
    });

    const usedResources = (await Promise.all(usedResourcesP)).flat(2);

    return {
        resourceTemplates: usedResources.map<ResourceTemplate>(resource => ({
            ...resource,
        })),
    };
}