import { Hono } from "hono";
import { authMiddleware } from "./middlewares/auth";
import { proxyRequest } from "./proxy";
import { SERVICE_URLS } from "./config";

const app = new Hono();

app.use("*", authMiddleware);

// route to correct service based on prefix
app.all("/auth/*", (c) => proxyRequest(SERVICE_URLS.auth, c));
app.all("/user/*", (c) => proxyRequest(SERVICE_URLS.users, c));
app.all("/job/*", (c) => proxyRequest(SERVICE_URLS.jobs, c));
app.all("/application/*", (c) => proxyRequest(SERVICE_URLS.applications, c));

app.notFound((c) =>
	c.json({ status: 404, message: "Route not foundddd" }, 404),
);

export default app;
