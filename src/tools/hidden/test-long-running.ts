import { CallToolRequest } from "@modelcontextprotocol/sdk/types.js";
import { DynamicToolMode, HandlerParams, ValidCallToolResult } from "../../types.js";
import { MCPContext } from "../../context.js";

export const name = "test_long_running";

export const modes: DynamicToolMode[] = ["hidden"];

export const description = "A test tool for checking a long running operation";

export const handler = async function (this: MCPContext, params: HandlerParams<CallToolRequest>): Promise<ValidCallToolResult> {

    const { request, server } = params;

    const progressToken = request.params._meta?.progressToken;
    const steps = 5;

    for (let i = 1; i < steps + 1; i++) {

        await new Promise((resolve) =>
            setTimeout(resolve, 5000)
        );

        if (progressToken !== undefined) {

            await server.notification({
                method: "notifications/progress",
                params: {
                    progress: i,
                    total: steps,
                    progressToken,
                },
            });
        }
    }

    return {
        role: "user",
        content: [{
            type: "text",
            text: `Long running operation completed. Steps: ${steps}.`,
        }],
    };
};
