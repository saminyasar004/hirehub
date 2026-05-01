import { PrismaClient } from "@prisma/client";

export type HonoEnv = {
	Variables: {
		prisma: PrismaClient;
	};
};

/** Cloudflare bindings (e.g. from .dev.vars or wrangler secrets) */
export type WorkerBindings = { DATABASE_URL: string; JWT_SECRET: string };

/** Payload from `Authorization: Bearer` after `requireAuth` */
export type AuthJwtPayload = {
	userId: string;
	role: string;
	exp: number;
	iat?: number;
};

export type WorkerVariables = {
	prisma: PrismaClient;
	user?: AuthJwtPayload;
	/** Set by institute-head middleware after linking `instituteId` (any institute type, or school/college-only routes). */
	instituteId?: string;
	/** Set by teacher / section-teacher middleware when JWT maps to a Teacher row. */
	teacherId?: string;
};
