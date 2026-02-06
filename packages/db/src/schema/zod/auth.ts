import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { user, session, account, verification } from "../auth";
import { z } from "zod";

// User schemas
export const insertUserSchema = createInsertSchema(user, {
    email: (schema) => schema.email(),
});

export const selectUserSchema = createSelectSchema(user);

// Session schemas
export const insertSessionSchema = createInsertSchema(session);

export const selectSessionSchema = createSelectSchema(session);

// Account schemas
export const insertAccountSchema = createInsertSchema(account);

export const selectAccountSchema = createSelectSchema(account);

// Verification schemas
export const insertVerificationSchema = createInsertSchema(verification);

export const selectVerificationSchema = createSelectSchema(verification);

// Type exports
export type InsertUser = z.infer<typeof insertUserSchema>;
export type SelectUser = z.infer<typeof selectUserSchema>;
export type InsertSession = z.infer<typeof insertSessionSchema>;
export type SelectSession = z.infer<typeof selectSessionSchema>;
export type InsertAccount = z.infer<typeof insertAccountSchema>;
export type SelectAccount = z.infer<typeof selectAccountSchema>;
export type InsertVerification = z.infer<typeof insertVerificationSchema>;
export type SelectVerification = z.infer<typeof selectVerificationSchema>;
