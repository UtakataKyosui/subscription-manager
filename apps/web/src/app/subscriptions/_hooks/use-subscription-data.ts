import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { orpc } from "@/utils/orpc";
import { type NewSubscriptionData } from "../_components/subscription-dialog";
import { type Subscription } from "../_types/types";

export function useSubscriptionData() {
    const queryClient = useQueryClient();

    // Queries
    const allSubscriptions = useQuery(orpc.subscription.getAll.queryOptions());
    const summary = useQuery(orpc.subscription.getSummary.queryOptions());

    // Mutations
    const createSubscriptionMutation = useMutation(
        orpc.subscription.create.mutationOptions({
            onSuccess: () => {
                toast.success("サブスクリプションを登録しました");
                queryClient.invalidateQueries({ queryKey: orpc.subscription.getAll.key() });
                queryClient.invalidateQueries({ queryKey: orpc.subscription.getSummary.key() });
                queryClient.invalidateQueries({ queryKey: orpc.subscription.genre.getAll.key() });
            },
            onError: (error) => {
                toast.error(`登録に失敗しました: ${error.message}`);
            },
        })
    );

    const updateSubscriptionMutation = useMutation(
        orpc.subscription.update.mutationOptions({
            onSuccess: () => {
                toast.success("サブスクリプションを更新しました");
                queryClient.invalidateQueries({ queryKey: orpc.subscription.getAll.key() });
                queryClient.invalidateQueries({ queryKey: orpc.subscription.getSummary.key() });
                queryClient.invalidateQueries({ queryKey: orpc.subscription.genre.getAll.key() });
            },
            onError: (error) => {
                toast.error(`更新に失敗しました: ${error.message}`);
            },
        })
    );

    const deleteSubscriptionMutation = useMutation(
        orpc.subscription.delete.mutationOptions({
            onSuccess: () => {
                toast.success("サブスクリプションを削除しました");
                queryClient.invalidateQueries({ queryKey: orpc.subscription.getAll.key() });
                queryClient.invalidateQueries({ queryKey: orpc.subscription.getSummary.key() });
                queryClient.invalidateQueries({ queryKey: orpc.subscription.genre.getAll.key() });
            },
            onError: (error) => {
                toast.error(`削除に失敗しました: ${error.message}`);
            },
        })
    );

    const addToGenreMutation = useMutation(
        orpc.subscription.addToGenre.mutationOptions({
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: orpc.subscription.getAll.key() });
                queryClient.invalidateQueries({ queryKey: orpc.subscription.getSummary.key() });
                queryClient.invalidateQueries({ queryKey: orpc.subscription.genre.getAll.key() });
            },
            onError: (error) => {
                toast.error(`ジャンルへの追加に失敗しました: ${error.message}`);
            },
        })
    );

    const removeFromGenreMutation = useMutation(
        orpc.subscription.removeFromGenre.mutationOptions({
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: orpc.subscription.getAll.key() });
                queryClient.invalidateQueries({ queryKey: orpc.subscription.getSummary.key() });
                queryClient.invalidateQueries({ queryKey: orpc.subscription.genre.getAll.key() });
            },
            onError: (error) => {
                toast.error(`ジャンルからの削除に失敗しました: ${error.message}`);
            },
        })
    );

    const setSubscriptionGenresMutation = useMutation(
        orpc.subscription.setGenres.mutationOptions({
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: orpc.subscription.getAll.key() });
                queryClient.invalidateQueries({ queryKey: orpc.subscription.getSummary.key() });
                queryClient.invalidateQueries({ queryKey: orpc.subscription.genre.getAll.key() });
            },
            onError: (error) => {
                toast.error(`ジャンル設定に失敗しました: ${error.message}`);
            },
        })
    );

    // Helper functions to bridge types
    const createSubscription = (data: NewSubscriptionData) => {
        createSubscriptionMutation.mutate({
            name: data.name,
            price: parseInt(data.price),
            description: data.description || undefined,
            monthlyCount: data.monthlyCount ? parseInt(data.monthlyCount) : undefined,
            dailyCount: data.dailyCount ? parseInt(data.dailyCount) : undefined,
            genreIds: data.genreIds,
        });
    };

    return {
        subscriptions: (allSubscriptions.data as unknown as Subscription[]) || [],
        isLoadingSubscriptions: allSubscriptions.isLoading,
        summary: summary.data,
        isLoadingSummary: summary.isLoading,
        createSubscription,
        createSubscriptionMutation,
        updateSubscriptionMutation,
        deleteSubscriptionMutation,
        addToGenreMutation,
        removeFromGenreMutation,
        setSubscriptionGenresMutation,
    };
}
