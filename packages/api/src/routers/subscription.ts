import { db } from "@my-better-t-app/db";
import {
    subscriptionGenre,
    subscription,
    subscriptionToGenre,
} from "@my-better-t-app/db/schema/subscription";
import { dailyMeal } from "@my-better-t-app/db/schema/daily_meal";
import { eq, and, inArray } from "drizzle-orm";
import z from "zod";

import { protectedProcedure } from "../index";

// ジャンル用ルーター
export const subscriptionGenreRouter = {
    getAll: protectedProcedure.handler(async ({ context }) => {
        return await db
            .select()
            .from(subscriptionGenre)
            .where(eq(subscriptionGenre.userId, context.session.user.id));
    }),

    create: protectedProcedure
        .input(z.object({
            name: z.string().min(1, "ジャンル名を入力してください"),
            color: z.enum([
                "red", "orange", "amber", "yellow", "lime", "green", "emerald", "teal",
                "cyan", "sky", "blue", "indigo", "violet", "purple", "fuchsia", "pink", "rose",
                "slate", "gray", "zinc", "neutral", "stone"
            ]).optional(),
        }))
        .handler(async ({ input, context }) => {
            const [newGenre] = await db
                .insert(subscriptionGenre)
                .values({
                    name: input.name,
                    color: input.color ?? "amber",
                    userId: context.session.user.id,
                    isCalendarTarget: false,
                })
                .returning();
            return newGenre;
        }),

    update: protectedProcedure
        .input(z.object({ id: z.number(), name: z.string().min(1, "ジャンル名を入力してください") }))
        .handler(async ({ input, context }) => {
            const [updated] = await db
                .update(subscriptionGenre)
                .set({ name: input.name })
                .where(
                    and(
                        eq(subscriptionGenre.id, input.id),
                        eq(subscriptionGenre.userId, context.session.user.id),
                    ),
                )
                .returning();
            return updated;
        }),

    delete: protectedProcedure
        .input(z.object({ id: z.number() }))
        .handler(async ({ input, context }) => {
            await db
                .delete(subscriptionGenre)
                .where(
                    and(
                        eq(subscriptionGenre.id, input.id),
                        eq(subscriptionGenre.userId, context.session.user.id),
                    ),
                );
            return { success: true };
        }),

    updateColor: protectedProcedure
        .input(z.object({
            id: z.number(),
            color: z.enum([
                "red", "orange", "amber", "yellow", "lime", "green", "emerald", "teal",
                "cyan", "sky", "blue", "indigo", "violet", "purple", "fuchsia", "pink", "rose",
                "slate", "gray", "zinc", "neutral", "stone"
            ]),
        }))
        .handler(async ({ input, context }) => {
            const [updated] = await db
                .update(subscriptionGenre)
                .set({ color: input.color })
                .where(
                    and(
                        eq(subscriptionGenre.id, input.id),
                        eq(subscriptionGenre.userId, context.session.user.id),
                    ),
                )
                .returning();
            return updated;
        }),

    // カレンダー表示対象を設定（他はfalseにする）
    setCalendarTarget: protectedProcedure
        .input(z.object({ id: z.number() }))
        .handler(async ({ input, context }) => {
            // トランザクション推奨だが、まずはシンプルに実装
            // 1. 全てfalseにする
            await db
                .update(subscriptionGenre)
                .set({ isCalendarTarget: false })
                .where(eq(subscriptionGenre.userId, context.session.user.id));

            // 2. 指定したIDをtrueにする
            const [updated] = await db
                .update(subscriptionGenre)
                .set({ isCalendarTarget: true })
                .where(
                    and(
                        eq(subscriptionGenre.id, input.id),
                        eq(subscriptionGenre.userId, context.session.user.id),
                    ),
                )
                .returning();
            return updated;
        }),
};

// サブスクリプション用ルーター
export const subscriptionRouter = {
    // ジャンル操作
    genre: subscriptionGenreRouter,

    // サブスクリプション全件取得（ジャンル情報付き）
    getAll: protectedProcedure.handler(async ({ context }) => {
        const subs = await db
            .select()
            .from(subscription)
            .where(eq(subscription.userId, context.session.user.id));

        // 各サブスクのジャンルを取得
        const subsWithGenres = await Promise.all(
            subs.map(async (sub) => {
                const relations = await db
                    .select({ genre: subscriptionGenre })
                    .from(subscriptionToGenre)
                    .innerJoin(subscriptionGenre, eq(subscriptionToGenre.genreId, subscriptionGenre.id))
                    .where(eq(subscriptionToGenre.subscriptionId, sub.id));

                return {
                    ...sub,
                    genres: relations.map((r) => r.genre),
                };
            }),
        );

        return subsWithGenres;
    }),

    // ジャンル別取得
    getByGenre: protectedProcedure
        .input(z.object({ genreId: z.number() }))
        .handler(async ({ input, context }) => {
            const relations = await db
                .select({ subscription: subscription })
                .from(subscriptionToGenre)
                .innerJoin(subscription, eq(subscriptionToGenre.subscriptionId, subscription.id))
                .where(
                    and(
                        eq(subscriptionToGenre.genreId, input.genreId),
                        eq(subscription.userId, context.session.user.id),
                    ),
                );

            return relations.map((r) => r.subscription);
        }),

    // サブスクリプション作成（ジャンルなしでOK）
    create: protectedProcedure
        .input(
            z.object({
                name: z.string().min(1, "サービス名を入力してください"),
                price: z.number().positive("料金は0より大きい値を入力してください"),
                description: z.string().optional(),
                isActive: z.boolean().optional(),
                genreIds: z.array(z.number()).optional(), // オプションでジャンルを指定可能
                monthlyCount: z.number().nonnegative("月間回数は0以上の値を入力してください").optional(),
                dailyCount: z.number().nonnegative("1日あたりの回数は0以上の値を入力してください").optional(),
            }),
        )
        .handler(async ({ input, context }) => {
            const [newSubscription] = await db
                .insert(subscription)
                .values({
                    name: input.name,
                    price: input.price,
                    userId: context.session.user.id,
                    description: input.description,
                    isActive: input.isActive ?? true,
                    monthlyCount: input.monthlyCount,
                    dailyCount: input.dailyCount,
                })
                .returning();

            if (!newSubscription) {
                throw new Error("サブスクリプションの作成に失敗しました");
            }

            // ジャンルが指定されていれば紐付け
            if (input.genreIds && input.genreIds.length > 0) {
                await db.insert(subscriptionToGenre).values(
                    input.genreIds.map((genreId) => ({
                        subscriptionId: newSubscription.id,
                        genreId,
                    })),
                );
            }

            return newSubscription;
        }),

    // サブスクリプション更新
    update: protectedProcedure
        .input(
            z.object({
                id: z.number(),
                name: z.string().min(1, "サービス名を入力してください").optional(),
                price: z.number().positive("料金は0より大きい値を入力してください").optional(),
                description: z.string().optional().nullable(),
                isActive: z.boolean().optional(),
                monthlyCount: z.number().nonnegative("月間回数は0以上の値を入力してください").optional(),
                dailyCount: z.number().nonnegative("1日あたりの回数は0以上の値を入力してください").optional(),
            }),
        )
        .handler(async ({ input, context }) => {
            const { id, ...updates } = input;
            const [updated] = await db
                .update(subscription)
                .set({
                    ...updates,
                    updatedAt: new Date(),
                })
                .where(and(eq(subscription.id, id), eq(subscription.userId, context.session.user.id)))
                .returning();
            return updated;
        }),

    // サブスクリプション削除
    delete: protectedProcedure
        .input(z.object({ id: z.number() }))
        .handler(async ({ input, context }) => {
            await db
                .delete(subscription)
                .where(
                    and(eq(subscription.id, input.id), eq(subscription.userId, context.session.user.id)),
                );
            return { success: true };
        }),

    // ジャンル紐付け操作
    addToGenre: protectedProcedure
        .input(z.object({ subscriptionId: z.number(), genreId: z.number() }))
        .handler(async ({ input, context }) => {
            // 所有権チェック
            const [sub] = await db
                .select()
                .from(subscription)
                .where(
                    and(
                        eq(subscription.id, input.subscriptionId),
                        eq(subscription.userId, context.session.user.id),
                    ),
                );

            if (!sub) {
                throw new Error("サブスクリプションが見つかりません");
            }

            await db
                .insert(subscriptionToGenre)
                .values({
                    subscriptionId: input.subscriptionId,
                    genreId: input.genreId,
                })
                .onConflictDoNothing();

            return { success: true };
        }),

    removeFromGenre: protectedProcedure
        .input(z.object({ subscriptionId: z.number(), genreId: z.number() }))
        .handler(async ({ input }) => {
            await db
                .delete(subscriptionToGenre)
                .where(
                    and(
                        eq(subscriptionToGenre.subscriptionId, input.subscriptionId),
                        eq(subscriptionToGenre.genreId, input.genreId),
                    ),
                );
            return { success: true };
        }),

    // ジャンルを一括設定
    setGenres: protectedProcedure
        .input(z.object({ subscriptionId: z.number(), genreIds: z.array(z.number()) }))
        .handler(async ({ input, context }) => {
            // 所有権チェック
            const [sub] = await db
                .select()
                .from(subscription)
                .where(
                    and(
                        eq(subscription.id, input.subscriptionId),
                        eq(subscription.userId, context.session.user.id),
                    ),
                );

            if (!sub) {
                throw new Error("サブスクリプションが見つかりません");
            }

            // 既存の紐付けを削除
            await db
                .delete(subscriptionToGenre)
                .where(eq(subscriptionToGenre.subscriptionId, input.subscriptionId));

            // 新しい紐付けを追加
            if (input.genreIds.length > 0) {
                await db.insert(subscriptionToGenre).values(
                    input.genreIds.map((genreId) => ({
                        subscriptionId: input.subscriptionId,
                        genreId,
                    })),
                );
            }

            return { success: true };
        }),

    // 集計（全体合計とジャンル別小計）
    getSummary: protectedProcedure.handler(async ({ context }) => {
        // 有効なサブスクリプションを取得
        const subscriptions = await db
            .select()
            .from(subscription)
            .where(
                and(eq(subscription.userId, context.session.user.id), eq(subscription.isActive, true)),
            );

        // ジャンルを取得
        const genres = await db
            .select()
            .from(subscriptionGenre)
            .where(eq(subscriptionGenre.userId, context.session.user.id));

        // 中間テーブルを取得
        const relations = await db
            .select()
            .from(subscriptionToGenre)
            .where(
                inArray(
                    subscriptionToGenre.subscriptionId,
                    subscriptions.map((s) => s.id),
                ),
            );

        // ジャンル別小計を計算
        const genreSummaries = genres.map((genre) => {
            const genreSubIds = relations.filter((r) => r.genreId === genre.id).map((r) => r.subscriptionId);
            const genreSubscriptions = subscriptions.filter((sub) => genreSubIds.includes(sub.id));
            const subtotal = genreSubscriptions.reduce((acc, sub) => acc + sub.price, 0);
            return {
                genre,
                subscriptions: genreSubscriptions,
                subtotal,
            };
        });

        // ジャンル未設定のサブスクリプション
        const assignedSubIds = new Set(relations.map((r) => r.subscriptionId));
        const unassignedSubscriptions = subscriptions.filter((sub) => !assignedSubIds.has(sub.id));
        const unassignedSubtotal = unassignedSubscriptions.reduce((acc, sub) => acc + sub.price, 0);

        // 全体合計を計算
        const total = subscriptions.reduce((acc, sub) => acc + sub.price, 0);

        return {
            genreSummaries,
            unassigned: {
                subscriptions: unassignedSubscriptions,
                subtotal: unassignedSubtotal,
            },
            total,
            subscriptionCount: subscriptions.length,
        };
    }),

    exportData: protectedProcedure.handler(async ({ context }) => {
        const userId = context.session.user.id;

        const genres = await db.select().from(subscriptionGenre).where(eq(subscriptionGenre.userId, userId));
        const subscriptions = await db.select().from(subscription).where(eq(subscription.userId, userId));
        const meals = await db.select().from(dailyMeal).where(eq(dailyMeal.userId, userId));

        const relations = await db
            .select()
            .from(subscriptionToGenre)
            .where(inArray(subscriptionToGenre.subscriptionId, subscriptions.map(s => s.id).length > 0 ? subscriptions.map(s => s.id) : [-1]));

        return {
            version: 1,
            genres: genres.map(g => ({
                name: g.name,
                color: g.color,
                isCalendarTarget: g.isCalendarTarget,
            })),
            subscriptions: subscriptions.map(s => ({
                name: s.name,
                price: s.price,
                description: s.description,
                isActive: s.isActive,
                monthlyCount: s.monthlyCount,
                dailyCount: s.dailyCount,
                genres: relations
                    .filter(r => r.subscriptionId === s.id)
                    .map(r => genres.find(g => g.id === r.genreId)?.name)
                    .filter(Boolean) as string[],
            })),
            dailyMeals: meals.map(m => ({
                date: m.date,
                mealType: m.mealType,
                subscriptionName: subscriptions.find(s => s.id === m.subscriptionId)?.name || null,
            })),
        };
    }),

    importData: protectedProcedure
        .input(z.object({
            version: z.number(),
            genres: z.array(z.object({
                name: z.string(),
                color: z.enum([
                    "red", "orange", "amber", "yellow", "lime", "green", "emerald", "teal",
                    "cyan", "sky", "blue", "indigo", "violet", "purple", "fuchsia", "pink", "rose",
                    "slate", "gray", "zinc", "neutral", "stone"
                ]).optional().nullable(),
                isCalendarTarget: z.boolean().optional(),
            })),
            subscriptions: z.array(z.object({
                name: z.string(),
                price: z.number(),
                description: z.string().nullable().optional(),
                isActive: z.boolean().optional(),
                monthlyCount: z.number().nullable().optional(),
                dailyCount: z.number().nullable().optional(),
                genres: z.array(z.string()),
            })),
            dailyMeals: z.array(z.object({
                date: z.string(),
                mealType: z.enum(["breakfast", "lunch", "dinner"]),
                subscriptionName: z.string().nullable(),
            })),
        }))
        .handler(async ({ input, context }) => {
            const userId = context.session.user.id;

            await db.transaction(async (tx) => {
                // 1. Genres
                const currentGenres = await tx.select().from(subscriptionGenre).where(eq(subscriptionGenre.userId, userId));
                const genreNameMap = new Map<string, number>();
                currentGenres.forEach(g => genreNameMap.set(g.name, g.id));

                for (const genre of input.genres) {
                    if (!genreNameMap.has(genre.name)) {
                        const [newGenre] = await tx.insert(subscriptionGenre).values({
                            name: genre.name,
                            color: genre.color || "amber",
                            isCalendarTarget: genre.isCalendarTarget || false,
                            userId: userId,
                        }).returning();
                        if (!newGenre) throw new Error("Failed to create genre");
                        genreNameMap.set(genre.name, newGenre.id);
                    }
                }

                // 2. Subscriptions
                const currentSubs = await tx.select().from(subscription).where(eq(subscription.userId, userId));
                const subNameMap = new Map<string, number>();
                currentSubs.forEach(s => subNameMap.set(s.name, s.id));

                for (const sub of input.subscriptions) {
                    let subId = subNameMap.get(sub.name);
                    if (!subId) {
                        const [newSub] = await tx.insert(subscription).values({
                            name: sub.name,
                            price: sub.price,
                            description: sub.description,
                            isActive: sub.isActive ?? true,
                            monthlyCount: sub.monthlyCount,
                            dailyCount: sub.dailyCount,
                            userId: userId,
                        }).returning();
                        if (!newSub) throw new Error("Failed to create subscription");
                        subId = newSub.id;
                        subNameMap.set(sub.name, subId);
                    }

                    const targetGenreIds = sub.genres.map(gName => genreNameMap.get(gName)).filter(Boolean) as number[];
                    if (targetGenreIds.length > 0) {
                        const existingLinks = await tx.select().from(subscriptionToGenre).where(eq(subscriptionToGenre.subscriptionId, subId));
                        const existingGenreIds = new Set(existingLinks.map(l => l.genreId));
                        const newLinks = targetGenreIds.filter(gid => !existingGenreIds.has(gid)).map(gid => ({ subscriptionId: subId!, genreId: gid }));
                        if (newLinks.length > 0) await tx.insert(subscriptionToGenre).values(newLinks);
                    }
                }

                // 3. Meals
                for (const meal of input.dailyMeals) {
                    const existingMeal = await tx.query.dailyMeal.findFirst({
                        where: and(
                            eq(dailyMeal.userId, userId),
                            eq(dailyMeal.date, meal.date),
                            eq(dailyMeal.mealType, meal.mealType)
                        )
                    });

                    if (!existingMeal) {
                        const subId = meal.subscriptionName ? (subNameMap.get(meal.subscriptionName) || null) : null;
                        await tx.insert(dailyMeal).values({
                            userId: userId,
                            date: meal.date,
                            mealType: meal.mealType,
                            subscriptionId: subId,
                        });
                    }
                }
            });
            return { success: true };
        }),
};
