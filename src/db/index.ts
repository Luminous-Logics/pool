import { createClient, type Client } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./schema";

const TURSO_URL = process.env.TURSO_DATABASE_URL || "libsql://survey-ananthu.aws-ap-south-1.turso.io";
const TURSO_AUTH_TOKEN = process.env.TURSO_AUTH_TOKEN;

let activeClient: Client;

function initClient(): Client {
  if (TURSO_AUTH_TOKEN) {
    try {
      return createClient({
        url: TURSO_URL,
        authToken: TURSO_AUTH_TOKEN,
      });
    } catch (e) {
      console.warn("Failed to create remote Turso client, falling back to local:", e);
    }
  }

  // If no auth token provided and remote is libsql://, Turso cloud requires a token.
  // We can try remote first, but if token is missing or unauthorized, use local SQLite.
  if (TURSO_URL.startsWith("libsql://") && !TURSO_AUTH_TOKEN) {
    console.log("No TURSO_AUTH_TOKEN provided for remote Turso. Using local SQLite fallback for seamless execution.");
    return createClient({
      url: "file:./survey_local.db",
    });
  }

  return createClient({
    url: TURSO_URL,
    authToken: TURSO_AUTH_TOKEN,
  });
}

activeClient = initClient();

export const client = activeClient;
export const db = drizzle(client, { schema });

let isInitialized = false;

export async function ensureTables() {
  if (isInitialized) return;

  const schemaStatements = [
    `CREATE TABLE IF NOT EXISTS polls (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      status TEXT NOT NULL DEFAULT 'active',
      creator_key TEXT NOT NULL,
      collect_email INTEGER NOT NULL DEFAULT 0,
      reveal_immediately INTEGER NOT NULL DEFAULT 1,
      is_answer_revealed INTEGER NOT NULL DEFAULT 0,
      show_public_results INTEGER NOT NULL DEFAULT 1,
      show_voter_details INTEGER NOT NULL DEFAULT 1,
      created_at INTEGER NOT NULL
    );`,
    `CREATE TABLE IF NOT EXISTS questions (
      id TEXT PRIMARY KEY,
      poll_id TEXT NOT NULL REFERENCES polls(id) ON DELETE CASCADE,
      question_text TEXT NOT NULL,
      order_index INTEGER NOT NULL DEFAULT 0
    );`,
    `CREATE TABLE IF NOT EXISTS options (
      id TEXT PRIMARY KEY,
      question_id TEXT NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
      text TEXT NOT NULL,
      media_type TEXT NOT NULL DEFAULT 'text',
      media_url TEXT,
      is_correct INTEGER NOT NULL DEFAULT 0,
      order_index INTEGER NOT NULL DEFAULT 0
    );`,
    `CREATE TABLE IF NOT EXISTS votes (
      id TEXT PRIMARY KEY,
      poll_id TEXT NOT NULL REFERENCES polls(id) ON DELETE CASCADE,
      question_id TEXT NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
      option_id TEXT NOT NULL REFERENCES options(id) ON DELETE CASCADE,
      voter_name TEXT NOT NULL,
      voter_email TEXT,
      voter_identifier TEXT NOT NULL,
      created_at INTEGER NOT NULL
    );`
  ];

  try {
    for (const stmt of schemaStatements) {
      await client.execute(stmt);
    }
    isInitialized = true;
    console.log("Database tables verified & initialized.");
  } catch (err: unknown) {
    console.warn("Error running schema on primary client:", err);
    try {
      console.log("Attempting fallback initialization on local SQLite...");
      const localClient = createClient({ url: "file:./survey_local.db" });
      for (const stmt of schemaStatements) {
        await localClient.execute(stmt);
      }
      isInitialized = true;
      console.log("Database initialized on fallback SQLite successfully.");
    } catch (fallbackErr) {
      console.error("Fatal table initialization error:", fallbackErr);
    }
  }
}
