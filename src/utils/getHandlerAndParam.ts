import { ServerResponse, IncomingMessage } from "node:http";
import { parse } from "node:url";
import { Routes } from "../routes/types";

export type Handler = (
  req: IncomingMessage,
  res: ServerResponse,
  param: string
) => void;

export const getHandlerAndParam = (
  url: string,
  method: string,
  routes: Routes
): { handler: Handler | undefined; param: string | undefined } => {
  const { pathname } = parse(url ?? "", true);
  let handler: Handler | undefined;
  let param: string | undefined;

  if (!pathname) {
    return { handler, param };
  }

  handler = routes[pathname]?.[method];

  // additional check for dynamic route
  if (!handler) {
    const dynamicRoutes = Object.keys(routes).filter((item) =>
      item.includes("{param}")
    );
    const matchedDynamicRoute = dynamicRoutes.find((item) => {
      const regex = new RegExp(`^${item.replace(/\{param\}/, "([^/]+)")}$`);
      param = pathname.match(regex)?.[1];
      return regex.test(pathname);
    });

    if (matchedDynamicRoute) {
      handler = routes[matchedDynamicRoute]?.[method];
    }
  }

  return { handler, param };
};
