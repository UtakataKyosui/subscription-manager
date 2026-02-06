import { describe, it, expect } from "vitest";
import { insertTodoSchema, selectTodoSchema } from "./todo";

describe("Todo Zod Schemas", () => {
    describe("insertTodoSchema", () => {
        it("should validate valid todo insert data with required fields", () => {
            const validData = {
                text: "Test todo item",
            };

            const result = insertTodoSchema.safeParse(validData);
            expect(result.success).toBe(true);
        });

        it("should validate valid todo insert data with all fields", () => {
            const validData = {
                id: 1,
                text: "Test todo item",
                completed: false,
            };

            const result = insertTodoSchema.safeParse(validData);
            expect(result.success).toBe(true);
        });

        it("should accept completed as true", () => {
            const validData = {
                text: "Completed todo",
                completed: true,
            };

            const result = insertTodoSchema.safeParse(validData);
            expect(result.success).toBe(true);
        });

        it("should reject missing text field", () => {
            const invalidData = {
                completed: false,
            };

            const result = insertTodoSchema.safeParse(invalidData);
            expect(result.success).toBe(false);
        });

        it("should reject empty text", () => {
            const invalidData = {
                text: "",
                completed: false,
            };

            const result = insertTodoSchema.safeParse(invalidData);
            expect(result.success).toBe(false);
        });
    });

    describe("selectTodoSchema", () => {
        it("should validate valid todo select data", () => {
            const validData = {
                id: 1,
                text: "Test todo item",
                completed: false,
            };

            const result = selectTodoSchema.safeParse(validData);
            expect(result.success).toBe(true);
        });

        it("should validate todo with completed status", () => {
            const validData = {
                id: 2,
                text: "Completed todo",
                completed: true,
            };

            const result = selectTodoSchema.safeParse(validData);
            expect(result.success).toBe(true);
        });

        it("should reject missing id field", () => {
            const invalidData = {
                text: "Test todo item",
                completed: false,
            };

            const result = selectTodoSchema.safeParse(invalidData);
            expect(result.success).toBe(false);
        });

        it("should reject missing required fields", () => {
            const invalidData = {
                id: 1,
            };

            const result = selectTodoSchema.safeParse(invalidData);
            expect(result.success).toBe(false);
        });
    });
});
