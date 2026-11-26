import assert from "node:assert/strict";
import { test } from "node:test";
import { generateSlug, normalizeUrl, referrerHost, validateSlug } from "./validate.ts";

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
