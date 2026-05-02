import { Hono } from "hono";
import { getAllUsersController } from "../controllers/user.controller";

const userRouter = new Hono();

userRouter.get("/", getAllUsersController);

export default userRouter;
