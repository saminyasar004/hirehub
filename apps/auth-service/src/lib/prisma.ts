import { PrismaClient } from "../../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import "dotenv/config";

let prisma: PrismaClient;

export const getPrisma = () => {
	if (prisma) return prisma;

	const connectionString = process.env.DATABASE_URL;
	if (!connectionString) {
		throw new Error("DATABASE_URL is not defined in environment variables");
	}

	const pool = new pg.Pool({ connectionString });
	const adapter = new PrismaPg(pool);
	prisma = new PrismaClient({ adapter });

	prisma.$connect().then(() => {
		console.log("Database connected successfully".green);
	});

	return prisma;
};
