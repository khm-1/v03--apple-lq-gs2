import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ApiService } from "../../infrastructure/api/ApiService";
import { WatchlistWithStocksDto, CreateWatchlistItemDto, UpdateWatchlistItemDto } from "@shared/application/dto/WatchlistDto";
import { toast } from "sonner";

const apiService = new ApiService();

export function useWatchlist(userId: number) {
  return useQuery<WatchlistWithStocksDto>({
    queryKey: [`watchlist-${userId}`],
    queryFn: () => apiService.getWatchlist(userId),
    staleTime: 30000, // 30 seconds
    refetchInterval: 60000, // 1 minute for real-time updates
  });
}

export function useAddToWatchlist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, item }: { userId: number; item: CreateWatchlistItemDto }) =>
      apiService.addToWatchlist(userId, item),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: [`watchlist-${variables.userId}`] });
      toast.success(`${data.symbol} added to watchlist`);
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to add to watchlist');
    },
  });
}

export function useUpdateWatchlistItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, itemId, updates }: {
      userId: number;
      itemId: number;
      updates: UpdateWatchlistItemDto
    }) => apiService.updateWatchlistItem(userId, itemId, updates),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: [`watchlist-${variables.userId}`] });
      toast.success('Watchlist item updated');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update watchlist item');
    },
  });
}

export function useRemoveFromWatchlist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, itemId }: { userId: number; itemId: number }) =>
      apiService.removeFromWatchlist(userId, itemId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [`watchlist-${variables.userId}`] });
      toast.success('Removed from watchlist');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to remove from watchlist');
    },
  });
}
