import assert from "node:assert/strict";
import { test } from "node:test";
import { clientIp, generateSlug, isOwnerId, normalizeUrl, referrerHost, validateSlug } from "./validate.ts";

test("normalizeUrl adds https and keeps valid URLs", () => {
  assert.deepEqual(normalizeUrl("example.com/page"), { ok: true, value: "https://example.com/page" });
  assert.deepEqual(normalizeUrl(" http://example.com "), { ok: true, value: "http://example.com/" });
});

test("normalizeUrl rejects empty, non-http and bare-word input", () => {
  assert.equal(normalizeUrl("").ok, false);
  assert.equal(normalizeUrl("javascript:alert(1)").ok, false);
  assert.equal(normalizeUrl("ftp://example.com").ok, false);
  assert.equal(normalizeUrl("notaurl").ok, false);
});

test("validateSlug enforces the pattern and reserved words", () => {
  assert.deepEqual(validateSlug("my-link_1"), { ok: true, value: "my-link_1" });
  assert.equal(validateSlug("ab").ok, false);
  assert.equal(validateSlug("has space").ok, false);
  assert.equal(validateSlug("a/b/c").ok, false);
  assert.equal(validateSlug("Dashboard").ok, false);
  assert.equal(validateSlug("admin").ok, false);
});

test("generateSlug produces valid, varied slugs", () => {
  const slugs = new Set(Array.from({ length: 200 }, () => generateSlug()));
  assert.ok(slugs.size > 195);
  for (const slug of slugs) assert.ok(validateSlug(slug).ok, slug);
});

test("referrerHost extracts the host without www", () => {
  assert.equal(referrerHost("https://www.linkedin.com/feed/"), "linkedin.com");
  assert.equal(referrerHost("not a url"), null);
  assert.equal(referrerHost(null), null);
});

test("isOwnerId accepts only 32-char lowercase hex", () => {
  assert.equal(isOwnerId("0123456789abcdef0123456789abcdef"), true);
  assert.equal(isOwnerId("0123456789ABCDEF0123456789ABCDEF"), false);
  assert.equal(isOwnerId("short"), false);
  assert.equal(isOwnerId(undefined), false);
});

test("clientIp prefers the first forwarded address", () => {
  assert.equal(clientIp("203.0.113.5, 10.0.0.1", "10.0.0.2"), "203.0.113.5");
  assert.equal(clientIp(null, " 198.51.100.7 "), "198.51.100.7");
  assert.equal(clientIp("", null), "unknown");
});
