import { readdir } from "fs/promises";
import { DynamicResourceTemplate } from "./types.js";
import { resolve, dirname, parse } from "path";
import { fileURLToPath } from 'url';
import { ListResourceTemplatesRequest, ListResourceTemplatesResult, ResourceTemplate } from "@modelcontextprotocol/sdk/types.js";
import { MCPContext } from "./method-context.js";

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

export async function getResourceTemplatesHandler(this: MCPContext<ListResourceTemplatesRequest>): Promise<ListResourceTemplatesResult> {

    const { session } = this.params;

    const resources = await getResourceTemplates();

    const usedResourcesP: Promise<DynamicResourceTemplate[]>[] = [];

    for (let [key, resource] of resources) {
         if (key === COMMON || key === session.mode) {
            usedResourcesP.push(resource.publish.call(this));
        }
    }

    const usedResources = (await Promise.all(usedResourcesP)).flat(2);

    return {
        resourceTemplates: usedResources.map<ResourceTemplate>(resource => ({
            ...resource,
        })),
    };
}