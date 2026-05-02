import { createMiddleware } from "hono/factory";
import { PUBLIC_ROUTES, SERVICE_URLS } from "../config";
import { Context, Next } from "hono";

export const authMiddleware = createMiddleware(
	async (c: Context, next: Next) => {
		const path = new URL(c.req.url).pathname;

		// check if route is public
		const isPublic = PUBLIC_ROUTES.some((route) => path.startsWith(route));
		if (isPublic) return await next();

		// get token from header
		const token = c.req.header("Authorization")?.split(" ")[1];
		if (!token)
			return c.json({ status: 401, message: "Unauthorized" }, 401);

		// verify token by calling auth-service
		const verifyRes = await fetch(`${SERVICE_URLS.auth}/auth/verify`, {
			method: "GET",
			headers: { Authorization: `Bearer ${token}` },
		}).then((res) => res.json());

		console.log("VERIFY...");
		console.log(await verifyRes);

		if (verifyRes.status !== 200)
			return c.json(
				{
					status: verifyRes?.status,
					message: verifyRes?.message || "Unauthorized",
				},
				401,
			);

		console.log("USER ");
		console.log(verifyRes);

		// inject user info into headers for downstream services
		c.req.raw.headers.set("X-User-Id", verifyRes.userId);
		c.req.raw.headers.set("X-User-Role", verifyRes.role);

		return next();
	},
);
