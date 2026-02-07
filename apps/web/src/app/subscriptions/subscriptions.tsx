"use client";

import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Edit2 } from "lucide-react";

import { useSubscriptionData } from "./_hooks/use-subscription-data";
import { useGenreData } from "./_hooks/use-genre-data";
import { SubscriptionChart, SubscriptionSummaryCard } from "./_components/subscription-chart";
import { DroppableGenre } from "./_components/droppable-genre";
import { UnassignedDropZone } from "./_components/unassigned-drop-zone";
import { GenreDialog } from "./_components/genre-dialog";
import { SubscriptionDialog, type NewSubscriptionData } from "./_components/subscription-dialog";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { type Subscription } from "./_types/types";

export default function SubscriptionsPage() {
    const { data: session, isPending: isAuthPending } = authClient.useSession();
    const router = useRouter();
    const [editingSubscription, setEditingSubscription] = useState<Subscription | null>(null);

    const {
        subscriptions,
        isLoadingSubscriptions,
        summary,
        isLoadingSummary,
        createSubscription,
        createSubscriptionMutation,
        updateSubscriptionMutation,
        deleteSubscriptionMutation,
        addToGenreMutation,
        removeFromGenreMutation,
        setSubscriptionGenresMutation,
    } = useSubscriptionData();

    const {
        genres,
        isLoading: isLoadingGenres,
        createGenre,
        createGenreMutation,
        updateGenreMutation,
        deleteGenreMutation,
        updateGenreColorMutation,
    } = useGenreData();

    if (isAuthPending || isLoadingSubscriptions || isLoadingGenres || isLoadingSummary) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="text-primary h-8 w-8 animate-spin" />
            </div>
        );
    }

    if (!session) {
        router.push("/login"); // Changed from /auth/signin to /login based on user-menu example
        return null;
    }

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat("ja-JP", {
            style: "currency",
            currency: "JPY",
        }).format(price);
    };

    const handleDropOnGenre = (subscriptionId: number, genreId: number) => {
        // Add to genre
        addToGenreMutation.mutate({ subscriptionId, genreId });
    };

    const handleRemoveFromGenre = (subscriptionId: number) => {
        // Remove from all genres (set to empty)
        setSubscriptionGenresMutation.mutate({ subscriptionId, genreIds: [] });
    };

    const handleEditSubscription = (data: NewSubscriptionData) => {
        if (!editingSubscription) return;
        updateSubscriptionMutation.mutate({
            id: editingSubscription.id,
            ...data,
            price: parseInt(data.price),
            monthlyCount: data.monthlyCount ? parseInt(data.monthlyCount) : undefined,
            dailyCount: data.dailyCount ? parseInt(data.dailyCount) : undefined,
        }, {
            onSuccess: () => {
                setEditingSubscription(null);
            }
        });
    };

    // Group subscriptions by genre locally to ensure we have full Subscription objects with tags
    // 1. Unassigned: those with empty genres array
    const unassignedSubscriptions = subscriptions.filter(sub => !sub.genres || sub.genres.length === 0);
    const unassignedSubtotal = unassignedSubscriptions.reduce((acc, sub) => acc + sub.price, 0);

    return (
        <DndProvider backend={HTML5Backend}>
            <div className="container mx-auto space-y-8 p-4 md:p-8">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">サブスクリプション管理</h1>
                        <p className="text-muted-foreground">
                            毎月の固定費をジャンルごとに管理・可視化します
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <GenreDialog
                            onSubmit={createGenre}
                            isPending={createGenreMutation.isPending}
                        />
                        <SubscriptionDialog
                            genres={genres}
                            onSubmit={createSubscription}
                            isPending={createSubscriptionMutation.isPending}
                        />
                    </div>
                </div>

                {/* Edit Dialog (Controlled) */}
                {editingSubscription && (
                    <SubscriptionDialog
                        genres={genres}
                        onSubmit={handleEditSubscription}
                        isPending={updateSubscriptionMutation.isPending}
                        subscription={editingSubscription}
                        open={!!editingSubscription}
                        onOpenChange={(open) => !open && setEditingSubscription(null)}
                        trigger={<span className="hidden" />} // Hidden trigger as it's controlled
                    />
                )}

                {/* Summary Section */}
                {summary && (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
                        <SubscriptionSummaryCard
                            summary={summary}
                            formatPrice={formatPrice}
                        />
                        <div className="lg:col-span-5">
                            <SubscriptionChart
                                summary={summary}
                                formatPrice={formatPrice}
                            />
                        </div>
                    </div>
                )}

                {/* Genres Grid */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {/* Unassigned Zone */}
                    <UnassignedDropZone
                        subscriptions={unassignedSubscriptions}
                        subtotal={unassignedSubtotal}
                        onRemoveFromGenre={handleRemoveFromGenre}
                        onEditSubscription={(sub) => setEditingSubscription(sub)}
                        onDeleteSubscription={(id) => deleteSubscriptionMutation.mutate({ id })}
                        formatPrice={formatPrice}
                    />

                    {/* Genre Zones */}
                    {genres.map((genre) => {
                        // Find subscriptions for this genre locally
                        const genreSubs = subscriptions.filter(sub => sub.genres?.some(g => g.id === genre.id));
                        const genreSubtotal = genreSubs.reduce((acc, sub) => acc + sub.price, 0);

                        return (
                            <DroppableGenre
                                key={genre.id}
                                genre={genre}
                                subscriptions={genreSubs}
                                subtotal={genreSubtotal}
                                onDrop={(subId) => handleDropOnGenre(subId, genre.id)}
                                onDeleteGenre={() => deleteGenreMutation.mutate({ id: genre.id })}
                                onEditSubscription={(sub) => setEditingSubscription(sub)}
                                onDeleteSubscription={(id) => deleteSubscriptionMutation.mutate({ id })}
                                onColorChange={(id, color) => updateGenreColorMutation.mutate({ id, color })}
                                formatPrice={formatPrice}
                            />
                        );
                    })}
                </div>
            </div>
        </DndProvider>
    );
}
