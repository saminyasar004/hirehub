import { Context } from "hono";

export const proxyRequest = async (targetUrl: string, c: Context) => {
	try {
		const url = new URL(c.req.url);
		const forwardUrl = targetUrl + url.pathname + url.search;

		console.log("Forward URL ", forwardUrl);

		const hasBody = c.req.method !== "GET" && c.req.method !== "HEAD";

		const response = await fetch(forwardUrl, {
			method: c.req.method,
			headers: c.req.raw.headers,
			body: hasBody ? c.req.raw.body : undefined,
			// @ts-ignore — duplex is required by Node.js when streaming a body
			duplex: hasBody ? "half" : undefined,
		});

		return response;
	} catch (err: any) {
		console.error(`Proxy error: ${err.message}`);
		return c.json(
			{
				message: "Service Unavailable",
				error: err.message,
			},
			503,
		);
	}
};
