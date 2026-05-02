import { Context, Next } from "hono";
import { formatError, formatResponse } from "../lib/user.lib";
import { UserInfo } from "@prisma/client";

export const getAllUsersController = async (c: Context, next: Next) => {
	try {
		const prisma = c.get("prisma");
		const userInfos = await prisma.userInfo.findMany();

		// auth service communicate for all the users
		const getAllUsersResponse = await (
			await fetch("http://localhost:4001/auth/")
		).json();

		console.log("HEERE INSIDE USER CONTROLLER TO CHECK USER IN REQ: ");

		console.log(getAllUsersResponse);
		console.log(userInfos);

		const combinedUsers = userInfos.map((userInfo: UserInfo) => {
			const user = getAllUsersResponse?.users.find(
				(user: any) => user.id === userInfo.userId,
			);
			return { ...userInfo, ...user };
		});

		console.log(combinedUsers);

		return formatResponse(c, 200, "Users fetched successfully.", {
			users: combinedUsers,
		});
	} catch (err: any) {
		formatError(err, "Get All Users Controller");
		return formatResponse(c, 500, "Internal server error.");
	}
};
