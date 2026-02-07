import { useState } from "react";
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

export function GenreDialog({
    onSubmit,
    isPending,
}: {
    onSubmit: (name: string) => void;
    isPending: boolean;
}) {
    const [open, setOpen] = useState(false);
    const [name, setName] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(name);
        setName("");
        setOpen(false);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger className="cursor-pointer" render={<Button variant="outline" size="sm" className="h-8 gap-1 px-3">
                <Plus className="h-3.5 w-3.5" />
                ジャンルを追加
            </Button>} />
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>ジャンル作成</DialogTitle>
                    <DialogDescription>
                        サブスクリプションを分類するカテゴリを作成します。
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="genre-name">ジャンル名</Label>
                        <Input
                            id="genre-name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="例: 動画配信"
                            disabled={isPending}
                        />
                    </div>
                    <DialogFooter className="pt-4">
                        <Button
                            type="submit"
                            className="w-full"
                            disabled={isPending || !name.trim()}
                        >
                            {isPending && (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            作成する
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
