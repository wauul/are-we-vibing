import test from "node:test";
import assert from "node:assert/strict";
import { assertSessionAccess, friendPair, profileInput } from "../src/lib/social";

test("direct invites allow only the creator and invited account", () => {
  const session = { ownerId: "creator", invitedUserId: "friend" };
  assert.doesNotThrow(() => assertSessionAccess(session, "creator"));
  assert.doesNotThrow(() => assertSessionAccess(session, "friend"));
  for (const user of [undefined, "stranger"]) {
    assert.throws(() => assertSessionAccess(session, user), { status: 403 });
  }
  assert.throws(() => assertSessionAccess({ ownerId: null, invitedUserId: "friend" }), { status: 403 });
});

test("ordinary bearer links remain available to guests", () => {
  assert.doesNotThrow(() => assertSessionAccess({ ownerId: null, invitedUserId: null }));
  assert.doesNotThrow(() => assertSessionAccess({ ownerId: "creator", invitedUserId: null }, "stranger"));
});

test("friend pair keys prevent reciprocal duplicates", () => {
  assert.equal(friendPair("alice", "bob"), friendPair("bob", "alice"));
  assert.notEqual(friendPair("alice", "bob"), friendPair("alice", "carol"));
});

test("usernames normalize and reject unsafe or ambiguous handles", () => {
  assert.deepEqual(profileInput.parse({ username: " DJ_Alice ", name: " Alice " }), { username: "dj_alice", name: "Alice" });
  for (const username of ["ab", "a b", "alice@example.com", "a".repeat(25), "<script>"]) {
    assert.equal(profileInput.safeParse({ username, name: "Alice" }).success, false);
  }
  assert.equal(profileInput.safeParse({ username: "alice", name: " " }).success, false);
});
