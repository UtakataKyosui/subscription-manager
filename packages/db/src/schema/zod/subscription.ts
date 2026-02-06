import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { subscriptionGenre, subscription, subscriptionToGenre } from "../subscription";
import { z } from "zod";

// ジャンル用スキーマ
export const insertSubscriptionGenreSchema = createInsertSchema(subscriptionGenre, {
    name: (schema) => schema.min(1, "ジャンル名を入力してください"),
    isCalendarTarget: (schema) => schema.optional(),
});

export const selectSubscriptionGenreSchema = createSelectSchema(subscriptionGenre);

// サブスクリプション用スキーマ（genreIdなし）
export const insertSubscriptionSchema = createInsertSchema(subscription, {
    name: (schema) => schema.min(1, "サービス名を入力してください"),
    price: (schema) => schema.positive("料金は0より大きい値を入力してください"),
    monthlyCount: (schema) => schema.nonnegative("月間回数は0以上の値を入力してください").optional(),
    dailyCount: (schema) => schema.nonnegative("1日あたりの回数は0以上の値を入力してください").optional(),
});

export const selectSubscriptionSchema = createSelectSchema(subscription);

// 中間テーブル用スキーマ
export const insertSubscriptionToGenreSchema = createInsertSchema(subscriptionToGenre);
export const selectSubscriptionToGenreSchema = createSelectSchema(subscriptionToGenre);

// 更新用スキーマ（部分更新対応）
export const updateSubscriptionGenreSchema = insertSubscriptionGenreSchema
    .partial()
    .omit({ userId: true, createdAt: true, updatedAt: true });

export const updateSubscriptionSchema = insertSubscriptionSchema
    .partial()
    .omit({ userId: true, createdAt: true, updatedAt: true });

// Type exports
export type InsertSubscriptionGenre = z.infer<typeof insertSubscriptionGenreSchema>;
export type SelectSubscriptionGenre = z.infer<typeof selectSubscriptionGenreSchema>;
export type UpdateSubscriptionGenre = z.infer<typeof updateSubscriptionGenreSchema>;

export type InsertSubscription = z.infer<typeof insertSubscriptionSchema>;
export type SelectSubscription = z.infer<typeof selectSubscriptionSchema>;
export type UpdateSubscription = z.infer<typeof updateSubscriptionSchema>;

export type InsertSubscriptionToGenre = z.infer<typeof insertSubscriptionToGenreSchema>;
export type SelectSubscriptionToGenre = z.infer<typeof selectSubscriptionToGenreSchema>;

