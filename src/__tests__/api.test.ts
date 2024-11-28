import supertest from "supertest";
import { validate as uuidValidate } from "uuid";
import { User } from "../db/userdb";
import userRouter from "../routes/userRouter";
import HTTPServer from "../server/server";
import * as utils from "../utils/getHandlerAndParam";

const app = new HTTPServer({ ...userRouter });
const request = supertest(app.createServer());

const validUser: User = {
  username: "Ivan",
  age: 30,
  hobbies: ["soccer", "tennis", "volleyball"],
};

describe("Tests", () => {
  afterAll(() => {
    app.closeServer();
  });

  describe("checking the processing of valid requests", () => {
    it("should create a new user", async () => {
      const res = await request.post("/api/users").send(validUser);
      validUser.id = res.body.id;
      expect(res.statusCode).toBe(201);
      expect(res.body).toEqual(validUser);
    });

    it("created user shoud have a correct id", () => {
      expect(uuidValidate(validUser.id ?? "")).toBe(true);
    });

    it("should get a specific user by id", async () => {
      const res = await request.get(`/api/users/${validUser.id}`);
      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual(validUser);
    });

    it("should update an existing user", async () => {
      const res = await request
        .put(`/api/users/${validUser.id}`)
        .send({ ...validUser, username: "Pavel", age: 40 });
      expect(res.statusCode).toBe(200);
      expect(res.body.age).toBe(40);
      expect(res.body.username).toBe("Pavel");
    });

    it("should delete an existing user", async () => {
      const res = await request.delete(`/api/users/${validUser.id}`);
      expect(res.statusCode).toBe(204);
    });
  });

  describe("checking the processing of invalid requests", () => {
    it("should return 400 when user is not valid", async () => {
      const invalidUser = {
        username: "Petr",
        hobbies: null,
      };
      const res = await request.post("/api/users").send(invalidUser);
      expect(res.statusCode).toBe(400);
      expect(res.body).toEqual({
        message: "Your request is invalid. Please, provide valid fields.",
      });
    });

    it("should return 404 if an non-existing route", async () => {
      const res = await request.post("/api/users/some-non-existing-route");
      expect(res.statusCode).toBe(404);
      expect(res.body).toEqual({
        message: "URL of your request doesn't exist.",
      });
    });

    it("should return 500 when errors on server side", async () => {
      const spy = jest
        .spyOn(utils, "getHandlerAndParam")
        .mockImplementation(() => {
          throw new Error();
        });
      const res = await request.post("/api/users");
      expect(res.statusCode).toBe(500);
      expect(res.body).toEqual({ message: "Internal server error." });
      spy.mockRestore();
    });
  });

  describe("checking the correct of the API with parallel requests", () => {
    it("should handle parallel requests of users", async () => {
      const createUsers = [
        {
          username: "Ivan",
          age: 25,
          hobbies: ["soccer"],
        },
        {
          username: "Pavel",
          age: 20,
          hobbies: ["tennis"],
        },
        {
          username: "Petr",
          age: 28,
          hobbies: ["volleyball"],
        },
        {
          username: "Vadim",
          age: 34,
          hobbies: ["hockey"],
        },
        {
          username: "Alex",
          age: 45,
          hobbies: ["basketball"],
        },
      ].map((user) => request.post("/api/users").send(user));

      const createResponses = await Promise.all(createUsers);
      createResponses.forEach((res) => {
        expect(res.status).toBe(201);
        expect(res.body).toHaveProperty("id");
      });

      const deleteUsers = createResponses.map((res) =>
        request.delete(`/api/users/${res.body.id}`)
      );
      const deleteResponses = await Promise.all(deleteUsers);
      deleteResponses.forEach((res) => {
        expect(res.status).toBe(204);
      });

      const getResponse = await request.get("/api/users");
      expect(getResponse.status).toBe(200);
      expect(getResponse.body).toEqual([]);
    });
  });
});
