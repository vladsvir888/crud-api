import "dotenv/config";
import { v4 as uuidv4, validate as uuidValidate } from "uuid";
import { createServer, ServerResponse, IncomingMessage } from "node:http";
import { parse } from "node:url";

type Handler = (
  req: IncomingMessage,
  res: ServerResponse,
  param: string
) => void;

type Route = {
  [key: string]: Handler;
};

type Routes = {
  [key: string]: Route;
};

type User = {
  id: string;
  username: string;
  age: number;
  hobbies: string[] | [];
};

type ReturnTypeResponse = {
  res: ServerResponse;
  statusCode?: number;
  contentType?: string;
  data?: unknown;
};

type Validator = {
  userId(param: string): boolean;
  user(user: User): boolean;
};

class App {
  private port: string;
  private routes: Routes;
  private users: User[];
  private validator: Validator;

  constructor() {
    this.port = process.env.PORT ?? "3000";
    this.users = [];
    this.validator = this.createValidator();
    this.routes = this.createRoutes();
    this.createServer();
  }

  private createValidator(): Validator {
    return {
      userId(param: string): boolean {
        return uuidValidate(param);
      },
      user(user: User): boolean {
        const username = !!user.username && typeof user.username === "string";
        const age = !!user.age && typeof user.age === "number";
        const hobbies =
          user.hobbies &&
          Array.isArray(user.hobbies) &&
          user.hobbies.every((hobby) => typeof hobby === "string");

        if (!username || !age || !hobbies) {
          return false;
        }

        return true;
      },
    };
  }

  private updateUser(
    req: IncomingMessage,
    res: ServerResponse,
    param: string
  ): void {
    if (!this.validator.userId(param)) {
      this.response({
        res,
        statusCode: 400,
        data: {
          message: "Your request is invalid. Please, provide correct uuid.",
        },
      });
      return;
    }

    let foundUser = this.users.find((user) => user.id === param);

    if (!foundUser) {
      this.response({
        res,
        statusCode: 404,
        data: { message: "User is not found." },
      });
      return;
    }

    let body = "";

    req.on("data", (chunk) => {
      body += chunk;
    });

    req.on("end", () => {
      const user = JSON.parse(body);

      if (!this.validator.user(user)) {
        this.response({
          res,
          statusCode: 400,
          data: {
            message: "Your request is invalid. Please, provide valid fields.",
          },
        });
        return;
      }

      const userIndex = this.users.indexOf(foundUser);
      const newUser = {
        ...user,
        id: foundUser.id,
      };

      this.users.splice(userIndex, 1, newUser);
      this.response({ res, statusCode: 200, data: newUser });
    });
  }

  private deleteUser(
    req: IncomingMessage,
    res: ServerResponse,
    param: string
  ): void {
    if (!this.validator.userId(param)) {
      this.response({
        res,
        statusCode: 400,
        data: {
          message: "Your request is invalid. Please, provide correct uuid.",
        },
      });
      return;
    }

    const foundUserIndex = this.users.findIndex((user) => user.id === param);

    if (foundUserIndex === -1) {
      this.response({
        res,
        statusCode: 404,
        data: { message: "User is not found." },
      });
      return;
    }

    this.users.splice(foundUserIndex, 1);
    this.response({ res, statusCode: 204 });
  }

  private getUser(
    req: IncomingMessage,
    res: ServerResponse,
    param: string
  ): void {
    if (!this.validator.userId(param)) {
      this.response({
        res,
        statusCode: 400,
        data: {
          message: "Your request is invalid. Please, provide correct uuid.",
        },
      });
      return;
    }

    const foundUser = this.users.find((user) => user.id === param);

    if (!foundUser) {
      this.response({
        res,
        statusCode: 404,
        data: { message: "User is not found." },
      });
      return;
    }

    this.response({ res, statusCode: 200, data: foundUser });
  }

  private getAllUsers(req: IncomingMessage, res: ServerResponse): void {
    this.response({ res, statusCode: 200, data: this.users });
  }

  private createUser(req: IncomingMessage, res: ServerResponse): void {
    let body = "";

    req.on("data", (chunk) => {
      body += chunk;
    });

    req.on("end", () => {
      const user = JSON.parse(body);

      if (!this.validator.user(user)) {
        this.response({
          res,
          statusCode: 400,
          data: {
            message: "Your request is invalid. Please, provide valid fields.",
          },
        });
        return;
      }

      this.users.push({ ...user, id: uuidv4() });
      this.response({ res, statusCode: 201, data: user });
    });
  }

  private getHandlerAndParam(
    url: string,
    method: string
  ): { handler: Handler | undefined; param: string | undefined } {
    const { pathname } = parse(url ?? "", true);
    let handler: Handler | undefined;
    let param: string | undefined;

    if (!pathname) {
      return { handler, param };
    }

    handler = this.routes[pathname]?.[method];

    if (!handler) {
      const dynamicRoutes = Object.keys(this.routes).filter((item) =>
        item.includes("{param}")
      );
      const matchedDynamicRoute = dynamicRoutes.find((item) => {
        const regex = new RegExp(`^${item.replace(/\{param\}/, "([^/]+)")}$`);
        param = pathname.match(regex)?.[1];
        return regex.test(pathname);
      });

      if (matchedDynamicRoute) {
        handler = this.routes[matchedDynamicRoute]?.[method];
      }
    }

    return { handler, param };
  }

  private response({
    res,
    statusCode = 200,
    contentType = "application/json",
    data,
  }: ReturnTypeResponse): void {
    res
      .writeHead(statusCode, { "Content-Type": contentType })
      .end(JSON.stringify(data));
  }

  private createRoutes(): Routes {
    return {
      "/api/users": {
        GET: this.getAllUsers.bind(this),
        POST: this.createUser.bind(this),
      },
      "/api/users/{param}": {
        GET: this.getUser.bind(this),
        PUT: this.updateUser.bind(this),
        DELETE: this.deleteUser.bind(this),
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

        const { handler, param } = this.getHandlerAndParam(url, method);

        if (handler) {
          handler(req, res, param ?? "");
        } else {
          this.response({
            res,
            statusCode: 404,
            data: { message: "URL of your request doesn't exist." },
          });
        }
      } catch (error) {
        this.response({
          res,
          statusCode: 500,
          data: { message: "Internal server error." },
        });
      }
    });

    server.listen(this.port, () =>
      console.log(`Server is running on port ${this.port}.`)
    );
  }
}

new App();
