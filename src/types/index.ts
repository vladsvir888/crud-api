export type Routes = {
  "/api/users": {
    GET: () => void;
    PUT?: never;
    DELETE?: never;
    POST: () => void;
  };
  "/api/users/:userId": {
    GET: () => void;
    PUT: () => void;
    DELETE: () => void;
    POST?: never;
  };
};

export type RouteUsers = Routes["/api/users"];

export type RouteUserId = Routes["/api/users/:userId"];

export type User = {
  id: string;
  username: string;
  age: number;
  hobbies: string[] | [];
};
