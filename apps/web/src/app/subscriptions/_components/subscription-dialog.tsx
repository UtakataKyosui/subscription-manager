import { useState, useEffect } from "react";
import type { ReactElement } from "react";
import { Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { type Genre, type Subscription } from "../_types/types";

export type NewSubscriptionData = {
    name: string;
    price: string;
    description: string;
    monthlyCount: string;
    dailyCount: string;
    genreIds: number[];
};

export function SubscriptionDialog({
    genres,
    onSubmit,
    isPending,
    subscription,
    open: controlledOpen,
    onOpenChange: setControlledOpen,
    trigger,
}: {
    genres: Genre[];
    onSubmit: (data: NewSubscriptionData) => void;
    isPending: boolean;
    subscription?: Subscription | null;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    trigger?: ReactElement;
}) {
    const [internalOpen, setInternalOpen] = useState(false);
    const [formData, setFormData] = useState<NewSubscriptionData>({
        name: "",
        price: "",
        description: "",
        monthlyCount: "",
        dailyCount: "",
        genreIds: [],
    });

    const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen;
    const setOpen = setControlledOpen || setInternalOpen;

    useEffect(() => {
        if (subscription && isOpen) {
            setFormData({
                name: subscription.name,
                price: subscription.price.toString(),
                description: subscription.description || "",
                monthlyCount: subscription.monthlyCount?.toString() || "",
                dailyCount: subscription.dailyCount?.toString() || "",
                genreIds: subscription.genres?.map(g => g.id) || [],
            });
        } else if (!subscription && isOpen) {
            // Reset for create mode when opened
            setFormData({
                name: "",
                price: "",
                description: "",
                monthlyCount: "",
                dailyCount: "",
                genreIds: [],
            });
        }
    }, [subscription, isOpen]);

    const toggleGenreSelection = (genreId: number) => {
        setFormData((prev) => ({
            ...prev,
            genreIds: prev.genreIds.includes(genreId)
                ? prev.genreIds.filter((id) => id !== genreId)
                : [...prev.genreIds, genreId],
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);

        // Form reset logic handled by parent or effect on close/success usually.
        // But for unchecked/internal, we might want to close.
        // For controlled, parent closes.
        if (controlledOpen === undefined) {
            setInternalOpen(false);
        }
    };

    const isCalendarTargetSelected = genres.some(
        (g) => formData.genreIds.includes(g.id) && g.isCalendarTarget
    );

    const isEdit = !!subscription;

    return (
        <Dialog open={isOpen} onOpenChange={setOpen}>
            <DialogTrigger render={trigger || (
                !isEdit ? (
                    <Button size="sm" className="h-8 gap-1 px-3">
                        <Plus className="h-3.5 w-3.5" />
                        サブスクリプションを追加
                    </Button>
                ) : <span /> // Should not happen if trigger is provided for edit
            )} />
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{isEdit ? "サブスク編集" : "サブスク登録"}</DialogTitle>
                    <DialogDescription>
                        {isEdit ? "サブスクリプションの情報を更新します。" : "新しいサブスクリプションサービスを登録します。"}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="sub-name">サービス名</Label>
                        <Input
                            id="sub-name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="例: Netflix"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="sub-price">月額料金</Label>
                        <Input
                            id="sub-price"
                            type="number"
                            value={formData.price}
                            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                            placeholder="1490"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>ジャンル</Label>
                        <div className="flex flex-wrap gap-2">
                            {genres.map((genre) => (
                                <span
                                    key={genre.id}
                                    className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 cursor-pointer ${formData.genreIds.includes(genre.id)
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
                    {isCalendarTargetSelected && (
                        <>
                            <div className="space-y-2">
                                <Label htmlFor="sub-monthly-count">月間回数（任意）</Label>
                                <Input
                                    id="sub-monthly-count"
                                    type="number"
                                    value={formData.monthlyCount}
                                    onChange={(e) =>
                                        setFormData({ ...formData, monthlyCount: e.target.value })
                                    }
                                    placeholder="例: 10"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="sub-daily-count">1日あたりの回数（任意）</Label>
                                <Input
                                    id="sub-daily-count"
                                    type="number"
                                    value={formData.dailyCount}
                                    onChange={(e) =>
                                        setFormData({ ...formData, dailyCount: e.target.value })
                                    }
                                    placeholder="例: 3"
                                />
                            </div>
                        </>
                    )}
                    <div className="space-y-2">
                        <Label htmlFor="sub-desc">メモ</Label>
                        <Input
                            id="sub-desc"
                            value={formData.description}
                            onChange={(e) =>
                                setFormData({ ...formData, description: e.target.value })
                            }
                            placeholder="任意"
                        />
                    </div>
                    <DialogFooter className="pt-4">
                        <Button
                            type="submit"
                            className="w-full"
                            disabled={
                                isPending ||
                                !formData.name.trim() ||
                                !formData.price
                            }
                        >
                            {isPending && (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            {isEdit ? "更新する" : "登録する"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
