import { MCPContext } from "../../method-context.js";
import { DynamicToolMode, ResourceReadHandler, ResourceReadHandlerTest } from "../../types.js";
import { ReadResourceRequest, Resource } from "@modelcontextprotocol/sdk/types.js";
import { decodePathFromBase64 } from "../../utils.js";

export function getDefaultResourceHandlerMapEntryFor(protocol: Exclude<DynamicToolMode, "not-set" | "hidden" | "common" | "consumerOD">): [ResourceReadHandlerTest, ResourceReadHandler] {

    return [
        (uri) => RegExp(`^${protocol}:`, "i").test(uri.protocol),
        async function (this: MCPContext<ReadResourceRequest>, uri: URL): Promise<Resource[]> {

            const { request } = this.params;

            const resources: Resource[] = [];

            const path = decodePathFromBase64(request.params.uri.replace(RegExp(`^${protocol}:\/\/`, "i"), ""));

            const result = await this.fetch<Response>(path);

            resources.push({
                uri: request.params.uri,
                mimeType: "application/json",
                text: JSON.stringify(result, null, 2),
            });

            if (resources.length < 1) {

                resources.push({
                    uri: request.params.uri,
                    text: `Could not read ${protocol} ${uri.host}`,
                    isError: true,
                });
            }

            return resources;
        },
    ]
}
