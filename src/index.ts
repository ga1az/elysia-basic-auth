import { Elysia, t } from "elysia";
import { db, createAllTables } from "./utils/db";
import { auth } from "./auth.routes";
import { privateRoute } from "./private.route";

createAllTables(db());

const app = new Elysia({
  cookie: {
    secrets: "mysecretsupersecret",
    sign: ["sessionToken"],
  },
})
  .get("/", () => "OK")
  .use(auth)
  .use(privateRoute)
  .listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
