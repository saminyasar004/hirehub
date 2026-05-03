export const SERVICE_URLS = {
	auth: process.env.AUTH_SERVICE_URL || "http://localhost:4001",
	users: process.env.USER_SERVICE_URL || "http://localhost:4002",
	jobs: process.env.JOB_SERVICE_URL || "http://localhost:4003",
	applications:
		process.env.APPLICATION_SERVICE_URL || "http://localhost:4004",
	notifications:
		process.env.NOTIFICATION_SERVICE_URL || "http://localhost:4005",
};

// requests to these routes skip JWT verification
export const PUBLIC_ROUTES = ["/auth/register", "/auth/login", "/jobs"];
