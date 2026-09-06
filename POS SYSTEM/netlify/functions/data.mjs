import { getStore } from "@netlify/blobs";

// Optional shared passcode. Set a POS_SECRET environment variable in your
// Netlify site settings to require it; leave it unset to allow open access.
const REQUIRED_SECRET = process.env.POS_SECRET || "";

function checkAuth(req) {
  if (!REQUIRED_SECRET) return true;
  return req.headers.get("x-pos-secret") === REQUIRED_SECRET;
}

export default async (req) => {
  if (!checkAuth(req)) {
    return new Response("Unauthorized", { status: 401 });
  }

  const url = new URL(req.url);
  const key = url.searchParams.get("key");
  if (!key) {
    return new Response("Missing key parameter", { status: 400 });
  }

  const store = getStore("pos-data");

  if (req.method === "GET") {
    const value = await store.get(key);
    return new Response(value ?? "null", {
      headers: { "content-type": "application/json" }
    });
  }

  if (req.method === "PUT") {
    const body = await req.text();
    // Basic sanity check: must be valid JSON before we persist it.
    try {
      JSON.parse(body);
    } catch {
      return new Response("Invalid JSON body", { status: 400 });
    }
    await store.set(key, body);
    return new Response("OK");
  }

  return new Response("Method not allowed", { status: 405 });
};

export const config = { path: "/api/data" };
