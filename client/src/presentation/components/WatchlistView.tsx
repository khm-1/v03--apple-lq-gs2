import { WatchlistViewModel, WatchlistDisplayItem } from '../view-models/WatchlistViewModel';
import { CreateWatchlistItemDto, UpdateWatchlistItemDto } from '@shared/application/dto/WatchlistDto';
import GlassPanel from '@/components/dashboard/glass-panel';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Plus,
  TrendingUp,
  TrendingDown,
  Bell,
  BellOff,
  Edit3,
  Trash2,
  Target,
  StickyNote,
  Calendar,
  AlertTriangle
} from 'lucide-react';
import { useState } from 'react';

interface WatchlistViewProps {
  viewModel: WatchlistViewModel;
  onAddItem: (item: CreateWatchlistItemDto) => void;
  onUpdateItem: (itemId: number, updates: UpdateWatchlistItemDto) => void;
  onRemoveItem: (itemId: number) => void;
  isLoading?: boolean;
}

export function WatchlistView({
  viewModel,
  onAddItem,
  onUpdateItem,
  onRemoveItem,
  isLoading = false
}: WatchlistViewProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingItem, setEditingItem] = useState<number | null>(null);

  const watchlistItems = viewModel.getWatchlistItems();
  const performanceData = viewModel.getPerformanceData();
  const availableStocks = viewModel.getAvailableStocks();
  const alertItems = viewModel.getItemsWithAlerts();

  return (
    <div className="min-h-screen relative">
      {/* Animated gradient background */}
      <div className="fixed inset-0 gradient-bg -z-10" />

      {/* Floating particles */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-green-500/10 rounded-full blur-3xl animate-pulse delay-2000" />
      </div>

      <div className="relative z-10 p-6 md:p-8 lg:p-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-2 tracking-tight">
              Market Watchlist
            </h1>
            <p className="text-slate-300 text-lg">
              Track your favorite stocks and set price alerts
            </p>
          </div>
          <div className="flex items-center gap-4 mt-4 md:mt-0">
            {alertItems.length > 0 && (
              <div className="px-4 py-2 rounded-full glass-morphism-dark">
                <div className="flex items-center gap-2 text-yellow-400">
                  <AlertTriangle className="w-4 h-4" />
                  <span className="text-sm font-medium">
                    {alertItems.length} Alert{alertItems.length !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>
            )}
            <Button
              onClick={() => setShowAddForm(true)}
              className="glass-morphism-dark text-white hover:bg-white/20"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Stock
            </Button>
          </div>
        </div>

        {/* Performance Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <GlassPanel className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                <Target className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <div className="text-slate-300 text-sm">Total Stocks</div>
                <div className="text-2xl font-bold text-white">{performanceData.totalItems}</div>
              </div>
            </div>
          </GlassPanel>

          <GlassPanel className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center">
                <Bell className="w-5 h-5 text-yellow-400" />
              </div>
              <div>
                <div className="text-slate-300 text-sm">Active Alerts</div>
                <div className="text-2xl font-bold text-white">{performanceData.itemsWithAlerts}</div>
              </div>
            </div>
          </GlassPanel>

          <GlassPanel className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <div className="text-slate-300 text-sm">Avg. Days Held</div>
                <div className="text-2xl font-bold text-white">{performanceData.averageDaysHeld}</div>
              </div>
            </div>
          </GlassPanel>

          <GlassPanel className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <div className="text-slate-300 text-sm">Top Performer</div>
                <div className="text-lg font-bold text-white">
                  {performanceData.topPerformer?.symbol || 'N/A'}
                </div>
                {performanceData.topPerformer && (
                  <div className="text-sm text-green-400">
                    {performanceData.topPerformer.change}
                  </div>
                )}
              </div>
            </div>
          </GlassPanel>
        </div>

        {/* Add Stock Form */}
        {showAddForm && (
          <AddStockForm
            availableStocks={availableStocks}
            onAdd={(item) => {
              onAddItem(item);
              setShowAddForm(false);
            }}
            onCancel={() => setShowAddForm(false)}
          />
        )}

        {/* Watchlist Items */}
        <GlassPanel className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-white">Your Watchlist</h2>
            <div className="text-slate-300 text-sm">
              {watchlistItems.length} stock{watchlistItems.length !== 1 ? 's' : ''} tracked
            </div>
          </div>

          {!viewModel.hasItems() ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-full bg-slate-700/50 flex items-center justify-center mx-auto mb-4">
                <Target className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">No stocks in watchlist</h3>
              <p className="text-slate-300 mb-6">Start tracking your favorite stocks by adding them to your watchlist</p>
              <Button
                onClick={() => setShowAddForm(true)}
                className="glass-morphism-dark text-white hover:bg-white/20"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Stock
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {watchlistItems.map((item) => (
                <WatchlistItemCard
                  key={item.id}
                  item={item}
                  isEditing={editingItem === item.id}
                  onEdit={() => setEditingItem(item.id)}
                  onSave={(updates) => {
                    onUpdateItem(item.id, updates);
                    setEditingItem(null);
                  }}
                  onCancel={() => setEditingItem(null)}
                  onRemove={() => onRemoveItem(item.id)}
                />
              ))}
            </div>
          )}
        </GlassPanel>
      </div>
    </div>
  );
}

// Additional UI Components
function AddStockForm({ availableStocks, onAdd, onCancel }: {
  availableStocks: any[];
  onAdd: (item: CreateWatchlistItemDto) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState({
    symbol: '',
    notes: '',
    targetPrice: '',
    alertEnabled: false
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.symbol) return;

    onAdd({
      symbol: formData.symbol,
      notes: formData.notes || undefined,
      targetPrice: formData.targetPrice || undefined,
      alertEnabled: formData.alertEnabled
    });
  };

  return (
    <GlassPanel className="p-6 mb-8">
      <h3 className="text-xl font-semibold text-white mb-4">Add Stock to Watchlist</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-slate-300 text-sm mb-2">Stock Symbol</label>
            <select
              value={formData.symbol}
              onChange={(e) => setFormData({ ...formData, symbol: e.target.value })}
              className="w-full bg-slate-800/50 border border-slate-600 rounded-lg px-3 py-2 text-white"
              required
            >
              <option value="">Select a stock</option>
              {availableStocks.map(stock => (
                <option key={stock.symbol} value={stock.symbol}>
                  {stock.symbol} - {stock.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-slate-300 text-sm mb-2">Target Price (Optional)</label>
            <Input
              type="number"
              step="0.01"
              value={formData.targetPrice}
              onChange={(e) => setFormData({ ...formData, targetPrice: e.target.value })}
              placeholder="0.00"
              className="bg-slate-800/50 border-slate-600 text-white"
            />
          </div>
        </div>
        <div>
          <label className="block text-slate-300 text-sm mb-2">Notes (Optional)</label>
          <Textarea
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="Add your thoughts about this stock..."
            className="bg-slate-800/50 border-slate-600 text-white"
            rows={3}
          />
        </div>
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="alertEnabled"
            checked={formData.alertEnabled}
            onChange={(e) => setFormData({ ...formData, alertEnabled: e.target.checked })}
            className="rounded"
          />
          <label htmlFor="alertEnabled" className="text-slate-300 text-sm">
            Enable price alerts
          </label>
        </div>
        <div className="flex gap-3">
          <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
            Add to Watchlist
          </Button>
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </form>
    </GlassPanel>
  );
}

function WatchlistItemCard({ item, isEditing, onEdit, onSave, onCancel, onRemove }: {
  item: WatchlistDisplayItem;
  isEditing: boolean;
  onEdit: () => void;
  onSave: (updates: UpdateWatchlistItemDto) => void;
  onCancel: () => void;
  onRemove: () => void;
}) {
  const [editData, setEditData] = useState({
    notes: item.notes,
    targetPrice: item.targetPrice?.replace(/[$,]/g, '') || '',
    alertEnabled: item.alertEnabled
  });

  const handleSave = () => {
    onSave({
      notes: editData.notes || undefined,
      targetPrice: editData.targetPrice || undefined,
      alertEnabled: editData.alertEnabled
    });
  };

  const getAlertBadge = () => {
    if (!item.alertEnabled) return null;

    const badgeProps = {
      'above_target': { color: 'bg-red-500/20 text-red-400', text: 'Above Target' },
      'below_target': { color: 'bg-blue-500/20 text-blue-400', text: 'Below Target' },
      'at_target': { color: 'bg-green-500/20 text-green-400', text: 'At Target' },
      'none': { color: 'bg-gray-500/20 text-gray-400', text: 'Watching' }
    };

    const props = badgeProps[item.alertStatus];
    return <Badge className={props.color}>{props.text}</Badge>;
  };

  return (
    <div className="glass-morphism-dark rounded-xl p-6 hover-glass">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${item.gradientColor} flex items-center justify-center text-white font-bold`}>
            {item.symbol.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h3 className="text-xl font-semibold text-white">{item.symbol}</h3>
              {getAlertBadge()}
            </div>
            <p className="text-slate-300 text-sm">{item.name}</p>
            <div className="flex items-center gap-4 mt-2 text-sm text-slate-400">
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {item.daysSinceAdded} days
              </div>
              {item.hasNotes && (
                <div className="flex items-center gap-1">
                  <StickyNote className="w-3 h-3" />
                  Notes
                </div>
              )}
              {item.hasTargetPrice && (
                <div className="flex items-center gap-1">
                  <Target className="w-3 h-3" />
                  Target: {item.targetPrice}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-2xl font-bold text-white">{item.currentPrice}</div>
            <div className={`flex items-center gap-1 text-sm ${item.isPositive ? 'text-green-400' : 'text-red-400'}`}>
              {item.isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {item.change} ({item.changePercent})
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={item.alertEnabled ? () => onSave({ alertEnabled: false }) : () => onSave({ alertEnabled: true })}
              className="text-slate-400 hover:text-white"
            >
              {item.alertEnabled ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onEdit}
              className="text-slate-400 hover:text-white"
            >
              <Edit3 className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onRemove}
              className="text-slate-400 hover:text-red-400"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {item.notes && !isEditing && (
        <div className="bg-slate-800/30 rounded-lg p-3 mb-4">
          <p className="text-slate-300 text-sm">{item.notes}</p>
        </div>
      )}

      {isEditing && (
        <div className="border-t border-slate-600 pt-4 space-y-4">
          <div>
            <label className="block text-slate-300 text-sm mb-2">Notes</label>
            <Textarea
              value={editData.notes}
              onChange={(e) => setEditData({ ...editData, notes: e.target.value })}
              placeholder="Add your thoughts..."
              className="bg-slate-800/50 border-slate-600 text-white"
              rows={3}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 text-sm mb-2">Target Price</label>
              <Input
                type="number"
                step="0.01"
                value={editData.targetPrice}
                onChange={(e) => setEditData({ ...editData, targetPrice: e.target.value })}
                placeholder="0.00"
                className="bg-slate-800/50 border-slate-600 text-white"
              />
            </div>
            <div className="flex items-end">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id={`alert-${item.id}`}
                  checked={editData.alertEnabled}
                  onChange={(e) => setEditData({ ...editData, alertEnabled: e.target.checked })}
                  className="rounded"
                />
                <label htmlFor={`alert-${item.id}`} className="text-slate-300 text-sm">
                  Enable alerts
                </label>
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <Button size="sm" onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">
              Save Changes
            </Button>
            <Button size="sm" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
