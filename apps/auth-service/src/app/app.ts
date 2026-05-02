import "colors";
import { Context, Hono } from "hono";
import { dbMiddleware } from "../middlewares/db.middleware";
import { formatError, formatResponse } from "../lib/auth.lib";
import { authRouter } from "../routes/auth.route";

const authApp = new Hono();

authApp.use("*", dbMiddleware);

authApp.route("/auth", authRouter);

authApp.get("/auth/health", (c: Context) => {
	return formatResponse(c, 200, "Auth service is running!");
});

authApp.onError((err: Error, c: Context) => {
	formatError(err, "Unhandled Error at App");
	return formatResponse(c, 500, "Internal server error!");
});

authApp.notFound((c: Context) => {
	return formatResponse(c, 404, "Route not found!");
});

export default authApp;
