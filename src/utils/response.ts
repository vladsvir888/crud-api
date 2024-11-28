import { ServerResponse } from "node:http";

type Response = {
  res: ServerResponse;
  statusCode?: number;
  contentType?: string;
  data?: unknown;
};

export const response = ({
  res,
  statusCode = 200,
  contentType = "application/json",
  data,
}: Response): void => {
  res
    .writeHead(statusCode, { "Content-Type": contentType })
    .end(JSON.stringify(data));
};
