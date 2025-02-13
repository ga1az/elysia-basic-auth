import type Database from "bun:sqlite";
import { generateRandomString } from "./generators";
import { createId } from "@paralleldrive/cuid2";

function getDate(offset: number, unit: "sec" | "ms"): number {
  const now = Date.now();
  return unit === "sec" ? Math.floor(now / 1000 + offset) : now + offset;
}

export async function createSession(
  userId: string,
  request: Request,
  database: Database,
  dontRememberMe?: boolean
) {
  const token = generateRandomString(32);
  const sessionExpiration = 60 * 60 * 24 * 7; // 7 días
  const ipAddress =
    request.headers.get("x-forwarded-for") ||
    request.headers.get("remote-addr") ||
    "";
  const userAgent = request.headers.get("user-agent") || "";
  const newSession = {
    token,
    userId,
    ipAddress,
    userAgent,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    expiresAt: dontRememberMe
      ? getDate(60 * 60 * 24, "sec") // expira en 1 día
      : getDate(sessionExpiration, "sec"),
  };

  const query = database.query(
    "INSERT INTO sessions (id, token, user_id, ip_address, user_agent, created_at, updated_at, expires_at) VALUES ($id, $token, $user_id, $ip_address, $user_agent, $created_at, $updated_at, $expires_at)"
  );

  query.run({
    $id: createId(),
    $token: newSession.token,
    $user_id: newSession.userId,
    $ip_address: newSession.ipAddress,
    $user_agent: newSession.userAgent,
    $created_at: newSession.createdAt,
    $updated_at: newSession.updatedAt,
    $expires_at: newSession.expiresAt,
  });

  return newSession;
}
