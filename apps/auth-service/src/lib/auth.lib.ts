import { Context } from "hono";
import { StatusCode } from "hono/utils/http-status";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

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

export const verifyToken = (token: string) => {
	const verify = jwt.verify(token, process.env.JWT_SECRET as string);
	return verify;
};

export const generateToken = (
	payload: Record<string, any>,
	expiresIn: string | number = "1h",
) => {
	return jwt.sign(payload, process.env.JWT_SECRET as string, {
		expiresIn: expiresIn as any,
	});
};

export const hashPassword = async (password: string) => {
	return await bcrypt.hash(password, 10);
};

export const comparePassword = async (password: string, hash: string) => {
	return await bcrypt.compare(password, hash);
};
