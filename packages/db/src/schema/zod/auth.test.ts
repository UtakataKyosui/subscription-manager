import { describe, it, expect } from "vitest";
import {
    insertUserSchema,
    selectUserSchema,
    insertSessionSchema,
    selectSessionSchema,
    insertAccountSchema,
    selectAccountSchema,
    insertVerificationSchema,
    selectVerificationSchema,
} from "./auth";

describe("Auth Zod Schemas", () => {
    describe("User Schema", () => {
        describe("insertUserSchema", () => {
            it("should validate valid user insert data", () => {
                const validData = {
                    id: "user_123",
                    name: "Test User",
                    email: "test@example.com",
                    emailVerified: false,
                };

                const result = insertUserSchema.safeParse(validData);
                expect(result.success).toBe(true);
            });

            it("should accept optional fields", () => {
                const validData = {
                    id: "user_123",
                    name: "Test User",
                    email: "test@example.com",
                    emailVerified: true,
                    image: "https://example.com/avatar.png",
                };

                const result = insertUserSchema.safeParse(validData);
                expect(result.success).toBe(true);
            });

            it("should reject invalid email", () => {
                const invalidData = {
                    id: "user_123",
                    name: "Test User",
                    email: "invalid-email",
                    emailVerified: false,
                };

                const result = insertUserSchema.safeParse(invalidData);
                expect(result.success).toBe(false);
            });

            it("should reject missing required fields", () => {
                const invalidData = {
                    id: "user_123",
                    name: "Test User",
                };

                const result = insertUserSchema.safeParse(invalidData);
                expect(result.success).toBe(false);
            });
        });

        describe("selectUserSchema", () => {
            it("should validate valid user select data", () => {
                const validData = {
                    id: "user_123",
                    name: "Test User",
                    email: "test@example.com",
                    emailVerified: false,
                    image: null,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                };

                const result = selectUserSchema.safeParse(validData);
                expect(result.success).toBe(true);
            });
        });
    });

    describe("Session Schema", () => {
        describe("insertSessionSchema", () => {
            it("should validate valid session insert data", () => {
                const validData = {
                    id: "session_123",
                    expiresAt: new Date(Date.now() + 86400000),
                    token: "token_abc123",
                    userId: "user_123",
                };

                const result = insertSessionSchema.safeParse(validData);
                expect(result.success).toBe(true);
            });

            it("should accept optional ipAddress and userAgent", () => {
                const validData = {
                    id: "session_123",
                    expiresAt: new Date(Date.now() + 86400000),
                    token: "token_abc123",
                    userId: "user_123",
                    ipAddress: "192.168.1.1",
                    userAgent: "Mozilla/5.0",
                };

                const result = insertSessionSchema.safeParse(validData);
                expect(result.success).toBe(true);
            });

            it("should reject missing required fields", () => {
                const invalidData = {
                    id: "session_123",
                    token: "token_abc123",
                };

                const result = insertSessionSchema.safeParse(invalidData);
                expect(result.success).toBe(false);
            });
        });

        describe("selectSessionSchema", () => {
            it("should validate valid session select data", () => {
                const validData = {
                    id: "session_123",
                    expiresAt: new Date(),
                    token: "token_abc123",
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    ipAddress: null,
                    userAgent: null,
                    userId: "user_123",
                };

                const result = selectSessionSchema.safeParse(validData);
                expect(result.success).toBe(true);
            });
        });
    });

    describe("Account Schema", () => {
        describe("insertAccountSchema", () => {
            it("should validate valid account insert data", () => {
                const validData = {
                    id: "account_123",
                    accountId: "google_123",
                    providerId: "google",
                    userId: "user_123",
                };

                const result = insertAccountSchema.safeParse(validData);
                expect(result.success).toBe(true);
            });

            it("should accept optional token fields", () => {
                const validData = {
                    id: "account_123",
                    accountId: "google_123",
                    providerId: "google",
                    userId: "user_123",
                    accessToken: "access_token",
                    refreshToken: "refresh_token",
                    idToken: "id_token",
                    accessTokenExpiresAt: new Date(),
                    refreshTokenExpiresAt: new Date(),
                    scope: "read write",
                    password: "hashed_password",
                };

                const result = insertAccountSchema.safeParse(validData);
                expect(result.success).toBe(true);
            });

            it("should reject missing required fields", () => {
                const invalidData = {
                    id: "account_123",
                    providerId: "google",
                };

                const result = insertAccountSchema.safeParse(invalidData);
                expect(result.success).toBe(false);
            });
        });

        describe("selectAccountSchema", () => {
            it("should validate valid account select data", () => {
                const validData = {
                    id: "account_123",
                    accountId: "google_123",
                    providerId: "google",
                    userId: "user_123",
                    accessToken: null,
                    refreshToken: null,
                    idToken: null,
                    accessTokenExpiresAt: null,
                    refreshTokenExpiresAt: null,
                    scope: null,
                    password: null,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                };

                const result = selectAccountSchema.safeParse(validData);
                expect(result.success).toBe(true);
            });
        });
    });

    describe("Verification Schema", () => {
        describe("insertVerificationSchema", () => {
            it("should validate valid verification insert data", () => {
                const validData = {
                    id: "verification_123",
                    identifier: "test@example.com",
                    value: "verification_code",
                    expiresAt: new Date(Date.now() + 86400000),
                };

                const result = insertVerificationSchema.safeParse(validData);
                expect(result.success).toBe(true);
            });

            it("should reject missing required fields", () => {
                const invalidData = {
                    id: "verification_123",
                    identifier: "test@example.com",
                };

                const result = insertVerificationSchema.safeParse(invalidData);
                expect(result.success).toBe(false);
            });
        });

        describe("selectVerificationSchema", () => {
            it("should validate valid verification select data", () => {
                const validData = {
                    id: "verification_123",
                    identifier: "test@example.com",
                    value: "verification_code",
                    expiresAt: new Date(),
                    createdAt: new Date(),
                    updatedAt: new Date(),
                };

                const result = selectVerificationSchema.safeParse(validData);
                expect(result.success).toBe(true);
            });
        });
    });
});
