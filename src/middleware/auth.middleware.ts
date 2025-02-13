import Elysia from "elysia";
import { db } from "../utils/db";

const database = db();

export const authMiddleware = new Elysia({
  cookie: {
    secrets: "mysecretsupersecret",
    sign: ["sessionToken"],
  },
}).derive({ as: "scoped" }, async ({ cookie }) => {
  const cookieValue = cookie.sessionToken.value;

  if (!cookieValue || cookieValue === "") {
    throw new Error("Unauthorized");
  }

  // Verify the session token
  const query = database.query(
    "SELECT * FROM sessions WHERE token = $token AND CAST(expires_at AS INTEGER) > CAST(strftime('%s','now') AS INTEGER)"
  );

  const session = query.get({
    $token: cookieValue,
  }) as {
    id: string;
    token: string;
    user_id: string;
    ip_address: string;
    user_agent: string;
  };

  if (!session) {
    throw new Error("Unauthorized");
  }

  return {
    userId: session.user_id,
  };
});
