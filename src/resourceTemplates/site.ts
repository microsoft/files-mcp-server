import { ListResourceTemplatesRequest, ResourceTemplate } from "@modelcontextprotocol/sdk/types";
import { MCPContext } from "../method-context.js";

export async function publish(this: MCPContext<ListResourceTemplatesRequest>): Promise<ResourceTemplate[]> {

    return <ResourceTemplate[]>[];
}
