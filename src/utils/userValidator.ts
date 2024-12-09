import { validate as uuidValidate } from "uuid";
import { User } from "../db/userdb";

export type UserValidator = {
  userId(param: string): boolean;
  user(user: User): boolean;
};

export const getUserValidator = (): UserValidator => {
  return {
    userId(param) {
      return uuidValidate(param);
    },
    user(user) {
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
};
