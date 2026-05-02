import { Context } from "hono";
import { StatusCode } from "hono/utils/http-status";

export const formatError = (err: Error, source: string) => {
	console.log(
		`Error occured at ${source}\nError name: ${err.name}\nError message: ${err.message}\nError Stack: ${err.stack}\n`
			.red,
	);
};

export const formatResponse = (
	c: Context,
	status: StatusCode,
	message: string,
	body?: Record<string, any>,
): Response => {
	c.status(status);
	return c.json({
		status,
		message,
		...body,
	});
};
