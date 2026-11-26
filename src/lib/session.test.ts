import assert from "node:assert/strict";
import { test } from "node:test";
import { checkPassword, createSessionToken, verifySessionToken } from "./session.ts";

process.env.ADMIN_PASSWORD = "correct horse";
process.env.SESSION_SECRET = "test-secret";

test("a fresh token verifies", async () => {
  assert.equal(await verifySessionToken(await createSessionToken()), true);
});

test("expired, tampered and missing tokens are rejected", async () => {
  const old = await createSessionToken(Date.now() - 1000 * 60 * 60 * 24 * 8);
  assert.equal(await verifySessionToken(old), false);

  const [expires, signature] = (await createSessionToken()).split(".");
  assert.equal(await verifySessionToken(`${Number(expires) + 1}.${signature}`), false);
  assert.equal(await verifySessionToken(undefined), false);
  assert.equal(await verifySessionToken("garbage"), false);
});

test("checkPassword only accepts the configured password", async () => {
  assert.equal(await checkPassword("correct horse"), true);
  assert.equal(await checkPassword("wrong"), false);
  assert.equal(await checkPassword(""), false);
});
