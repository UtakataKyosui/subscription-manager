import { useRef, useState, useEffect } from "react";
import { useDrop } from "react-dnd";
import { Folder, FolderOpen, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { type Genre, type Subscription, ItemTypes, COLOR_SCHEMES, COLOR_OPTIONS } from "../_types/types";
import { DraggableSubscription } from "./draggable-subscription";

// ドロップ可能なジャンルカード（フォルダスタイル）
export function DroppableGenre({
    genre,
    subscriptions,
    subtotal,
    onDrop,
    onDeleteGenre,
    onEditSubscription,
    onDeleteSubscription,
    onColorChange,
    formatPrice,
}: {
    genre: Genre;
    subscriptions: Subscription[];
    subtotal: number;
    onDrop: (subscriptionId: number, genreId: number) => void;
    onDeleteGenre: (id: number) => void;
    onEditSubscription: (sub: Subscription) => void;
    onDeleteSubscription: (id: number) => void;
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
                        onClick={() => onDeleteGenre(genre.id)}
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
