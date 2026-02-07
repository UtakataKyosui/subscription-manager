import { Label, Pie, PieChart } from "recharts";
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";
import { COLOR_SCHEMES } from "../_types/types";

type GenreSummary = {
    genre: {
        id: number;
        name: string;
        color: string;
    };
    subtotal: number;
    subscriptions: unknown[];
};

type SubscriptionSummary = {
    total: number;
    genreSummaries: GenreSummary[];
    unassigned: {
        subtotal: number;
        subscriptions: unknown[];
    };
};

export function SubscriptionChart({
    summary,
    formatPrice,
}: {
    summary: SubscriptionSummary;
    formatPrice: (price: number) => string;
}) {
    // チャート用データ作成
    const chartData = [
        ...summary.genreSummaries.map((gs) => ({
            genre: gs.genre.name,
            amount: gs.subtotal,
            fill: COLOR_SCHEMES[gs.genre.color as keyof typeof COLOR_SCHEMES]?.hex || "#000000",
        })),
        ...(summary.unassigned.subtotal > 0
            ? [
                {
                    genre: "未分類",
                    amount: summary.unassigned.subtotal,
                    fill: "#94a3b8", // slate-400
                },
            ]
            : []),
    ];

    const chartConfig = {
        amount: { label: "金額" },
        ...Object.fromEntries(
            summary.genreSummaries.map((gs) => [
                gs.genre.name,
                { label: gs.genre.name, color: COLOR_SCHEMES[gs.genre.color as keyof typeof COLOR_SCHEMES]?.hex || "#000000" },
            ])
        ),
        "未分類": { label: "未分類", color: "#94a3b8" },
    } satisfies ChartConfig;

    return (
        <div className="flex flex-col items-center">
            <div className="relative aspect-square max-h-[250px] w-full max-w-[250px]">
                <ChartContainer
                    config={chartConfig}
                    className="mx-auto aspect-square max-h-[250px]"
                >
                    <PieChart>
                        <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent hideLabel />}
                        />
                        <Pie
                            data={chartData}
                            dataKey="amount"
                            nameKey="genre"
                            innerRadius={60}
                            strokeWidth={5}
                        >
                            <Label
                                content={({ viewBox }) => {
                                    if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                                        return (
                                            <text
                                                x={viewBox.cx}
                                                y={viewBox.cy}
                                                textAnchor="middle"
                                                dominantBaseline="middle"
                                            >
                                                <tspan
                                                    x={viewBox.cx}
                                                    y={viewBox.cy}
                                                    className="fill-foreground text-3xl font-bold"
                                                >
                                                    {formatPrice(summary.total)}
                                                </tspan>
                                                <tspan
                                                    x={viewBox.cx}
                                                    y={(viewBox.cy || 0) + 24}
                                                    className="fill-muted-foreground text-xs"
                                                >
                                                    月額合計
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
    );
}

// 合計金額表示用コンポーネント（チャートの横に表示する詳細）
export function SubscriptionSummaryCard({
    summary,
    formatPrice
}: {
    summary: SubscriptionSummary;
    formatPrice: (price: number) => string;
}) {
    return (
        <Card className="flex-1 w-full max-w-sm border-none shadow-none bg-transparent">
            <CardHeader className="pb-2">
                <CardTitle>月額合計: {formatPrice(summary.total)}</CardTitle>
                <CardDescription>
                    登録済みサブスクリプション: {summary.genreSummaries.reduce((acc, gs) => acc + gs.subscriptions.length, 0) + summary.unassigned.subscriptions.length}件
                </CardDescription>
            </CardHeader>
            <CardContent className="pb-2">
                <div className="text-sm text-muted-foreground space-y-1">
                    {summary.genreSummaries.map(gs => (
                        <div key={gs.genre.id} className="flex justify-between items-center">
                            <span className="flex items-center gap-2">
                                <span className={`w-2 h-2 rounded-full ${COLOR_SCHEMES[gs.genre.color as keyof typeof COLOR_SCHEMES]?.dot || "bg-gray-500"}`} />
                                {gs.genre.name}
                            </span>
                            <span>{formatPrice(gs.subtotal)}</span>
                        </div>
                    ))}
                    {summary.unassigned.subtotal > 0 && (
                        <div className="flex justify-between items-center">
                            <span className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-slate-400" />
                                未分類
                            </span>
                            <span>{formatPrice(summary.unassigned.subtotal)}</span>
                        </div>
                    )}
                </div>
            </CardContent>
            <CardFooter>
                <div className="flex items-center gap-2 font-medium leading-none text-muted-foreground text-xs">
                    <TrendingUp className="h-4 w-4" />
                    内訳を確認して支出を管理しましょう
                </div>
            </CardFooter>
        </Card>
    );
}
