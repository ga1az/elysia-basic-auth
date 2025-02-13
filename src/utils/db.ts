import { Database } from "bun:sqlite";

export const db = () => {
  const db = new Database("auth.sqlite", { create: true });
  return db;
};

export const createAllTables = (db: Database) => {
  const createTableUser = db.query(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      created_at TEXT,
      updated_at TEXT,
      email_verified BOOLEAN
    );
  `);

  createTableUser.run();

  const createTableSession = db.query(`
    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      created_at TEXT,
      updated_at TEXT,
      expires_at TEXT,
      ip_address TEXT,
      user_agent TEXT,
      token TEXT NOT NULL UNIQUE
    );
  `);

  createTableSession.run();

  const createTableOrganization = db.query(`
    CREATE TABLE IF NOT EXISTS organizations (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      created_at TEXT,
      updated_at TEXT
    );
  `);

  createTableOrganization.run();

  const createTableAccount = db.query(`
  CREATE TABLE IF NOT EXISTS accounts (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    provider_id TEXT NOT NULL,
    password TEXT NOT NULL
  );
`);

  createTableAccount.run();

  const createTableMember = db.query(`
    CREATE TABLE IF NOT EXISTS members (
      id TEXT PRIMARY KEY,
      organization_id TEXT NOT NULL,
      user_id TEXT NOT NULL
    );
  `);

  createTableMember.run();
};

export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface Session {
  id: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  expiresAt: string;
}

export interface Organization {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface Account {
  id: string;
  userId: string;
  providerId: string;
  password: string;
}

export interface Member {
  id: string;
  organizationId: string;
  userId: string;
}
