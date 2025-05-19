import { Application } from "express";
import { stringIsNullOrEmpty } from "../utils.js";
import http, { IncomingMessage } from "http";

export function registerFileStreamRoutes(app: Application) {

// suppport direct file stream access
    app.get(/^\/file\/contentStream\/(.+)/, (req, res) => {

        const fileId = req.params[0];

        if (stringIsNullOrEmpty(fileId)) {
            res.status(400).send(JSON.stringify({
                error: "Required file id was not supplied."
            }));
        }

        // here we need to stream the file

        // we would need to parse out the file id, as it could come from differeing scenarios (site, folder, file direct)

        // TODO::
        http.get("{GRAPH PATH TO CONTENT STREAM}", (upstreamRes: IncomingMessage) => {

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
