import { randomBytes } from "node:crypto";

const SESSION_MS = 12 * 60 * 60 * 1000;

type Session = {
  expiresAt: number;
};

const sessions = new Map<string, Session>();
const failures = new Map<string, { count: number; lockedUntil: number }>();

export function createSession() {
  const token = randomBytes(32).toString("hex");
  sessions.set(token, { expiresAt: Date.now() + SESSION_MS });
  return token;
}

export function readSession(token: string) {
  const session = sessions.get(token);
  if (!session) return false;
  if (session.expiresAt < Date.now()) {
    sessions.delete(token);
    return false;
  }
  return true;
}

export function dropSession(token: string) {
  sessions.delete(token);
}

export function tokenFromHeader(header: string | undefined) {
  if (!header?.startsWith("Bearer ")) return "";
  return header.slice("Bearer ".length).trim();
}

export function noteLoginFailure(key: string) {
  const current = failures.get(key) ?? { count: 0, lockedUntil: 0 };
  const count = current.count + 1;
  failures.set(key, {
    count,
    lockedUntil: count >= 8 ? Date.now() + 60_000 : 0,
  });
}

export function clearLoginFailures(key: string) {
  failures.delete(key);
}

export function loginLocked(key: string) {
  const current = failures.get(key);
  if (!current) return false;
  if (current.lockedUntil > Date.now()) return true;
  if (current.lockedUntil > 0 && current.lockedUntil <= Date.now()) failures.delete(key);
  return false;
}
