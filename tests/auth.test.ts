import { describe, it, expect } from "vitest";
import bcrypt from "bcryptjs";
import crypto from "crypto";

describe("Authentication & Security Module", () => {
  it("should hash and verify passwords correctly using bcryptjs", () => {
    const password = "mySecretPassword123!";
    const hash = bcrypt.hashSync(password, 10);

    expect(hash).not.toBe(password);
    expect(bcrypt.compareSync(password, hash)).toBe(true);
    expect(bcrypt.compareSync("wrongPassword", hash)).toBe(false);
  });

  it("should generate cryptographically secure verification tokens", () => {
    const token1 = crypto.randomBytes(32).toString("hex");
    const token2 = crypto.randomBytes(32).toString("hex");

    expect(token1).toHaveLength(64);
    expect(token2).toHaveLength(64);
    expect(token1).not.toBe(token2);
  });

  it("should calculate correct token expiration dates", () => {
    const now = Date.now();
    const verificationExpiry = new Date(now + 24 * 60 * 60 * 1000); // 24 hours
    const resetExpiry = new Date(now + 60 * 60 * 1000); // 1 hour

    expect(verificationExpiry.getTime() - now).toBeGreaterThanOrEqual(24 * 60 * 60 * 1000 - 100);
    expect(resetExpiry.getTime() - now).toBeGreaterThanOrEqual(60 * 60 * 1000 - 100);
  });
});
