import { UserRegisteredEventPayload } from "@hirehub/types";
import { formatError } from "../lib/user.lib";
import { getPrisma } from "../lib/prisma";

export const createUser = async (payload: UserRegisteredEventPayload) => {
	try {
		const db = getPrisma();

		const lookedUserInfo = await db.userInfo.findUnique({
			where: {
				userId: payload.userId,
			},
		});

		if (lookedUserInfo) {
			return formatError(
				new Error("User info already exist."),
				"Create user event.",
			);
		}

		const createdUserInfo = await db.userInfo.create({
			data: {
				userId: payload.userId,
				firstName: payload.firstName,
				lastName: payload.lastName,
				phone: payload.phone,
				avatar: payload.avatar,
				bio: payload.bio,
				resume: payload.resume,
				github: payload.github,
				linkedin: payload.linkedin,
				website: payload.website,
				address: payload.address,
			},
		});

		if (!createdUserInfo) {
			return formatError(
				new Error("Failed to create user info."),
				"Create user event.",
			);
		}

		console.log("User info created successfully.".green);
		return;
	} catch (err: any) {
		return formatError(err, "Create user event.");
	}
};
