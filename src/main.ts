import "dotenv/config";
import { createServer } from "node:http";
import { parse } from "node:url";
import { Routes, RouteUsers, RouteUserId, User } from "./types";
import { users } from "./database";

class App {
  port: string;
  routes: Routes;
  users: User[];

  constructor() {
    this.port = process.env.PORT ?? "3000";
    this.users = users; // mock db
    this.routes = this.createRoutes();
    this.createServer();
  }

  private getRoute(url?: string): RouteUsers | RouteUserId | null {
    const regex = /\/api\/users\/*/;
    const { pathname } = parse(url ?? "", true);

    if (!pathname || !regex.test(pathname)) {
      return null;
    }

    const pathnameElements = pathname.split("/").filter(Boolean);
    const pathnameElementsNumber = pathnameElements.length;

    if (pathnameElementsNumber === 2) {
      return this.routes["/api/users"];
    }

    return this.routes["/api/users/:userId"];
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
      "/api/users/:userId": {
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
      const { url, method } = req;
      const route = this.getRoute(url);

      if (route && method && (method as keyof typeof route) in route) {
        route[method as keyof typeof route]?.();
      }
    });

    server.listen(this.port, () =>
      console.log(`Server is running on port ${this.port}.`)
    );
  }
}

new App();
