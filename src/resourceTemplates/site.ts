import { ListResourceTemplatesRequest, ResourceTemplate } from "@modelcontextprotocol/sdk/types";
import { MCPContext } from "../method-context.js";
import { HandlerParams } from "../types.js";

export async function publish(this: MCPContext, params: HandlerParams<ListResourceTemplatesRequest>): Promise<ResourceTemplate[]> {

    return <ResourceTemplate[]>[];
}
