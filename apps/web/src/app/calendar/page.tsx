"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
// Removed date-fns import

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Plus, X, Settings, Download, Upload, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { orpc } from "@/utils/orpc";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogDescription, // Added
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input"; // Added

// Simple date helpers since we aren't sure about date-fns
const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

const MEAL_TYPES = ["breakfast", "lunch", "dinner"] as const;
type MealType = typeof MEAL_TYPES[number];

const MEAL_LABELS: Record<MealType, string> = {
    breakfast: "朝",
    lunch: "昼",
    dinner: "夜",
};

export default function CalendarPage() {
    const [isMounted, setIsMounted] = useState(false);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedSlot, setSelectedSlot] = useState<{ date: string; type: MealType } | null>(null);
    const [selectedSubscriptionId, setSelectedSubscriptionId] = useState<string>("no-sub");

    // Data Management State
    const [isDataModalOpen, setIsDataModalOpen] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const startStr = `${year}-${String(month + 1).padStart(2, "0")}-01`;
    const endStr = `${year}-${String(month + 1).padStart(2, "0")}-${getDaysInMonth(year, month)}`;

    const meals = useQuery(
        orpc.dailyMeal.list.queryOptions({
            input: { start: startStr, end: endStr },
        })
    );

    const subscriptions = useQuery(orpc.subscription.getAll.queryOptions());
    const genres = useQuery(orpc.subscription.genre.getAll.queryOptions());

    const setCalendarTargetMutation = useMutation(
        orpc.subscription.genre.setCalendarTarget.mutationOptions({
            onSuccess: () => {
                genres.refetch();
            },
        })
    );

    const upsertMealMutation = useMutation(
        orpc.dailyMeal.upsert.mutationOptions({
            onSuccess: () => {
                meals.refetch();
                setSelectedSlot(null);
                setSelectedSubscriptionId("no-sub");
            },
        })
    );

    const deleteMealMutation = useMutation(
        orpc.dailyMeal.delete.mutationOptions({
            onSuccess: () => {
                meals.refetch();
            },
        })
    );

    // Export Logic
    const exportQuery = useQuery(
        orpc.subscription.exportData.queryOptions({
            enabled: false,
        })
    );

    const handleExport = async () => {
        const result = await exportQuery.refetch();
        if (result.data) {
            const blob = new Blob([JSON.stringify(result.data, null, 2)], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `cost-calculator-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }
    };

    // Import Logic
    const importMutation = useMutation(
        orpc.subscription.importData.mutationOptions({
            onSuccess: () => {
                meals.refetch();
                subscriptions.refetch();
                genres.refetch();
                setIsDataModalOpen(false);
                alert("インポートが完了しました");
            },
            onError: (error) => {
                alert("インポートに失敗しました: " + error.message);
            }
        })
    );

    const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const json = JSON.parse(event.target?.result as string);
                importMutation.mutate(json);
            } catch (err) {
                alert("ファイルの読み込みまたは解析に失敗しました");
            }
        };
        reader.readAsText(file);
    };


    const handlePrevMonth = () => {
        setCurrentDate(new Date(year, month - 1, 1));
    };

    const handleNextMonth = () => {
        setCurrentDate(new Date(year, month + 1, 1));
    };

    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    const emptyDays = Array.from({ length: firstDay }, (_, i) => i);

    const handleSave = () => {
        if (!selectedSlot) return;

        if (selectedSubscriptionId === "no-sub") {
            upsertMealMutation.mutate({
                date: selectedSlot.date,
                mealType: selectedSlot.type,
                subscriptionId: null,
            });
        } else {
            upsertMealMutation.mutate({
                date: selectedSlot.date,
                mealType: selectedSlot.type,
                subscriptionId: Number(selectedSubscriptionId),
            });
        }
    };

    const handleDelete = (date: string, type: MealType) => {
        deleteMealMutation.mutate({ date, mealType: type });
    }

    const getMealForSlot = (day: number, type: MealType) => {
        const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
        return meals.data?.find((m) => m.date === dateStr && m.mealType === type);
    }

    const getSubscriptionName = (id: number | null) => {
        if (!id) return "記録あり";
        return subscriptions.data?.find(s => s.id === id)?.name || "不明";
    }

    const getSubscriptionUsage = (subId: number) => {
        return meals.data?.filter(m => m.subscriptionId === subId).length || 0;
    };

    if (!isMounted) {
        return null;
    }

    const targetGenre = genres.data?.find(g => g.isCalendarTarget);

    return (
        <div className="container mx-auto p-4 pb-24">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2"> {/* Changed to flex container */}
                    <h1 className="text-2xl font-bold">
                        {year}年{month + 1}月
                    </h1>
                    {/* Data Management Modal */}
                    <Dialog open={isDataModalOpen} onOpenChange={setIsDataModalOpen}>
                        <DialogTrigger
                            render={(props) => (
                                <Button {...props} variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                                    <Settings className="h-4 w-4" />
                                </Button>
                            )}
                        />
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>データ管理</DialogTitle>
                                <DialogDescription>
                                    データのバックアップ（エクスポート）や、復元（インポート）を行います。
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <Card>
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                                            <Download className="h-4 w-4" />
                                            エクスポート
                                        </CardTitle>
                                        <CardDescription className="text-xs">
                                            現在の設定、サブスクリプション、カレンダーデータをJSONファイルとしてダウンロードします。
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <Button onClick={handleExport} variant="outline" className="w-full" disabled={exportQuery.isFetching}>
                                            {exportQuery.isFetching && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                            データをダウンロード
                                        </Button>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                                            <Upload className="h-4 w-4" />
                                            インポート
                                        </CardTitle>
                                        <CardDescription className="text-xs">
                                            エクスポートしたJSONファイルを読み込み、データを復元します。既存のデータは維持され、新しいデータのみ追加されます。
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid w-full max-w-sm items-center gap-1.5">
                                            <Label htmlFor="import-file">バックアップファイル (.json)</Label>
                                            <Input id="import-file" type="file" accept=".json" onChange={handleImportFile} disabled={importMutation.isPending} />
                                        </div>
                                        {importMutation.isPending && (
                                            <p className="text-xs text-muted-foreground mt-2 flex items-center">
                                                <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                                                データを処理中...
                                            </p>
                                        )}
                                    </CardContent>
                                </Card>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
                <div className="flex gap-2 items-center">
                    <Select
                        value={targetGenre?.id.toString() || "no-selection"}
                        onValueChange={(val) => {
                            if (val !== "no-selection") {
                                setCalendarTargetMutation.mutate({ id: Number(val) });
                            }
                        }}
                    >
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="カテゴリ切替" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="no-selection" disabled>カテゴリを選択</SelectItem>
                            {genres.data?.map((genre) => (
                                <SelectItem key={genre.id} value={genre.id.toString()}>
                                    {genre.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <div className="flex gap-1">
                        <Button variant="outline" size="icon" onClick={handlePrevMonth}>
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="icon" onClick={handleNextMonth}>
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-7 border rounded-lg overflow-hidden">
                {/* 曜日ヘッダー */}
                {["日", "月", "火", "水", "木", "金", "土"].map((d) => (
                    <div key={d} className="text-center font-bold text-muted-foreground p-2">
                        {d}
                    </div>
                ))}

                {emptyDays.map((_, i) => (
                    <div key={`empty-${i}`} className="p-2 min-h-[120px] bg-muted/10 rounded-lg" />
                ))}

                {days.map((day) => {
                    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                    return (
                        <Card key={day} className="min-h-[120px] shadow-sm hover:shadow-md transition-shadow">
                            <CardContent className="p-2 h-full flex flex-col">
                                <div className="text-right font-medium text-sm mb-2 text-muted-foreground">{day}</div>
                                <div className="flex-1 flex flex-col gap-1">
                                    {MEAL_TYPES.map((type) => {
                                        const meal = getMealForSlot(day, type);
                                        return (
                                            <Dialog key={type} open={selectedSlot?.date === dateStr && selectedSlot?.type === type} onOpenChange={(open) => {
                                                if (!open) setSelectedSlot(null);
                                            }}>
                                                <DialogTrigger
                                                    onClick={() => {
                                                        setSelectedSlot({ date: dateStr, type });
                                                        setSelectedSubscriptionId(meal?.subscriptionId?.toString() || "no-sub");
                                                    }}
                                                    className={`text-xs text-left p-1 rounded border transition-colors w-full cursor-pointer ${meal
                                                        ? "bg-primary/10 border-primary/20 hover:bg-primary/20 text-primary-foregroundish"
                                                        : "bg-muted/30 border-dashed border-transparent hover:border-muted-foreground/30 hover:bg-muted/50 text-muted-foreground"
                                                        }`}
                                                >
                                                    <div className="flex items-center justify-between pointer-events-none">
                                                        <span className="font-bold opacity-70 mr-1">{MEAL_LABELS[type]}</span>
                                                        {meal ? (
                                                            <span className="truncate">{getSubscriptionName(meal.subscriptionId)}</span>
                                                        ) : (
                                                            <span className="opacity-0 hover:opacity-100"><Plus className="h-3 w-3" /></span>
                                                        )}
                                                    </div>
                                                </DialogTrigger>
                                                <DialogContent>
                                                    <DialogHeader>
                                                        <DialogTitle>{month + 1}月{day}日 {MEAL_LABELS[type]}食の記録</DialogTitle>
                                                    </DialogHeader>
                                                    <div className="py-4 space-y-4">
                                                        <div className="space-y-2">
                                                            <Label>サブスクリプションを選択</Label>
                                                            <Select value={selectedSubscriptionId} onValueChange={(val) => setSelectedSubscriptionId(val ?? "no-sub")}>
                                                                <SelectTrigger>
                                                                    <SelectValue placeholder="選択してください" />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    <SelectItem value="no-sub">登録なし（記録のみ）</SelectItem>
                                                                    {subscriptions.data
                                                                        ?.filter(s => s.isActive)
                                                                        .filter(s => !targetGenre || s.genres.some(g => g.id === targetGenre.id))
                                                                        .map(sub => {
                                                                            const usage = getSubscriptionUsage(sub.id);
                                                                            const remainingMonthly = sub.monthlyCount ? sub.monthlyCount - usage : null;
                                                                            const dailyUsage = meals.data?.filter(m => m.subscriptionId === sub.id && m.date === dateStr).length || 0;
                                                                            const remainingDaily = sub.dailyCount ? sub.dailyCount - dailyUsage : null;

                                                                            let label = sub.name;
                                                                            if (sub.monthlyCount) label += ` (月残り: ${remainingMonthly}/${sub.monthlyCount})`;
                                                                            if (sub.dailyCount) label += ` (日残り: ${remainingDaily}/${sub.dailyCount})`;

                                                                            // Disable selection if daily limit reached? Or just show negative?
                                                                            // Let's just show info for now.

                                                                            return (
                                                                                <SelectItem key={sub.id} value={sub.id.toString()}>
                                                                                    {label}
                                                                                </SelectItem>
                                                                            );
                                                                        })}
                                                                </SelectContent>
                                                            </Select>
                                                        </div>
                                                        <div className="flex justify-between gap-2">
                                                            {meal && (
                                                                <Button variant="destructive" onClick={() => {
                                                                    handleDelete(dateStr, type);
                                                                    setSelectedSlot(null);
                                                                }}>
                                                                    削除
                                                                </Button>
                                                            )}
                                                            <div className="flex-1 flex justify-end gap-2">
                                                                <Button variant="outline" onClick={() => setSelectedSlot(null)}>キャンセル</Button>
                                                                <Button onClick={handleSave}>保存</Button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </DialogContent>
                                            </Dialog>
                                        );
                                    })}
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}
