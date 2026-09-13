import test from "node:test";
import assert from "node:assert/strict";
import { api, rememberCreator, isCreator } from "../src/lib/client-api";

test("proxy HTML errors are readable and mutations are never retried", async () => {
  const original = global.fetch;
  let calls = 0;
  global.fetch = async () => { calls++; return new Response("<html>Unavailable</html>", { status: 503 }); };
  try {
    await assert.rejects(() => api("/api/sessions", { name: "Alex" }), /latest version/);
    assert.equal(calls, 1);
  } finally { global.fetch = original; }
});
test("API validation details survive the client wrapper", async () => {
  const original = global.fetch;
  global.fetch = async () => Response.json({ error: "Add a little music first." }, { status: 400 });
  try { await assert.rejects(() => api("/api/sessions", {}), /Add a little music/); }
  finally { global.fetch = original; }
});
test("unavailable browser storage cannot break successful session navigation", () => {
  const original = Object.getOwnPropertyDescriptor(globalThis, "localStorage");
  Object.defineProperty(globalThis, "localStorage", { configurable: true, get() { throw new Error("Storage disabled"); } });
  try { assert.doesNotThrow(() => rememberCreator("example")); assert.equal(isCreator("example"), true); assert.equal(isCreator("not-created-here"), false); }
  finally { if (original) Object.defineProperty(globalThis, "localStorage", original); else Reflect.deleteProperty(globalThis, "localStorage"); }
});
