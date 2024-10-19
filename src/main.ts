import "dotenv/config";
import { createServer } from "node:http";
import { parse } from "node:url";
import { Routes, User, FunctionOrUndefined } from "./types";
import { users } from "./database";
import { response } from "./utils/response";

class App {
  port: string;
  routes: Routes;
  users: User[];

  constructor() {
    this.port = process.env.PORT ?? "3000";
    this.users = users;
    this.routes = this.createRoutes();
    this.createServer();
  }

  private getHandler(url: string, method: string): FunctionOrUndefined {
    const { pathname } = parse(url ?? "", true);
    let handler: FunctionOrUndefined;

    if (!pathname) {
      return handler;
    }

    handler = this.routes[pathname]?.[method];

    if (!handler) {
      const dynamicRoutes = Object.keys(this.routes).filter((item) =>
        item.includes("{param}")
      );
      const matchedDynamicRoute = dynamicRoutes.find((item) => {
        const regex = new RegExp(`^${item.replace(/\{param\}/, "[^/]+")}$`);
        return regex.test(pathname);
      });

      if (matchedDynamicRoute) {
        handler = this.routes[matchedDynamicRoute]?.[method];
      }
    }

    return handler;
  }

  private createRoutes(): Routes {
    return {
      "/api/users": {
        GET: () => {
          console.log("Get all users records");
        },
        POST: () => {
          console.log("Create record about new user");
        },
      },
      "/api/users/{param}": {
        GET: () => {
          console.log("Get user by id");
        },
        PUT: () => {
          console.log("Update user by id");
        },
        DELETE: () => {
          console.log("Delete user by id");
        },
      },
    };
  }

  private createServer(): void {
    const server = createServer();

    server.on("request", (req, res) => {
      try {
        const { url, method } = req;

        if (!url || !method) {
          return;
        }

        const handler = this.getHandler(url, method);

        if (handler) {
          handler();
        } else {
          response({
            res,
            statusCode: 404,
            data: "URL of your request doesn't exist",
          });
        }
      } catch (error) {
        response({
          res,
          statusCode: 500,
          data: "Internal server error.",
        });
      }
    });

    server.listen(this.port, () =>
      console.log(`Server is running on port ${this.port}.`)
    );
  }
}

new App();
