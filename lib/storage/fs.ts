import { list, put } from "@vercel/blob";
import type { ZodType } from "zod";

const BLOB_ACCESS = "public" as const;

async function readBlobText(key: string): Promise<string | null> {
  const { blobs } = await list({ prefix: key, limit: 1 });
  const match = blobs.find((b) => b.pathname === key);
  if (!match) return null;
  const res = await fetch(match.url, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Failed to fetch blob ${key}: ${res.status}`);
  }
  return res.text();
}

export async function writeJson<T>(key: string, value: T): Promise<void> {
  const data = JSON.stringify(value, null, 2);
  await put(key, data, {
    access: BLOB_ACCESS,
    contentType: "application/json",
    addRandomSuffix: false,
    allowOverwrite: true,
  });
}

export async function readJson<T>(key: string, schema: ZodType<T>): Promise<T> {
  const text = await readBlobText(key);
  if (text === null) {
    throw new Error(`Blob not found: ${key}`);
  }
  return schema.parse(JSON.parse(text));
}

export async function tryReadJson<T>(
  key: string,
  schema: ZodType<T>,
): Promise<T | null> {
  const text = await readBlobText(key);
  if (text === null) return null;
  return schema.parse(JSON.parse(text));
}

export async function listJson<T>(
  prefix: string,
  schema: ZodType<T>,
): Promise<T[]> {
  const normalised = prefix.endsWith("/") ? prefix : `${prefix}/`;
  const { blobs } = await list({ prefix: normalised });
  const jsonBlobs = blobs.filter((b) => b.pathname.endsWith(".json"));
  return Promise.all(
    jsonBlobs.map(async (b) => {
      const res = await fetch(b.url, { cache: "no-store" });
      if (!res.ok) {
        throw new Error(`Failed to fetch blob ${b.pathname}: ${res.status}`);
      }
      return schema.parse(JSON.parse(await res.text()));
    }),
  );
}

export async function writeText(
  key: string,
  content: string,
  contentType = "text/plain",
): Promise<void> {
  await put(key, content, {
    access: BLOB_ACCESS,
    contentType,
    addRandomSuffix: false,
    allowOverwrite: true,
  });
}

export async function tryReadText(key: string): Promise<string | null> {
  return readBlobText(key);
}
