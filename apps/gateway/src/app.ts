import { Hono } from "hono";
import { authMiddleware } from "./middlewares/auth";
import { proxyRequest } from "./proxy";
import { SERVICE_URLS } from "./config";

const app = new Hono();

app.use("*", authMiddleware);

// route to correct service based on prefix
app.all("/auth/*", (c) => proxyRequest(SERVICE_URLS.auth, c));
app.all("/users/*", (c) => proxyRequest(SERVICE_URLS.users, c));
app.all("/jobs/*", (c) => proxyRequest(SERVICE_URLS.jobs, c));
app.all("/applications/*", (c) => proxyRequest(SERVICE_URLS.applications, c));

app.notFound((c) => c.json({ message: "Route not found" }, 404));

export default app;
