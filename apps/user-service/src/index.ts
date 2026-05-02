import "dotenv/config";
import "colors";
import userApp from "./app/app";
import { serve } from "@hono/node-server";
import { initSubscriber } from "./events/subscriber";

serve(
	{
		fetch: userApp.fetch,
		port: Number(process.env.PORT) || 4002,
	},
	() => {
		console.log(
			`User service is running on port ${process.env.PORT || 4002}`.green,
		);
		initSubscriber();
	},
);
