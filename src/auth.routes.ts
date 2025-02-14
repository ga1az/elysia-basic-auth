import { Elysia, t } from "elysia";
import { type Account, db, type User } from "./utils/db";
import { createId } from "@paralleldrive/cuid2";
import { createSession } from "./utils/auth";

const database = db();

export const auth = new Elysia({
  cookie: {
    secrets: "mysecretsupersecret",
    sign: ["sessionToken"],
  },
  detail: {
    tags: ["auth"],
  },
  prefix: "/auth",
})
  .post(
    "/signup",
    async ({ body, request, cookie }) => {
      const { email, password, name, organizationName } = body;

      // Verify if the user already exists
      const user = await database
        .query("SELECT * FROM users WHERE email = ?")
        .get(email);

      if (user) {
        return { error: "User already exists" };
      }

      // Create the user
      const userId = createId();
      const createdAt = new Date();
      const newUser = {
        id: userId,
        email,
        name,
        createdAt: createdAt.toISOString(),
        updatedAt: createdAt.toISOString(),
        emailVerified: false,
      };

      // Create the user in the database
      let query = database.query(
        "INSERT INTO users (id, email, name, created_at, updated_at, email_verified) VALUES ($id, $email, $name, $created_at, $updated_at, $email_verified)"
      );

      query.run({
        $id: userId,
        $email: email,
        $name: name,
        $created_at: createdAt.toISOString(),
        $updated_at: createdAt.toISOString(),
        $email_verified: false,
      });

      // Password hash
      const passwoordHash = await Bun.password.hash(password, "argon2id");

      query = database.query(
        "INSERT INTO accounts (id, user_id, provider_id, password) VALUES ($id, $user_id, $provider_id, $password)"
      );

      query.run({
        $id: createId(),
        $user_id: userId,
        $provider_id: "credentials",
        $password: passwoordHash,
      });

      // Create the organization
      if (organizationName) {
        query = database.query(
          "INSERT INTO organizations (id, name, created_at, updated_at) VALUES ($id, $name, $created_at, $updated_at)"
        );

        const organizationId = createId();

        query.run({
          $id: organizationId,
          $name: organizationName,
          $created_at: createdAt.toISOString(),
          $updated_at: createdAt.toISOString(),
        });

        query = database.query(
          "INSERT INTO members (id, organization_id, user_id) VALUES ($id, $organization_id, $user_id)"
        );

        query.run({
          $id: createId(),
          $organization_id: organizationId,
          $user_id: userId,
        });
      }

      // TODO: Send verification email

      // Create the session
      const session = await createSession(userId, request, database);

      // Set the session cookie
      cookie.sessionToken.value = session.token;
      cookie.sessionToken.expires = new Date(session.expiresAt * 1000);

      return {
        token: session.token,
        user: newUser,
      };
    },
    {
      body: t.Object({
        email: t.String({
          format: "email",
        }),
        password: t.String({
          minLength: 8,
        }),
        name: t.String({
          minLength: 1,
        }),
        organizationName: t.Optional(
          t.String({
            minLength: 1,
          })
        ),
      }),
    }
  )
  .post(
    "/signin",
    async ({ body, request, cookie }) => {
      const { email, password } = body;

      const user = (await database
        .query("SELECT * FROM users WHERE email = $email")
        .get({ $email: email })) as User;

      if (!user) {
        return { error: "Invalid credentials" };
      }

      const account = (await database
        .query(
          "SELECT * FROM accounts WHERE user_id = $user_id AND provider_id = $provider_id"
        )
        .get({ $user_id: user.id, $provider_id: "credentials" })) as Account;

      if (!account) {
        return { error: "Invalid credentials" };
      }

      const isValidPassword = await Bun.password.verify(
        password,
        account.password
      );
      if (!isValidPassword) {
        return { error: "Invalid credentials" };
      }

      const session = await createSession(user.id, request, database);

      cookie.sessionToken.value = session.token;
      cookie.sessionToken.expires = new Date(session.expiresAt * 1000);

      return {
        token: session.token,
        user,
      };
    },
    {
      body: t.Object({
        email: t.String({
          format: "email",
        }),
        password: t.String({
          minLength: 8,
        }),
      }),
    }
  )
  .post("/signout", async ({ cookie }) => {
    const cookieSession = cookie.sessionToken.value;

    if (!cookieSession) {
      return { error: "No session found" };
    }

    const session = await database
      .query("DELETE FROM sessions WHERE token = $token")
      .run({ $token: cookieSession });

    if (session.changes !== 1) {
      return { error: "Failed to sign out" };
    }

    cookie.sessionToken.remove();

    return { success: true };
  });
