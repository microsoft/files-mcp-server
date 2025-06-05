import { Application } from "express";
import { combine, decodePathFromBase64, stringIsNullOrEmpty } from "../utils.js";
import { IncomingMessage } from "http";
import https from "https";
// import { getMethodContext } from "../method-context.js";

export function registerFileStreamRoutes(app: Application) {

    // suppport direct file stream access
    app.get(/^\/file\/(.*?)\/contentStream/, async (req, res) => {

        // the key is the path, but encoded
        const path = req.params[0];

        // but first see if we have a key
        if (stringIsNullOrEmpty(path)) {
            res.status(400).send(JSON.stringify({
                error: "Required file key was not supplied."
            }));
            return;
        }

        // get our normal context and token
        // const context = await getMethodContext();
        // const token = await getToken(context);

        const token = "fake";

        // decode the path should be a valid driveItem path
        const decodedPath = decodePathFromBase64(path);

        // here we need to stream the file and hope that path is real
        https.get(combine("https://graph.microsoft.com/v1.0", decodedPath, "contentStream"), {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }, (upstreamRes: IncomingMessage) => {

            // Set the same headers for the downstream client
            res.writeHead(upstreamRes.statusCode || 500, upstreamRes.headers);

            // Pipe the upstream response directly to the downstream client
            upstreamRes.pipe(res);

        }).on('error', (err: Error) => {
            console.error('Error fetching upstream file:', err);
            res.writeHead(500);
            res.end('Internal Server Error');
        });

    });
}
