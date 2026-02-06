import { describe, it, expect } from "vitest";
import {
    insertSubscriptionGenreSchema,
    selectSubscriptionGenreSchema,
    insertSubscriptionSchema,
    selectSubscriptionSchema,
    insertSubscriptionToGenreSchema,
    selectSubscriptionToGenreSchema,
} from "./subscription";

describe("Subscription Genre Zod Schemas", () => {
    describe("insertSubscriptionGenreSchema", () => {
        it("should validate valid genre insert data with required fields", () => {
            const validData = {
                name: "動画配信",
                userId: "user-123",
            };

            const result = insertSubscriptionGenreSchema.safeParse(validData);
            expect(result.success).toBe(true);
        });

        it("should validate valid genre insert data with all fields", () => {
            const validData = {
                id: 1,
                name: "音楽",
                userId: "user-123",
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            const result = insertSubscriptionGenreSchema.safeParse(validData);
            expect(result.success).toBe(true);
        });

        it("should reject missing name field", () => {
            const invalidData = {
                userId: "user-123",
            };

            const result = insertSubscriptionGenreSchema.safeParse(invalidData);
            expect(result.success).toBe(false);
        });

        it("should reject empty name", () => {
            const invalidData = {
                name: "",
                userId: "user-123",
            };

            const result = insertSubscriptionGenreSchema.safeParse(invalidData);
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.issues[0].message).toBe("ジャンル名を入力してください");
            }
        });

        it("should reject missing userId field", () => {
            const invalidData = {
                name: "動画配信",
            };

            const result = insertSubscriptionGenreSchema.safeParse(invalidData);
            expect(result.success).toBe(false);
        });
    });

    describe("selectSubscriptionGenreSchema", () => {
        it("should validate valid genre select data", () => {
            const validData = {
                id: 1,
                name: "動画配信",
                userId: "user-123",
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            const result = selectSubscriptionGenreSchema.safeParse(validData);
            expect(result.success).toBe(true);
        });

        it("should reject missing id field", () => {
            const invalidData = {
                name: "動画配信",
                userId: "user-123",
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            const result = selectSubscriptionGenreSchema.safeParse(invalidData);
            expect(result.success).toBe(false);
        });
    });
});

describe("Subscription Zod Schemas", () => {
    describe("insertSubscriptionSchema", () => {
        it("should validate valid subscription insert data with required fields", () => {
            // genreIdは不要になった
            const validData = {
                name: "Netflix",
                price: 1490,
                userId: "user-123",
            };

            const result = insertSubscriptionSchema.safeParse(validData);
            expect(result.success).toBe(true);
        });

        it("should validate valid subscription insert data with all fields", () => {
            const validData = {
                id: 1,
                name: "Spotify",
                price: 980,
                userId: "user-123",
                description: "音楽ストリーミングサービス",
                isActive: true,
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            const result = insertSubscriptionSchema.safeParse(validData);
            expect(result.success).toBe(true);
        });

        it("should accept isActive as false", () => {
            const validData = {
                name: "Adobe CC",
                price: 6480,
                userId: "user-123",
                isActive: false,
            };

            const result = insertSubscriptionSchema.safeParse(validData);
            expect(result.success).toBe(true);
        });

        it("should reject missing name field", () => {
            const invalidData = {
                price: 1490,
                userId: "user-123",
            };

            const result = insertSubscriptionSchema.safeParse(invalidData);
            expect(result.success).toBe(false);
        });

        it("should reject empty name", () => {
            const invalidData = {
                name: "",
                price: 1490,
                userId: "user-123",
            };

            const result = insertSubscriptionSchema.safeParse(invalidData);
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.issues[0].message).toBe("サービス名を入力してください");
            }
        });

        it("should reject missing price field", () => {
            const invalidData = {
                name: "Netflix",
                userId: "user-123",
            };

            const result = insertSubscriptionSchema.safeParse(invalidData);
            expect(result.success).toBe(false);
        });

        it("should reject zero price", () => {
            const invalidData = {
                name: "Netflix",
                price: 0,
                userId: "user-123",
            };

            const result = insertSubscriptionSchema.safeParse(invalidData);
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.issues[0].message).toBe("料金は0より大きい値を入力してください");
            }
        });

        it("should reject negative price", () => {
            const invalidData = {
                name: "Netflix",
                price: -100,
                userId: "user-123",
            };

            const result = insertSubscriptionSchema.safeParse(invalidData);
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.issues[0].message).toBe("料金は0より大きい値を入力してください");
            }
        });

        it("should reject missing userId field", () => {
            const invalidData = {
                name: "Netflix",
                price: 1490,
            };

            const result = insertSubscriptionSchema.safeParse(invalidData);
            expect(result.success).toBe(false);
        });
    });

    describe("selectSubscriptionSchema", () => {
        it("should validate valid subscription select data", () => {
            const validData = {
                id: 1,
                name: "Netflix",
                price: 1490,
                userId: "user-123",
                description: null,
                isActive: true,
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            const result = selectSubscriptionSchema.safeParse(validData);
            expect(result.success).toBe(true);
        });

        it("should validate subscription with description", () => {
            const validData = {
                id: 2,
                name: "Spotify",
                price: 980,
                userId: "user-123",
                description: "音楽ストリーミング",
                isActive: true,
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            const result = selectSubscriptionSchema.safeParse(validData);
            expect(result.success).toBe(true);
        });

        it("should reject missing id field", () => {
            const invalidData = {
                name: "Netflix",
                price: 1490,
                userId: "user-123",
                description: null,
                isActive: true,
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            const result = selectSubscriptionSchema.safeParse(invalidData);
            expect(result.success).toBe(false);
        });
    });
});

describe("SubscriptionToGenre Zod Schemas", () => {
    describe("insertSubscriptionToGenreSchema", () => {
        it("should validate valid relation insert data", () => {
            const validData = {
                subscriptionId: 1,
                genreId: 1,
            };

            const result = insertSubscriptionToGenreSchema.safeParse(validData);
            expect(result.success).toBe(true);
        });

        it("should reject missing subscriptionId", () => {
            const invalidData = {
                genreId: 1,
            };

            const result = insertSubscriptionToGenreSchema.safeParse(invalidData);
            expect(result.success).toBe(false);
        });

        it("should reject missing genreId", () => {
            const invalidData = {
                subscriptionId: 1,
            };

            const result = insertSubscriptionToGenreSchema.safeParse(invalidData);
            expect(result.success).toBe(false);
        });
    });

    describe("selectSubscriptionToGenreSchema", () => {
        it("should validate valid relation select data", () => {
            const validData = {
                subscriptionId: 1,
                genreId: 1,
            };

            const result = selectSubscriptionToGenreSchema.safeParse(validData);
            expect(result.success).toBe(true);
        });
    });
});
