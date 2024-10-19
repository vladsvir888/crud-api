import { ReturnTypeResponse } from "../types";

export const response = ({
  res,
  statusCode = 200,
  contentType = "application/json",
  data,
}: ReturnTypeResponse): void => {
  res.writeHead(statusCode, { "Content-Type": contentType });
  res.end(JSON.stringify(data));
};
