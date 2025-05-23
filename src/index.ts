// import { setupExpressServer } from "./setup-express-server-sse.js";
import { setupExpressServer } from "./setup-express-server-streamablehttp.js";
import { setupMCPServer } from "./setup-mcp-server.js";

async function main(): Promise<void> {

    const server = await setupMCPServer();
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
