import Redis from "ioredis";
import { UserRegisteredEventPayload } from "@hirehub/types";
import { createUser } from "./createUser";

const subscriber = new Redis({
	host: process.env.REDIS_HOST || "localhost",
	port: Number(process.env.REDIS_PORT) || 6379,
});

subscriber.on("connect", () => {
	console.log("Subscriber connected to Redis");
});

subscriber.on("error", (err) => {
	console.error("Subscriber Redis error:", err);
});

export const initSubscriber = async () => {
	await subscriber.subscribe("user.registered");

	subscriber.on("message", async (channel, message) => {
		if (channel === "user.registered") {
			const data: UserRegisteredEventPayload = JSON.parse(message);
			await createUser(data);
		}
	});
};
