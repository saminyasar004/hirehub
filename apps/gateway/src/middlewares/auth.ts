import { createMiddleware } from "hono/factory";
import { PUBLIC_ROUTES, SERVICE_URLS } from "../config";

export const authMiddleware = createMiddleware(async (c, next) => {
	const path = new URL(c.req.url).pathname;

	// check if route is public
	const isPublic = PUBLIC_ROUTES.some((route) => path.startsWith(route));
	if (isPublic) return await next();

	// get token from header
	const token = c.req.header("Authorization")?.split(" ")[1];
	if (!token) return c.json({ message: "Unauthorized" }, 401);

	// verify token by calling auth-service
	const verifyRes = await fetch(`${SERVICE_URLS.auth}/auth/verify`, {
		method: "GET",
		headers: { Authorization: `Bearer ${token}` },
	});

	console.log("VERIFY...");
	console.log(verifyRes);

	if (!verifyRes.ok) return c.json({ message: "Unauthorized" }, 401);

	const user = await verifyRes.json();
	console.log(user);

	// inject user info into headers for downstream services
	c.req.raw.headers.set("X-User-Id", user.userId);
	c.req.raw.headers.set("X-User-Role", user.role);

	await next();
});
