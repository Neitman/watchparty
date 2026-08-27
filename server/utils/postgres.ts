import { Client, type QueryResult } from "pg";
import config from "../config.ts";

const useSsl =
  config.DATABASE_URL?.includes("sslmode=disable") ||
  config.DATABASE_URL?.includes("localhost") ||
  config.DATABASE_URL?.includes("127.0.0.1")
    ? false
    : { rejectUnauthorized: false };

export let postgres: Client | undefined = undefined;

async function connectPostgres() {
  if (!config.DATABASE_URL) return;
  try {
    const client = new Client({
      connectionString: config.DATABASE_URL,
      ssl: useSsl,
    });
    client.on("error", (err) => {
      console.warn("Postgres connection error:", err.message);
      postgres = undefined;
      setTimeout(connectPostgres, 5000);
    });
    await client.connect();
    postgres = client;
    console.log("Connected to Postgres database.");
  } catch (err: any) {
    console.warn("Failed to connect to Postgres:", err.message);
    postgres = undefined;
    setTimeout(connectPostgres, 5000);
  }
}

connectPostgres();

/**
 * Use this if we need a new connection instead of sharing.
 * Guarantees we'll return a client because we throw if we don't have it configured
 * @returns
 */
export function newPostgres() {
  if (!config.DATABASE_URL) {
    throw new Error("postgres not configured");
  }
  const postgres = new Client({
    connectionString: config.DATABASE_URL,
    ssl: useSsl,
  });
  postgres.connect();
  return postgres;
}

export async function updateObject(
  postgres: Client,
  table: string,
  object: AnyDict,
  condition: AnyDict,
): Promise<QueryResult<any>> {
  const columns = Object.keys(object);
  const values = Object.values(object);
  // TODO support compound conditions, not just one
  let query = `UPDATE ${table} SET ${columns
    .map((c, i) => `"${c}" = $${i + 1}`)
    .join(",")}
    WHERE "${Object.keys(condition)[0]}" = $${Object.keys(object).length + 1}
    RETURNING *`;
  //console.log(query);
  const result = await postgres.query(query, [
    ...values,
    condition[Object.keys(condition)[0]],
  ]);
  return result;
}

export async function insertObject(
  postgres: Client,
  table: string,
  object: AnyDict,
): Promise<QueryResult<any>> {
  const columns = Object.keys(object);
  const values = Object.values(object);
  let query = `INSERT INTO ${table} (${columns.map((c) => `"${c}"`).join(",")})
    VALUES (${values.map((_, i) => "$" + (i + 1)).join(",")})
    RETURNING *`;
  // console.log(query);
  const result = await postgres.query(query, values);
  return result;
}

export async function upsertObject(
  postgres: Client,
  table: string,
  object: AnyDict,
  conflict: BooleanDict,
): Promise<QueryResult<any>> {
  const columns = Object.keys(object);
  const values = Object.values(object);
  let query = `INSERT INTO ${table} (${columns.map((c) => `"${c}"`).join(",")})
    VALUES (${values.map((_, i) => "$" + (i + 1)).join(",")})
    ON CONFLICT (${Object.keys(conflict)
      .map((k) => `"${k}"`)
      .join(",")})
    DO UPDATE SET ${Object.keys(object)
      .map((c) => `"${c}" = EXCLUDED."${c}"`)
      .join(",")}
    RETURNING *`;
  // console.log(query);
  const result = await postgres.query(query, values);
  return result;
}
