import { Hono } from "hono";
import {
	loginController,
	registerController,
	verifyAuthController,
} from "../controllers/auth.controller";

export const authRouter = new Hono();

authRouter.get("/verify", verifyAuthController);
authRouter.post("/register", registerController);
authRouter.post("/login", loginController);
