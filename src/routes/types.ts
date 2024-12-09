import { Handler } from "../utils/getHandlerAndParam";

export type Route = {
  [key: string]: Handler;
};

export type Routes = {
  [key: string]: Route;
};
