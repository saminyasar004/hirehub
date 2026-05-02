import { Context, Hono, Next } from "hono";
import { formatError, formatResponse } from "../lib/user.lib";
import { dbMiddleware } from "../middlewares/db.middleware";
import userRouter from "../routes/user.route";

const userApp = new Hono();

userApp.use("*", dbMiddleware);

userApp.route("/user/", userRouter);

userApp.get("/health", async (c: Context) => {
	return formatResponse(c, 200, "User service is running!");
});

userApp.onError((err: Error, c: Context) => {
	formatError(err, "Unhandled error.");
	return formatResponse(c, 500, "Internal server error.");
});

userApp.notFound((c: Context) => {
	console.log(`Route not found: ${c.req.method} ${c.req.path}`);
	return formatResponse(c, 404, "Route not founds.");
});

export default userApp;
