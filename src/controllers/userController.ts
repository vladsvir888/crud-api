import { IncomingMessage, ServerResponse } from "node:http";
import UserModel from "../models/userModel";

class UserController {
  private userModel: UserModel;

  constructor() {
    this.userModel = new UserModel();
  }

  public async updateUser(
    req: IncomingMessage,
    res: ServerResponse,
    param: string
  ): Promise<void> {
    await this.userModel.updateUser(req, res, param);
  }

  public async deleteUser(
    req: IncomingMessage,
    res: ServerResponse,
    param: string
  ): Promise<void> {
    await this.userModel.deleteUser(req, res, param);
  }

  public async getUser(
    req: IncomingMessage,
    res: ServerResponse,
    param: string
  ): Promise<void> {
    await this.userModel.getUser(req, res, param);
  }

  public async getAllUsers(
    req: IncomingMessage,
    res: ServerResponse
  ): Promise<void> {
    await this.userModel.getAllUsers(req, res);
  }

  public async createUser(
    req: IncomingMessage,
    res: ServerResponse
  ): Promise<void> {
    await this.userModel.createUser(req, res);
  }
}

const userController = new UserController();

export default userController;
