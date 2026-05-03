import Redis from "ioredis";

const publisher = new Redis({
	username: process.env.REDIS_USERNAME,
	password: process.env.REDIS_PASSWORD,
	host: process.env.REDIS_HOST,
	port: Number(process.env.REDIS_PORT),
});

publisher.on("connect", () => {
	console.log("Publisher connected to Redis");
});

publisher.on("error", (err) => {
	console.error("Publisher Redis error:", err);
});

export const publishEvent = async (channel: string, payload: object) => {
	await publisher.publish(channel, JSON.stringify(payload));
};
