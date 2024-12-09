import { IncomingMessage, ServerResponse } from "node:http";
import { v4 as uuidv4 } from "uuid";
import { response } from "../utils/response";
import { users } from "../db/userdb";
import { UserValidator, getUserValidator } from "../utils/userValidator";

export default class UserModel {
  private validator: UserValidator;

  constructor() {
    this.validator = getUserValidator();
  }

  public async updateUser(
    req: IncomingMessage,
    res: ServerResponse,
    param: string
  ): Promise<void> {
    if (!this.validator.userId(param)) {
      response({
        res,
        statusCode: 400,
        data: {
          message: "Your request is invalid. Please, provide correct uuid.",
        },
      });
      return;
    }

    let foundUser = users.find((user) => user.id === param);

    if (!foundUser) {
      response({
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
      try {
        const user = JSON.parse(body);

        if (!this.validator.user(user)) {
          response({
            res,
            statusCode: 400,
            data: {
              message: "Your request is invalid. Please, provide valid fields.",
            },
          });
          return;
        }

        const userIndex = users.indexOf(foundUser);
        const newUser = {
          ...user,
          id: foundUser.id,
        };

        users.splice(userIndex, 1, newUser);
        response({ res, statusCode: 200, data: newUser });
      } catch (error) {
        if (error instanceof Error) {
          response({
            res,
            statusCode: 400,
            data: { message: error.message },
          });
        }
      }
    });
  }

  public async deleteUser(
    req: IncomingMessage,
    res: ServerResponse,
    param: string
  ): Promise<void> {
    if (!this.validator.userId(param)) {
      response({
        res,
        statusCode: 400,
        data: {
          message: "Your request is invalid. Please, provide correct uuid.",
        },
      });
      return;
    }

    const foundUserIndex = users.findIndex((user) => user.id === param);

    if (foundUserIndex === -1) {
      response({
        res,
        statusCode: 404,
        data: { message: "User is not found." },
      });
      return;
    }

    users.splice(foundUserIndex, 1);
    response({ res, statusCode: 204 });
  }

  public async getUser(
    req: IncomingMessage,
    res: ServerResponse,
    param: string
  ): Promise<void> {
    if (!this.validator.userId(param)) {
      response({
        res,
        statusCode: 400,
        data: {
          message: "Your request is invalid. Please, provide correct uuid.",
        },
      });
      return;
    }

    const foundUser = users.find((user) => user.id === param);

    if (!foundUser) {
      response({
        res,
        statusCode: 404,
        data: { message: "User is not found." },
      });
      return;
    }

    response({ res, statusCode: 200, data: foundUser });
  }

  public async getAllUsers(
    req: IncomingMessage,
    res: ServerResponse
  ): Promise<void> {
    response({ res, statusCode: 200, data: users });
  }

  public async createUser(
    req: IncomingMessage,
    res: ServerResponse
  ): Promise<void> {
    let body = "";

    req.on("data", (chunk) => {
      body += chunk;
    });

    req.on("end", () => {
      try {
        const user = JSON.parse(body);

        if (!this.validator.user(user)) {
          response({
            res,
            statusCode: 400,
            data: {
              message: "Your request is invalid. Please, provide valid fields.",
            },
          });
          return;
        }

        const newUser = { ...user, id: uuidv4() };
        users.push(newUser);
        response({ res, statusCode: 201, data: newUser });
      } catch (error) {
        if (error instanceof Error) {
          response({
            res,
            statusCode: 400,
            data: { message: error.message },
          });
        }
      }
    });
  }
}
