import { useRef, useEffect } from "react";
import { useDrag } from "react-dnd";
import { GripVertical, Edit2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { type Subscription, ItemTypes } from "../_types/types";

// ドラッグ可能なサブスクリプションカード
export function DraggableSubscription({
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
                        {/* genres が存在し、空でない場合のみ表示 */}
                        {sub.genres && sub.genres.length > 0 && (
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
