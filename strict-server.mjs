// The production build behind a front door that, like an AWS Lambda function
// URL, answers 400 to a request whose path holds a literal "[" or "]".
// RFC 3986 does not allow either unencoded in a path.
import { createServer } from "node:http";
import next from "next";

const hostname = "localhost";
const port = Number(process.env.PORT ?? 3000);

const app = next({ dev: false, hostname, port });
const handle = app.getRequestHandler();

await app.prepare();

createServer((req, res) => {
  if (/[[\]]/.test(req.url ?? "")) {
    console.log(`front door: 400 ${req.method} ${req.url}`);
    res.writeHead(400, { "content-type": "text/plain" }).end("Bad Request");

    return;
  }

  void handle(req, res);
}).listen(port, hostname, () => {
  console.log(`strict server on http://${hostname}:${port}`);
});
