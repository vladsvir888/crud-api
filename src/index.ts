import HTTPServer from "./server/server";
import userRouter from "./routes/userRouter";

new HTTPServer({ ...userRouter });
