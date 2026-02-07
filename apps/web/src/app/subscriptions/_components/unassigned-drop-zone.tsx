import { useRef, useEffect } from "react";
import { useDrop } from "react-dnd";
import { FolderX } from "lucide-react";
import { type Subscription, ItemTypes } from "../_types/types";
import { DraggableSubscription } from "./draggable-subscription";

export function UnassignedDropZone({
    subscriptions,
    subtotal,
    onRemoveFromGenre,
    onEditSubscription,
    onDeleteSubscription,
    formatPrice,
}: {
    subscriptions: Subscription[];
    subtotal: number;
    onRemoveFromGenre: (subscriptionId: number) => void;
    onEditSubscription: (sub: Subscription) => void;
    onDeleteSubscription: (id: number) => void;
    formatPrice: (price: number) => string;
}) {
    const dropRef = useRef<HTMLDivElement>(null);

    const [{ isOver, canDrop }, drop] = useDrop(() => ({
        accept: ItemTypes.SUBSCRIPTION,
        drop: (item: { id: number }) => {
            onRemoveFromGenre(item.id);
        },
        collect: (monitor) => ({
            isOver: monitor.isOver(),
            canDrop: monitor.canDrop(),
        }),
    }));

    useEffect(() => {
        if (dropRef.current) drop(dropRef.current);
    }, [drop]);

    return (
        <div
            ref={dropRef}
            className={`rounded-lg border-2 p-4 transition-all duration-200 ${isOver && canDrop
                ? "bg-slate-100 border-slate-400 dark:bg-slate-800 dark:border-slate-500 ring-2 ring-slate-500 scale-[1.02]"
                : canDrop
                    ? "border-dashed bg-muted/50 border-muted-foreground/30"
                    : "bg-muted/20 border-border"
                }`}
        >
            {/* Header */}
            <div className="flex items-center gap-3 mb-3">
                <div className="relative">
                    <FolderX className={`h-8 w-8 text-muted-foreground transition-all duration-200 ${isOver && canDrop ? "scale-110 text-slate-600 dark:text-slate-300" : ""}`} />
                </div>
                <div className="flex-1">
                    <h3 className="font-semibold text-lg text-muted-foreground">未分類</h3>
                    <p className="text-xs text-muted-foreground">{subscriptions.length}件</p>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-muted-foreground">{formatPrice(subtotal)}</span>
                </div>
            </div>

            {/* Content */}
            {subscriptions.length === 0 ? (
                <div className="py-4 text-center border-dashed border rounded border-muted-foreground/20">
                    <p className="text-xs text-muted-foreground">
                        {isOver ? "ジャンルから削除します" : "ジャンルから外す場合はここにドロップ"}
                    </p>
                </div>
            ) : (
                <div className="space-y-1.5 opacity-70">
                    {subscriptions.map((sub) => (
                        <DraggableSubscription
                            key={sub.id}
                            sub={sub}
                            onEdit={onEditSubscription}
                            onDelete={onDeleteSubscription}
                            formatPrice={formatPrice}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
