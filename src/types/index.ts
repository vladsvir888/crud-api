import { ServerResponse } from "node:http";

export type Route = {
  [key: string]: () => void;
};

export type Routes = {
  [key: string]: Route | undefined;
};

export type User = {
  id: string;
  username: string;
  age: number;
  hobbies: string[] | [];
};

export type ReturnTypeResponse = {
  res: ServerResponse;
  statusCode?: number;
  contentType?: string;
  data: unknown;
};

export type FunctionOrUndefined = (() => void) | undefined;
