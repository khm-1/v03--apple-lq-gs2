import { useWatchlist, useAddToWatchlist, useUpdateWatchlistItem, useRemoveFromWatchlist } from '../hooks/useWatchlist';
import { WatchlistViewModel } from '../view-models/WatchlistViewModel';
import { WatchlistView } from '../components/WatchlistView';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { ErrorMessage } from '@/components/ui/error-message';
import { CreateWatchlistItemDto, UpdateWatchlistItemDto } from '@shared/application/dto/WatchlistDto';

export function WatchlistContainer() {
  const userId = 1; // In real app, get from auth context

  const { data: watchlistData, isLoading, error, refetch } = useWatchlist(userId);
  const addToWatchlist = useAddToWatchlist();
  const updateWatchlistItem = useUpdateWatchlistItem();
  const removeFromWatchlist = useRemoveFromWatchlist();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <ErrorMessage
          message="Failed to load watchlist"
          onRetry={refetch}
        />
      </div>
    );
  }

  if (!watchlistData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <ErrorMessage message="No watchlist data available" />
      </div>
    );
  }

  const viewModel = new WatchlistViewModel(watchlistData);

  const handleAddItem = async (item: CreateWatchlistItemDto) => {
    await addToWatchlist.mutateAsync({ userId, item });
  };

  const handleUpdateItem = async (itemId: number, updates: UpdateWatchlistItemDto) => {
    await updateWatchlistItem.mutateAsync({ userId, itemId, updates });
  };

  const handleRemoveItem = async (itemId: number) => {
    await removeFromWatchlist.mutateAsync({ userId, itemId });
  };

  return (
    <WatchlistView
      viewModel={viewModel}
      onAddItem={handleAddItem}
      onUpdateItem={handleUpdateItem}
      onRemoveItem={handleRemoveItem}
      isLoading={addToWatchlist.isPending || updateWatchlistItem.isPending || removeFromWatchlist.isPending}
    />
  );
}
