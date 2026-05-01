import "dotenv/config";
import "colors";
import authApp from "./app/app";
import { serve } from "@hono/node-server";

serve(
	{
		fetch: authApp.fetch,
		port: Number(process.env.PORT) || 4001,
	},
	() => {
		console.log(
			`Auth service is running on port ${process.env.PORT ?? 4001}`.green,
		);
	},
);
