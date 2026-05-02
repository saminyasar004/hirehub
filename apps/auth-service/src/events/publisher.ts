import Redis from "ioredis";

const publisher = new Redis({
	host: process.env.REDIS_HOST || "localhost",
	port: Number(process.env.REDIS_PORT) || 6379,
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
