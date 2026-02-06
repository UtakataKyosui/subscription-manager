"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { Loader2, Trash2, Plus, Edit2, Check, X, Wallet, GripVertical, Folder, FolderOpen, CalendarIcon } from "lucide-react";
import { useState, useCallback, useRef, useEffect } from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { orpc } from "@/utils/orpc";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Pie, PieChart, Label as RechartsLabel, Cell } from "recharts";
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

const ItemTypes = {
    SUBSCRIPTION: "subscription",
};

type Genre = {
    id: number;
    name: string;
    color:
    | "red" | "orange" | "amber" | "yellow" | "lime" | "green" | "emerald" | "teal"
    | "cyan" | "sky" | "blue" | "indigo" | "violet" | "purple" | "fuchsia" | "pink" | "rose"
    | "slate" | "gray" | "zinc" | "neutral" | "stone";
    isCalendarTarget: boolean;
    userId: string;
    createdAt: Date;
    updatedAt: Date;
};

type Subscription = {
    id: number;
    name: string;
    price: number;
    userId: string;
    description: string | null;
    isActive: boolean;
    monthlyCount: number | null;
    dailyCount: number | null;
    createdAt: Date;
    updatedAt: Date;
    genres: Genre[];
};

const COLOR_SCHEMES = {
    // 暖色系
    red: { icon: "text-red-500", bg: "bg-red-50 dark:bg-red-950/20", border: "border-red-200 dark:border-red-700", dot: "bg-red-500", hex: "#ef4444" },
    orange: { icon: "text-orange-500", bg: "bg-orange-50 dark:bg-orange-950/20", border: "border-orange-200 dark:border-orange-700", dot: "bg-orange-500", hex: "#f97316" },
    amber: { icon: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-950/20", border: "border-amber-200 dark:border-amber-700", dot: "bg-amber-500", hex: "#f59e0b" },
    yellow: { icon: "text-yellow-500", bg: "bg-yellow-50 dark:bg-yellow-950/20", border: "border-yellow-200 dark:border-yellow-700", dot: "bg-yellow-500", hex: "#eab308" },
    // 緑系
    lime: { icon: "text-lime-500", bg: "bg-lime-50 dark:bg-lime-950/20", border: "border-lime-200 dark:border-lime-700", dot: "bg-lime-500", hex: "#84cc16" },
    green: { icon: "text-green-500", bg: "bg-green-50 dark:bg-green-950/20", border: "border-green-200 dark:border-green-700", dot: "bg-green-500", hex: "#22c55e" },
    emerald: { icon: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-950/20", border: "border-emerald-200 dark:border-emerald-700", dot: "bg-emerald-500", hex: "#10b981" },
    teal: { icon: "text-teal-500", bg: "bg-teal-50 dark:bg-teal-950/20", border: "border-teal-200 dark:border-teal-700", dot: "bg-teal-500", hex: "#14b8a6" },
    // 青系
    cyan: { icon: "text-cyan-500", bg: "bg-cyan-50 dark:bg-cyan-950/20", border: "border-cyan-200 dark:border-cyan-700", dot: "bg-cyan-500", hex: "#06b6d4" },
    sky: { icon: "text-sky-500", bg: "bg-sky-50 dark:bg-sky-950/20", border: "border-sky-200 dark:border-sky-700", dot: "bg-sky-500", hex: "#0ea5e9" },
    blue: { icon: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-950/20", border: "border-blue-200 dark:border-blue-700", dot: "bg-blue-500", hex: "#3b82f6" },
    indigo: { icon: "text-indigo-500", bg: "bg-indigo-50 dark:bg-indigo-950/20", border: "border-indigo-200 dark:border-indigo-700", dot: "bg-indigo-500", hex: "#6366f1" },
    // 紫系
    violet: { icon: "text-violet-500", bg: "bg-violet-50 dark:bg-violet-950/20", border: "border-violet-200 dark:border-violet-700", dot: "bg-violet-500", hex: "#8b5cf6" },
    purple: { icon: "text-purple-500", bg: "bg-purple-50 dark:bg-purple-950/20", border: "border-purple-200 dark:border-purple-700", dot: "bg-purple-500", hex: "#a855f7" },
    fuchsia: { icon: "text-fuchsia-500", bg: "bg-fuchsia-50 dark:bg-fuchsia-950/20", border: "border-fuchsia-200 dark:border-fuchsia-700", dot: "bg-fuchsia-500", hex: "#d946ef" },
    // ピンク・赤系
    pink: { icon: "text-pink-500", bg: "bg-pink-50 dark:bg-pink-950/20", border: "border-pink-200 dark:border-pink-700", dot: "bg-pink-500", hex: "#ec4899" },
    rose: { icon: "text-rose-500", bg: "bg-rose-50 dark:bg-rose-950/20", border: "border-rose-200 dark:border-rose-700", dot: "bg-rose-500", hex: "#f43f5e" },
    // 無彩色系
    slate: { icon: "text-slate-500", bg: "bg-slate-50 dark:bg-slate-950/20", border: "border-slate-200 dark:border-slate-700", dot: "bg-slate-500", hex: "#64748b" },
    gray: { icon: "text-gray-500", bg: "bg-gray-50 dark:bg-gray-950/20", border: "border-gray-200 dark:border-gray-700", dot: "bg-gray-500", hex: "#6b7280" },
    zinc: { icon: "text-zinc-500", bg: "bg-zinc-50 dark:bg-zinc-950/20", border: "border-zinc-200 dark:border-zinc-700", dot: "bg-zinc-500", hex: "#71717a" },
    neutral: { icon: "text-neutral-500", bg: "bg-neutral-50 dark:bg-neutral-950/20", border: "border-neutral-200 dark:border-neutral-700", dot: "bg-neutral-500", hex: "#737373" },
    stone: { icon: "text-stone-500", bg: "bg-stone-50 dark:bg-stone-950/20", border: "border-stone-200 dark:border-stone-700", dot: "bg-stone-500", hex: "#78716c" },
} as const;

const COLOR_OPTIONS = Object.keys(COLOR_SCHEMES) as Array<keyof typeof COLOR_SCHEMES>;

// ドラッグ可能なサブスクリプションカード
function DraggableSubscription({
    sub,
    onEdit,
    onDelete,
    formatPrice,
}: {
    sub: Subscription;
    onEdit: (sub: Subscription) => void;
    onDelete: (id: number) => void;
    formatPrice: (price: number) => string;
}) {
    const previewRef = useRef<HTMLDivElement>(null);
    const dragRef = useRef<HTMLDivElement>(null);

    const [{ isDragging }, drag, preview] = useDrag(() => ({
        type: ItemTypes.SUBSCRIPTION,
        item: { id: sub.id, name: sub.name },
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
    }));

    useEffect(() => {
        if (previewRef.current) preview(previewRef.current);
        if (dragRef.current) drag(dragRef.current);
    }, [drag, preview]);

    return (
        <div
            ref={previewRef}
            className={`flex items-center justify-between rounded-md border p-3 transition-all ${isDragging ? "opacity-50 ring-2 ring-primary" : "hover:bg-accent/50"
                }`}
        >
            <div className="flex items-center gap-2">
                <div ref={dragRef} className="cursor-grab p-1 text-muted-foreground hover:text-foreground">
                    <GripVertical className="h-4 w-4" />
                </div>
                <div className="flex-1">
                    <div className="flex items-center gap-2">
                        <p className="font-medium">{sub.name}</p>
                        {sub.genres.length > 0 && (
                            <div className="flex gap-1">
                                {sub.genres.map((genre) => (
                                    <span
                                        key={genre.id}
                                        className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary"
                                    >
                                        {genre.name}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                    {sub.description && <p className="text-sm text-muted-foreground">{sub.description}</p>}
                    <div className="flex gap-2 text-xs text-muted-foreground">
                        {sub.monthlyCount && <p>月{sub.monthlyCount}回</p>}
                        {sub.dailyCount && <p>日{sub.dailyCount}回</p>}
                    </div>
                </div>
            </div>
            <div className="flex items-center gap-2">
                <span className="font-semibold">{formatPrice(sub.price)}</span>
                <Button size="icon" variant="ghost" onClick={() => onEdit(sub)}>
                    <Edit2 className="h-4 w-4" />
                </Button>
                <Button size="icon" variant="ghost" onClick={() => onDelete(sub.id)}>
                    <Trash2 className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}

// ドロップ可能なジャンルカード（フォルダスタイル）
function DroppableGenre({
    genre,
    subscriptions,
    subtotal,
    onDrop,
    onDelete,
    onColorChange,
    formatPrice,
}: {
    genre: Genre;
    subscriptions: Subscription[];
    subtotal: number;
    onDrop: (subscriptionId: number, genreId: number) => void;
    onDelete: (id: number) => void;
    onColorChange: (genreId: number, color: Genre["color"]) => void;
    formatPrice: (price: number) => string;
}) {
    const dropRef = useRef<HTMLDivElement>(null);
    const [showColorPicker, setShowColorPicker] = useState(false);

    const [{ isOver, canDrop }, drop] = useDrop(() => ({
        accept: ItemTypes.SUBSCRIPTION,
        drop: (item: { id: number }) => {
            onDrop(item.id, genre.id);
        },
        collect: (monitor) => ({
            isOver: monitor.isOver(),
            canDrop: monitor.canDrop(),
        }),
    }));

    useEffect(() => {
        if (dropRef.current) drop(dropRef.current);
    }, [drop]);

    const colorScheme = COLOR_SCHEMES[genre.color] || COLOR_SCHEMES.amber;
    const FolderIcon = isOver && canDrop ? FolderOpen : Folder;

    return (
        <div
            ref={dropRef}
            className={`rounded-lg border-2 p-4 transition-all duration-200 ${colorScheme.bg} ${colorScheme.border} ${isOver && canDrop
                ? "ring-2 ring-primary shadow-lg scale-[1.02]"
                : canDrop
                    ? "border-dashed"
                    : ""
                }`}
        >
            {/* ヘッダー */}
            <div className="flex items-center gap-3 mb-3">
                <button
                    type="button"
                    onClick={() => setShowColorPicker(!showColorPicker)}
                    className="relative"
                >
                    <FolderIcon
                        className={`h-8 w-8 transition-all duration-200 ${colorScheme.icon} ${isOver && canDrop ? "scale-110" : ""
                            } hover:scale-110`}
                    />
                </button>
                <div className="flex-1">
                    <h3 className="font-semibold text-lg">{genre.name}</h3>
                    <p className="text-xs text-muted-foreground">{subscriptions.length}件</p>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-lg font-bold">{formatPrice(subtotal)}</span>
                    <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7"
                        onClick={() => onDelete(genre.id)}
                    >
                        <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                </div>
            </div>

            {/* カラーピッカー */}
            {showColorPicker && (
                <div className="mb-3 p-3 bg-background/80 rounded-lg shadow-inner">
                    <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-11 gap-2">
                        {COLOR_OPTIONS.map((color) => (
                            <button
                                key={color}
                                type="button"
                                onClick={() => {
                                    onColorChange(genre.id, color);
                                    setShowColorPicker(false);
                                }}
                                className={`h-6 w-6 rounded-full ${COLOR_SCHEMES[color].dot} ${genre.color === color ? "ring-2 ring-offset-2 ring-foreground" : ""
                                    } hover:scale-125 transition-all duration-200 border border-foreground/10`}
                                title={color}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* コンテンツ */}
            {subscriptions.length === 0 ? (
                <div className={`py-6 text-center rounded-lg border-2 border-dashed ${colorScheme.border}`}>
                    <p className="text-sm text-muted-foreground">
                        {isOver ? "ここにドロップ！" : "ドラッグしてここにドロップ"}
                    </p>
                </div>
            ) : (
                <div className="space-y-1.5">
                    {subscriptions.map((sub) => (
                        <div
                            key={sub.id}
                            className="flex items-center justify-between rounded-md bg-background/80 px-3 py-2 text-sm shadow-sm"
                        >
                            <span className="font-medium">{sub.name}</span>
                            <span className="text-muted-foreground">{formatPrice(sub.price)}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

// ジャンル未設定のドロップエリア
function UnassignedDropZone({
    subscriptions,
    subtotal,
    onRemoveFromGenre,
    formatPrice,
}: {
    subscriptions: Subscription[];
    subtotal: number;
    onRemoveFromGenre: (subscriptionId: number) => void;
    formatPrice: (price: number) => string;
}) {
    const dropRef = useRef<HTMLDivElement>(null);

    const [{ isOver }, drop] = useDrop(() => ({
        accept: ItemTypes.SUBSCRIPTION,
        drop: (item: { id: number }) => {
            onRemoveFromGenre(item.id);
        },
        collect: (monitor) => ({
            isOver: monitor.isOver(),
        }),
    }));

    useEffect(() => {
        if (dropRef.current) drop(dropRef.current);
    }, [drop]);

    if (subscriptions.length === 0) return null;

    return (
        <div
            ref={dropRef}
            className={`rounded-lg border border-amber-500/30 bg-amber-50/10 text-card-foreground shadow-sm transition-all ${isOver ? "ring-2 ring-amber-500" : ""
                }`}
        >
            <div className="flex flex-col space-y-1.5 p-6">
                <h3 className="text-lg font-semibold leading-none tracking-tight text-amber-600">ジャンル未設定</h3>
                <p className="text-sm text-muted-foreground">小計: {formatPrice(subtotal)}</p>
            </div>
            <div className="p-6 pt-0">
                <div className="space-y-1">
                    {subscriptions.map((sub) => (
                        <div key={sub.id} className="flex items-center justify-between text-sm">
                            <span>{sub.name}</span>
                            <span className="text-muted-foreground">{formatPrice(sub.price)}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default function SubscriptionsPage() {
    const [isAddSubModalOpen, setIsAddSubModalOpen] = useState(false);
    const [isAddGenreModalOpen, setIsAddGenreModalOpen] = useState(false);
    const [newSubscription, setNewSubscription] = useState({ name: "", price: "", description: "", monthlyCount: "", dailyCount: "" });
    const [editingSubscriptionId, setEditingSubscriptionId] = useState<number | null>(null);
    const [editingSubscription, setEditingSubscription] = useState({ name: "", price: "", description: "", monthlyCount: "", dailyCount: "" });

    // ジャンル選択 (新規作成用)
    const [selectedGenreIds, setSelectedGenreIds] = useState<number[]>([]);
    const toggleGenreSelection = (id: number) => {
        setSelectedGenreIds((prev) =>
            prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id]
        );
    };

    // ジャンル追加フォーム
    const [newGenreName, setNewGenreName] = useState("");

    // データ取得
    const summary = useQuery(orpc.subscription.getSummary.queryOptions());
    const allSubscriptions = useQuery(orpc.subscription.getAll.queryOptions());
    const genres = useQuery(orpc.subscription.genre.getAll.queryOptions());

    // サブスクリプション操作
    const createSubscriptionMutation = useMutation(
        orpc.subscription.create.mutationOptions({
            onSuccess: () => {
                summary.refetch();
                allSubscriptions.refetch();
                setNewSubscription({ name: "", price: "", description: "", monthlyCount: "", dailyCount: "" });
                setSelectedGenreIds([]);
                setIsAddSubModalOpen(false);
            },
        }),
    );

    const updateSubscriptionMutation = useMutation(
        orpc.subscription.update.mutationOptions({
            onSuccess: () => {
                summary.refetch();
                allSubscriptions.refetch();
                setEditingSubscriptionId(null);
            },
        }),
    );

    const deleteSubscriptionMutation = useMutation(
        orpc.subscription.delete.mutationOptions({
            onSuccess: () => {
                summary.refetch();
                allSubscriptions.refetch();
            },
        }),
    );

    // ジャンル操作
    const createGenreMutation = useMutation(
        orpc.subscription.genre.create.mutationOptions({
            onSuccess: () => {
                genres.refetch();
                summary.refetch();
                setNewGenreName("");
                setIsAddGenreModalOpen(false);
            },
        }),
    );

    const deleteGenreMutation = useMutation(
        orpc.subscription.genre.delete.mutationOptions({
            onSuccess: () => {
                genres.refetch();
                summary.refetch();
                allSubscriptions.refetch();
            },
        }),
    );

    const setCalendarTargetMutation = useMutation(
        orpc.subscription.genre.setCalendarTarget.mutationOptions({
            onSuccess: () => {
                genres.refetch();
            },
        })
    );

    // ジャンル紐付け操作
    const addToGenreMutation = useMutation(
        orpc.subscription.addToGenre.mutationOptions({
            onSuccess: () => {
                summary.refetch();
                allSubscriptions.refetch();
            },
        }),
    );

    const setGenresMutation = useMutation(
        orpc.subscription.setGenres.mutationOptions({
            onSuccess: () => {
                summary.refetch();
                allSubscriptions.refetch();
            },
        }),
    );

    const updateGenreColorMutation = useMutation(
        orpc.subscription.genre.updateColor.mutationOptions({
            onSuccess: () => {
                genres.refetch();
                summary.refetch();
                allSubscriptions.refetch();
            },
        }),
    );

    const handleDrop = useCallback(
        (subscriptionId: number, genreId: number) => {
            addToGenreMutation.mutate({ subscriptionId, genreId });
        },
        [addToGenreMutation],
    );

    const handleRemoveFromAllGenres = useCallback(
        (subscriptionId: number) => {
            setGenresMutation.mutate({ subscriptionId, genreIds: [] });
        },
        [setGenresMutation],
    );

    const handleColorChange = useCallback(
        (genreId: number, color: Genre["color"]) => {
            updateGenreColorMutation.mutate({ id: genreId, color });
        },
        [updateGenreColorMutation],
    );

    const handleAddSubscription = (e: React.FormEvent) => {
        e.preventDefault();
        if (newSubscription.name.trim() && newSubscription.price) {
            createSubscriptionMutation.mutate({
                name: newSubscription.name,
                price: Number(newSubscription.price),
                description: newSubscription.description || undefined,
                monthlyCount: newSubscription.monthlyCount ? Number(newSubscription.monthlyCount) : undefined,
                dailyCount: newSubscription.dailyCount ? Number(newSubscription.dailyCount) : undefined,
                genreIds: selectedGenreIds,
            });
        }
    };

    const handleUpdateSubscription = (id: number) => {
        if (editingSubscription.name.trim() && editingSubscription.price) {
            updateSubscriptionMutation.mutate({
                id,
                name: editingSubscription.name,
                price: Number(editingSubscription.price),
                description: editingSubscription.description || null,
                monthlyCount: editingSubscription.monthlyCount ? Number(editingSubscription.monthlyCount) : undefined,
                dailyCount: editingSubscription.dailyCount ? Number(editingSubscription.dailyCount) : undefined,
            });
        }
    };

    const startEditSubscription = (sub: Subscription) => {
        setEditingSubscriptionId(sub.id);
        setEditingSubscription({
            name: sub.name,
            price: sub.price.toString(),
            description: sub.description || "",
            monthlyCount: sub.monthlyCount?.toString() || "",
            dailyCount: sub.dailyCount?.toString() || "",
        });
    };

    const handleAddGenre = (e: React.FormEvent) => {
        e.preventDefault();
        if (newGenreName.trim()) {
            createGenreMutation.mutate({ name: newGenreName });
        }
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat("ja-JP", {
            style: "currency",
            currency: "JPY",
        }).format(price);
    };

    if (summary.isLoading || allSubscriptions.isLoading || genres.isLoading) {
        return (
            <div className="flex justify-center py-10">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    const unassignedSubs = (allSubscriptions.data as unknown as Subscription[])?.filter((sub) => sub.genres.length === 0) || [];

    return (
        <DndProvider backend={HTML5Backend}>
            <div className="mx-auto w-full max-w-6xl space-y-6">
                {/* ヘッダー・合計表示 */}
                <div className="flex flex-col md:flex-row gap-4 items-center justify-center">
                    <div className="relative aspect-square max-h-[250px] w-full max-w-[250px]">
                        <ChartContainer
                            config={{
                                amount: { label: "金額" },
                                ...Object.fromEntries(
                                    (summary.data?.genreSummaries || []).map((gs) => [
                                        gs.genre.name,
                                        { label: gs.genre.name, color: COLOR_SCHEMES[gs.genre.color as keyof typeof COLOR_SCHEMES]?.hex || "#000000" },
                                    ])
                                ),
                            }}
                            className="mx-auto aspect-square w-full h-full"
                        >
                            <PieChart>
                                <ChartTooltip
                                    cursor={false}
                                    content={<ChartTooltipContent hideLabel />}
                                />
                                <Pie
                                    data={(summary.data?.genreSummaries || []).map((gs) => ({
                                        genre: gs.genre.name,
                                        amount: gs.subtotal,
                                        fill: COLOR_SCHEMES[gs.genre.color as keyof typeof COLOR_SCHEMES]?.hex || "#000000",
                                    }))}
                                    dataKey="amount"
                                    nameKey="genre"
                                    innerRadius={60}
                                    strokeWidth={5}
                                    labelLine={false}
                                    label={({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
                                        const RADIAN = Math.PI / 180;
                                        const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                                        const x = cx + radius * Math.cos(-midAngle * RADIAN);
                                        const y = cy + radius * Math.sin(-midAngle * RADIAN);

                                        return percent > 0.05 ? (
                                            <text
                                                x={x}
                                                y={y}
                                                fill="white"
                                                textAnchor="middle"
                                                dominantBaseline="central"
                                                className="text-xs font-bold drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.5)]"
                                            >
                                                {`${(percent * 100).toFixed(0)}%`}
                                            </text>
                                        ) : null;
                                    }}
                                >
                                    <RechartsLabel
                                        content={({ viewBox }) => {
                                            if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                                                const { cx, cy } = viewBox as { cx: number; cy: number };
                                                return (
                                                    <text
                                                        x={cx}
                                                        y={cy}
                                                        textAnchor="middle"
                                                        dominantBaseline="middle"
                                                    >
                                                        <tspan
                                                            x={cx}
                                                            y={cy}
                                                            className="fill-foreground text-3xl font-bold"
                                                        >
                                                            {formatPrice(summary.data?.total || 0).replace("￥", "")}
                                                        </tspan>
                                                        <tspan
                                                            x={cx}
                                                            y={(cy || 0) + 24}
                                                            className="fill-muted-foreground text-xs"
                                                        >
                                                            Monthly Total
                                                        </tspan>
                                                    </text>
                                                );
                                            }
                                        }}
                                    />
                                </Pie>
                            </PieChart>
                        </ChartContainer>
                    </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                    {/* 左カラム: サブスク一覧 */}
                    <div className="space-y-4 text-sm">
                        <Card>
                            <CardHeader className="pb-3 px-4 flex flex-row items-center justify-between space-y-0">
                                <div className="space-y-1">
                                    <CardTitle className="text-base flex items-center gap-2">
                                        サブスク一覧
                                        <span className="text-xs font-normal text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                                            {allSubscriptions.data?.length || 0}
                                        </span>
                                    </CardTitle>
                                    <CardDescription className="text-xs">ドラッグしてジャンルに割り当て</CardDescription>
                                </div>
                                {/* サブスク登録モーダル */}
                                <Dialog open={isAddSubModalOpen} onOpenChange={setIsAddSubModalOpen}>
                                    <DialogTrigger
                                        render={(props) => (
                                            <Button {...props} size="sm" className="h-8 gap-1 px-3">
                                                <Plus className="h-3.5 w-3.5" />
                                                サブスクを追加
                                            </Button>
                                        )}
                                    />
                                    <DialogContent className="sm:max-w-[425px]">
                                        <DialogHeader>
                                            <DialogTitle>サブスク登録</DialogTitle>
                                            <DialogDescription>
                                                新しいサブスクリプションサービスを登録します。
                                            </DialogDescription>
                                        </DialogHeader>
                                        <form onSubmit={handleAddSubscription} className="space-y-4 py-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="sub-name">サービス名</Label>
                                                <Input
                                                    id="sub-name"
                                                    value={newSubscription.name}
                                                    onChange={(e) => setNewSubscription({ ...newSubscription, name: e.target.value })}
                                                    placeholder="例: Netflix"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="sub-price">月額料金</Label>
                                                <Input
                                                    id="sub-price"
                                                    type="number"
                                                    value={newSubscription.price}
                                                    onChange={(e) => setNewSubscription({ ...newSubscription, price: e.target.value })}
                                                    placeholder="1490"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>ジャンル</Label>
                                                <div className="flex flex-wrap gap-2">
                                                    {genres.data?.map((genre) => (
                                                        <span
                                                            key={genre.id}
                                                            className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 cursor-pointer ${selectedGenreIds.includes(genre.id)
                                                                ? "border-transparent bg-primary text-primary-foreground hover:bg-primary/80"
                                                                : "text-foreground hover:bg-secondary/80"
                                                                }`}
                                                            onClick={() => toggleGenreSelection(genre.id)}
                                                        >
                                                            {genre.name}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* カレンダー対象のジャンルが含まれている場合のみ回数設定を表示 */}
                                            {
                                                genres.data?.some(g => selectedGenreIds.includes(g.id) && g.isCalendarTarget) && (
                                                    <>
                                                        <div className="space-y-2">
                                                            <Label htmlFor="sub-monthly-count">月間回数（任意）</Label>
                                                            <Input
                                                                id="sub-monthly-count"
                                                                type="number"
                                                                value={newSubscription.monthlyCount}
                                                                onChange={(e) =>
                                                                    setNewSubscription({ ...newSubscription, monthlyCount: e.target.value })
                                                                }
                                                                placeholder="例: 10"
                                                            />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <Label htmlFor="sub-daily-count">1日あたりの回数（任意）</Label>
                                                            <Input
                                                                id="sub-daily-count"
                                                                type="number"
                                                                value={newSubscription.dailyCount}
                                                                onChange={(e) =>
                                                                    setNewSubscription({ ...newSubscription, dailyCount: e.target.value })
                                                                }
                                                                placeholder="例: 3"
                                                            />
                                                        </div>
                                                    </>
                                                )
                                            }
                                            <div className="space-y-2">
                                                <Label htmlFor="sub-desc">メモ</Label>
                                                <Input
                                                    id="sub-desc"
                                                    value={newSubscription.description}
                                                    onChange={(e) =>
                                                        setNewSubscription({ ...newSubscription, description: e.target.value })
                                                    }
                                                    placeholder="任意"
                                                />
                                            </div>
                                            <DialogFooter className="pt-4">
                                                <Button
                                                    type="submit"
                                                    className="w-full"
                                                    disabled={
                                                        createSubscriptionMutation.isPending ||
                                                        !newSubscription.name.trim() ||
                                                        !newSubscription.price
                                                    }
                                                >
                                                    {createSubscriptionMutation.isPending && (
                                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                    )}
                                                    登録する
                                                </Button>
                                            </DialogFooter>
                                        </form>
                                    </DialogContent>
                                </Dialog>
                            </CardHeader>
                            <CardContent className="space-y-2 pb-4 px-4">
                                {allSubscriptions.data?.length === 0 ? (
                                    <p className="py-8 text-center text-muted-foreground">
                                        まだサブスクリプションがありません
                                    </p>
                                ) : (
                                    allSubscriptions.data?.map((sub) =>
                                        editingSubscriptionId === sub.id ? (
                                            <div key={sub.id} className="flex items-center gap-2 rounded-md border p-2 bg-muted/30">
                                                <Input
                                                    value={editingSubscription.name}
                                                    onChange={(e) =>
                                                        setEditingSubscription({ ...editingSubscription, name: e.target.value })
                                                    }
                                                    placeholder="サービス名"
                                                    className="w-28 h-7 text-xs"
                                                />
                                                <Input
                                                    type="number"
                                                    value={editingSubscription.price}
                                                    onChange={(e) =>
                                                        setEditingSubscription({ ...editingSubscription, price: e.target.value })
                                                    }
                                                    placeholder="金額"
                                                    className="w-20 h-7 text-xs"
                                                />
                                                <Input
                                                    value={editingSubscription.description}
                                                    onChange={(e) =>
                                                        setEditingSubscription({ ...editingSubscription, description: e.target.value })
                                                    }
                                                    placeholder="メモ"
                                                    className="flex-1 h-7 text-xs"
                                                />
                                                {genres.data?.find(g => g.isCalendarTarget) && sub.genres.some(g => g.id === genres.data?.find(t => t.isCalendarTarget)?.id) && (
                                                    <>
                                                        <Input
                                                            type="number"
                                                            value={editingSubscription.monthlyCount}
                                                            onChange={(e) =>
                                                                setEditingSubscription({ ...editingSubscription, monthlyCount: e.target.value })
                                                            }
                                                            placeholder="月回数"
                                                            className="w-16 h-7 text-xs"
                                                        />
                                                        <Input
                                                            type="number"
                                                            value={editingSubscription.dailyCount}
                                                            onChange={(e) =>
                                                                setEditingSubscription({ ...editingSubscription, dailyCount: e.target.value })
                                                            }
                                                            placeholder="日回数"
                                                            className="w-16 h-7 text-xs"
                                                        />
                                                    </>
                                                )}
                                                <Button size="icon-sm" variant="ghost" onClick={() => handleUpdateSubscription(sub.id)}>
                                                    <Check className="h-3.5 w-3.5" />
                                                </Button>
                                                <Button size="icon-sm" variant="ghost" onClick={() => setEditingSubscriptionId(null)}>
                                                    <X className="h-3.5 w-3.5" />
                                                </Button>
                                            </div>
                                        ) : (
                                            <DraggableSubscription
                                                key={sub.id}
                                                sub={sub as Subscription}
                                                onEdit={startEditSubscription}
                                                onDelete={(id) => deleteSubscriptionMutation.mutate({ id })}
                                                formatPrice={formatPrice}
                                            />
                                        ),
                                    )
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* 右カラム: ジャンル一覧 */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between px-1">
                            <h2 className="text-lg font-semibold flex items-center gap-2">
                                <Folder className="h-5 w-5 text-muted-foreground" />
                                ジャンル
                                <span className="text-xs font-normal text-muted-foreground ml-2">
                                    {summary.data?.genreSummaries.length || 0}
                                </span>
                            </h2>
                            {/* ジャンル登録モーダル */}
                            <Dialog open={isAddGenreModalOpen} onOpenChange={setIsAddGenreModalOpen}>
                                <DialogTrigger
                                    render={(props) => (
                                        <Button {...props} variant="outline" size="sm" className="h-8 gap-1 px-3">
                                            <Plus className="h-3.5 w-3.5" />
                                            ジャンルを追加
                                        </Button>
                                    )}
                                />
                                <DialogContent className="sm:max-w-[425px]">
                                    <DialogHeader>
                                        <DialogTitle>ジャンル作成</DialogTitle>
                                        <DialogDescription>
                                            サブスクリプションを分類するカテゴリを作成します。
                                        </DialogDescription>
                                    </DialogHeader>
                                    <form onSubmit={handleAddGenre} className="space-y-4 py-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="genre-name">ジャンル名</Label>
                                            <Input
                                                id="genre-name"
                                                value={newGenreName}
                                                onChange={(e) => setNewGenreName(e.target.value)}
                                                placeholder="例: 動画配信"
                                                disabled={createGenreMutation.isPending}
                                            />
                                        </div>
                                        <DialogFooter className="pt-4">
                                            <Button
                                                type="submit"
                                                className="w-full"
                                                disabled={createGenreMutation.isPending || !newGenreName.trim()}
                                            >
                                                {createGenreMutation.isPending && (
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                )}
                                                作成する
                                            </Button>
                                        </DialogFooter>
                                    </form>
                                </DialogContent>
                            </Dialog>
                        </div>

                        {/* ジャンル一覧（ドロップエリア） */}
                        {summary.data?.genreSummaries.map((gs) => (
                            <DroppableGenre
                                key={gs.genre.id}
                                genre={gs.genre as Genre}
                                subscriptions={gs.subscriptions as Subscription[]}
                                subtotal={gs.subtotal}
                                onDrop={handleDrop}
                                onDelete={(id) => deleteGenreMutation.mutate({ id })}
                                onColorChange={handleColorChange}
                                formatPrice={formatPrice}
                            />
                        ))}

                        {/* ジャンル未設定 */}
                        {summary.data?.unassigned && (
                            <UnassignedDropZone
                                subscriptions={unassignedSubs}
                                subtotal={summary.data.unassigned.subtotal}
                                onRemoveFromGenre={handleRemoveFromAllGenres}
                                formatPrice={formatPrice}
                            />
                        )}

                        {genres.data?.length === 0 && (
                            <Card className="border-dashed">
                                <CardContent className="py-12 text-center text-muted-foreground text-sm">
                                    <Folder className="h-8 w-8 mx-auto mb-2 opacity-20" />
                                    ジャンルを追加して管理を開始しましょう
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </DndProvider>
    );
}
