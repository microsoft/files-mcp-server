// resource template file content : /{file id}/formats/pdf

import { ListResourceTemplatesRequest, ResourceTemplate } from "@modelcontextprotocol/sdk/types.js";
import { MCPContext } from "../context.js";
import { HandlerParams } from "../types.js";

export async function publish(this: MCPContext, params: HandlerParams<ListResourceTemplatesRequest>): Promise<ResourceTemplate[]> {

    return <ResourceTemplate[]>[];
}