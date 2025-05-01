import { setupExpressServer } from "./setup-express-server.js";
import { getCurrentContext } from "./context.js";
import { setupMCPServer } from "./setup-mcp-server.js";

async function main(): Promise<void> {

    // maybe in the future we need to set somethings or supply values for context establishment
    const context = await getCurrentContext();
    const server = await setupMCPServer(context);
    const app = await setupExpressServer(server);

    const PORT = process.env.PORT || 3001;

    app.listen(PORT, () => {
        console.log(`Files MCP Server is running on port ${PORT}`);
    });
}

main().catch((error) => {
    console.error("Fatal error in main():", error);
    process.exit(1);
});
