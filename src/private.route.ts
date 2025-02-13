import { Elysia } from "elysia";
import { authMiddleware } from "./middleware/auth.middleware";

export const privateRoute = new Elysia({
  detail: {
    tags: ["private"],
  },
  prefix: "/private",
})
  .use(authMiddleware)
  .get("/", async ({ userId }) => {
    return { message: "Private route", userId };
  });
