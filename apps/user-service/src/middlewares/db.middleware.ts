import { Context, Next } from "hono";
import { formatError, formatResponse } from "../lib/user.lib";
import { getPrisma } from "../lib/prisma";

export const dbMiddleware = async (c: Context, next: Next) => {
	try {
		const prisma = getPrisma();
		c.set("prisma", prisma);
		await next();
	} catch (err: any) {
		formatError(err, "DB Middleware");
		return formatResponse(c, 500, err.message || "Internal server error.");
	}
};
