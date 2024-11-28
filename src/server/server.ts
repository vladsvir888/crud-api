import "dotenv/config";
import {
  createServer,
  IncomingMessage,
  Server,
  ServerResponse,
} from "node:http";
import { getHandlerAndParam } from "../utils/getHandlerAndParam";
import { response } from "../utils/response";
import { Routes } from "../routes/types";

export default class HTTPServer {
  private port: string;
  private server: Server;
  private routes: Routes;

  constructor(routes: Routes) {
    this.port = process.env.PORT ?? "3000";
    this.routes = routes;
    this.server = this.createServer();
    this.startServer();
  }

  private handleRequest(req: IncomingMessage, res: ServerResponse): void {
    try {
      const { url, method } = req;

      if (!url || !method) {
        return;
      }

      const { handler, param } = getHandlerAndParam(url, method, this.routes);

      if (handler) {
        handler(req, res, param ?? "");
      } else {
        response({
          res,
          statusCode: 404,
          data: { message: "URL of your request doesn't exist." },
        });
      }
    } catch (error) {
      response({
        res,
        statusCode: 500,
        data: { message: "Internal server error." },
      });
    }
  }

  public createServer(): Server {
    const server = createServer();

    server.on("request", (req, res) => {
      this.handleRequest(req, res);
    });

    return server;
  }

  private startServer(): void {
    this.server.listen(this.port, () =>
      console.log(`Server is running on port ${this.port}.`)
    );
  }

  public closeServer(): void {
    this.server.close();
  }
}
