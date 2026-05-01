export const SERVICE_URLS = {
	auth: "http://localhost:4001",
	users: "http://localhost:4002",
	jobs: "http://localhost:4003",
	applications: "http://localhost:4004",
};

// requests to these routes skip JWT verification
export const PUBLIC_ROUTES = ["/auth/register", "/auth/login", "/jobs", "/auth/health"];
