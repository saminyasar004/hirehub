import { Context, Next } from "hono";
import {
	comparePassword,
	formatError,
	formatResponse,
	generateToken,
	hashPassword,
	verifyToken,
} from "../lib/auth.lib";
import { AuthJwtPayload } from "../types";
import { publishEvent } from "../events/publisher";
import { User } from "../../generated/prisma";
import jwt from "jsonwebtoken";

export const verifyAuthController = async (c: Context, next: Next) => {
	try {
		const authHeader = c.req.header("Authorization");
		if (!authHeader) {
			return formatResponse(c, 401, "Unauthorized: No token provided");
		}

		const token = authHeader.split(" ")[1];
		if (!token) {
			return formatResponse(c, 401, "Unauthorized: Invalid token format");
		}
		const verify = verifyToken(token) as AuthJwtPayload;
		if (!verify) {
			return formatResponse(c, 401, "Unauthorized");
		}

		return formatResponse(c, 200, "Authorized", verify);
	} catch (err: any) {
		if (err instanceof jwt.JsonWebTokenError) {
			return formatResponse(c, 401, "Unauthorized: Invalid token.");
		} else if (err instanceof jwt.TokenExpiredError) {
			return formatResponse(c, 401, "Unauthorized: Token expired.");
		}
		formatError(err, "Auth controller verify");
		return formatResponse(c, 500, "Internal server error!");
	}
};

export const registerController = async (c: Context, next: Next) => {
	try {
		const body = await c.req.json();
		const {
			email,
			password,
			firstName,
			lastName,
			phone,
			avatar,
			bio,
			resume,
			github,
			linkedin,
			website,
			address,
		} = body;

		const prisma = c.get("prisma");

		const isEmailExist = await prisma.user.findUnique({
			where: { email },
		});

		if (isEmailExist) {
			return formatResponse(c, 400, "Email already exists");
		}

		const hashedPassword = await hashPassword(password);

		const createdUser = await prisma.user.create({
			data: {
				email,
				password: hashedPassword,
				role: body.role || "candidate",
			},
		});

		await publishEvent("user.registered", {
			userId: createdUser.id,
			role: createdUser.role,
			firstName,
			lastName,
			bio,
			address,
			resume,
			avatar,
			phone,
			github,
			linkedin,
			website,
		});

		const accessToken = generateToken(
			{
				userId: createdUser.id.toString(),
				email: createdUser.email,
				role: createdUser.role,
			},
			"1h",
		);

		const refreshToken = generateToken(
			{
				userId: createdUser.id.toString(),
				email: createdUser.email,
				role: createdUser.role,
			},
			"7d",
		);

		const { password: createdPassword, ...userWithoutPassword } =
			createdUser;

		return formatResponse(c, 201, "User created successfully.", {
			user: userWithoutPassword,
			accessToken,
			refreshToken,
		});
	} catch (err: any) {
		formatError(err, "Auth controller register");
		return formatResponse(c, 500, "Internal server error!");
	}
};

export const loginController = async (c: Context, next: Next) => {
	try {
		const body = await c.req.json();
		const { email, password } = body;

		const prisma = c.get("prisma");
		const lookedUser = await prisma.user.findUnique({ where: { email } });

		if (!lookedUser) {
			return formatResponse(c, 400, "User not found! Please register.");
		}

		const isPasswordMatched = await comparePassword(
			password,
			lookedUser.password,
		);

		if (!isPasswordMatched) {
			return formatResponse(c, 400, "Invalid password.");
		}

		const accessToken = generateToken(
			{
				userId: lookedUser.id.toString(),
				email: lookedUser.email,
				role: lookedUser.role,
			},
			"1h",
		);

		const refreshToken = generateToken(
			{
				userId: lookedUser.id.toString(),
				email: lookedUser.email,
				role: lookedUser.role,
			},
			"7d",
		);

		const { password: lookedPassword, ...userWithoutPassword } = lookedUser;

		return formatResponse(c, 200, "Login successful.", {
			user: userWithoutPassword,
			accessToken,
			refreshToken,
		});
	} catch (err: any) {
		formatError(err, "Auth controller login");
		return formatResponse(c, 500, "Internal server error!");
	}
};

export const getAllUsersController = async (c: Context, next: Next) => {
	try {
		const prisma = c.get("prisma");
		const users = await prisma.user.findMany();

		const simplifiedUsers = users.map((user: User) => {
			const { password, id, email, role } = user;
			return { id, email, role };
		});

		return formatResponse(c, 200, "Users fetched successfully.", {
			users: simplifiedUsers,
		});
	} catch (err: any) {
		formatError(err, "Get all users controller.");
		return formatResponse(c, 500, "Internal server error.");
	}
};
