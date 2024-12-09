import { IncomingMessage, ServerResponse } from "node:http";
import userController from "../controllers/userController";
import { Routes } from "./types";

export default {
  "/api/users": {
    GET: (req: IncomingMessage, res: ServerResponse) =>
      userController.getAllUsers(req, res),
    POST: (req: IncomingMessage, res: ServerResponse) =>
      userController.createUser(req, res),
  },
  "/api/users/{param}": {
    GET: (req: IncomingMessage, res: ServerResponse, param: string) =>
      userController.getUser(req, res, param),
    PUT: (req: IncomingMessage, res: ServerResponse, param: string) =>
      userController.updateUser(req, res, param),
    DELETE: (req: IncomingMessage, res: ServerResponse, param: string) =>
      userController.deleteUser(req, res, param),
  },
} as Routes;
