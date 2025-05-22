import { readdir } from "fs/promises";
import { DynamicResource, DynamicToolMode, HandlerParams, COMMON } from "./types.js";
import { resolve, dirname, parse } from "path";
import { fileURLToPath } from 'url';
import { ListResourcesRequest, ListResourcesResult, ReadResourceRequest, Resource } from "@modelcontextprotocol/sdk/types.js";
import { MCPContext } from "./context.js";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const resources = new Map<string, DynamicResource>();

export async function clearResourcesCache(server: Server): Promise<void> {

    await server.notification({
        method: "notifications/resources/list_changed",
    });

    resources.clear();
}

export async function getResources(): Promise<Map<string, DynamicResource>> {

    resources.clear();

    if (resources.size < 1) {

        // Load tools from the tools directory
        const dirPath = resolve(__dirname, "resources")
        const resourceFiles = await readdir(dirPath, { recursive: false });

        for (let i = 0; i < resourceFiles.length; i++) {

            const resourceFile = resourceFiles[i];

            if (/\.js$/.test(resourceFile)) {

                resources.set(parse(resourceFile).name, await import("file://" + resolve(dirPath, resourceFile)));
            }
        }
    }

    return resources;
}

export async function getResourcesHandler(this: MCPContext, params: HandlerParams<ListResourcesRequest>): Promise<ListResourcesResult> {

    const { session } = params;

    const resources = await getResources();

    const activeResources: Promise<Resource[]>[] = [];

    for (let [key, resource] of resources) {
        if (key === COMMON || key === session.mode) {
            activeResources.push(resource.publish.call(this, params));
        }
    }

    const exposedResources = (await Promise.all(activeResources)).flat(2);

    return {
        resources: exposedResources.map<Resource>(resource => ({
            ...resource,
        })),
    };
}

export async function readResourceHandler(this: MCPContext, params: HandlerParams<ReadResourceRequest>) {

    const resources = await getResources();

    const { request } = params;

    const uri = new URL(request.params.uri);
    const mode = <DynamicToolMode>uri.protocol.replace(/:$/, "");

    try {

        if (resources.has(mode)) {
            return resources.get(mode).handler.call(this, params);
        } else {
            return resources.get(COMMON).handler.call(this, params);
        }

    } catch (e) {
        console.error(e);
    }

    throw new Error(`Unknown resource: ${uri.toString()}`);
}
