
export type Genre = {
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

export type Subscription = {
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

export const COLOR_SCHEMES = {
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

export const COLOR_OPTIONS = Object.keys(COLOR_SCHEMES) as Array<keyof typeof COLOR_SCHEMES>;

export const ItemTypes = {
    SUBSCRIPTION: "subscription",
} as const;
