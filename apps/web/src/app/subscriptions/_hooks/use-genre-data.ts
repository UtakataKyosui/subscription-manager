import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { orpc } from "@/utils/orpc";
import { type Genre } from "../_types/types";

export function useGenreData() {
    const queryClient = useQueryClient();

    const genres = useQuery(orpc.subscription.genre.getAll.queryOptions());

    const createGenreMutation = useMutation(
        orpc.subscription.genre.create.mutationOptions({
            onSuccess: () => {
                toast.success("ジャンルを作成しました");
                queryClient.invalidateQueries({ queryKey: orpc.subscription.genre.getAll.key() });
                queryClient.invalidateQueries({ queryKey: orpc.subscription.getSummary.key() });
            },
            onError: (error) => {
                toast.error(`作成に失敗しました: ${error.message}`);
            },
        })
    );

    const updateGenreMutation = useMutation(
        orpc.subscription.genre.update.mutationOptions({
            onSuccess: () => {
                toast.success("ジャンルを更新しました");
                queryClient.invalidateQueries({ queryKey: orpc.subscription.genre.getAll.key() });
                queryClient.invalidateQueries({ queryKey: orpc.subscription.getSummary.key() });
            },
            onError: (error) => {
                toast.error(`更新に失敗しました: ${error.message}`);
            },
        })
    );

    // Color update needs a separate mutation or handled within update if API supported it (it does not, separate endpoint)
    const updateGenreColorMutation = useMutation(
        orpc.subscription.genre.updateColor.mutationOptions({
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: orpc.subscription.genre.getAll.key() });
                queryClient.invalidateQueries({ queryKey: orpc.subscription.getSummary.key() });
            },
            onError: (error) => {
                toast.error(`色の更新に失敗しました: ${error.message}`);
            },
        })
    );

    const deleteGenreMutation = useMutation(
        orpc.subscription.genre.delete.mutationOptions({
            onSuccess: () => {
                toast.success("ジャンルを削除しました");
                queryClient.invalidateQueries({ queryKey: orpc.subscription.genre.getAll.key() });
                queryClient.invalidateQueries({ queryKey: orpc.subscription.getSummary.key() });
                queryClient.invalidateQueries({ queryKey: orpc.subscription.getAll.key() });
            },
            onError: (error) => {
                toast.error("削除に失敗しました（サブスクリプションが含まれている可能性があります）");
            },
        })
    );

    const createGenre = (name: string) => {
        createGenreMutation.mutate({ name });
    };

    return {
        genres: (genres.data as unknown as Genre[]) || [],
        isLoading: genres.isLoading,
        createGenre,
        createGenreMutation,
        updateGenreMutation,
        updateGenreColorMutation,
        deleteGenreMutation,
    };
}
