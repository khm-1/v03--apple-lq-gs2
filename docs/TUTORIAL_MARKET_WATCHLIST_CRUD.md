# 🎯 Tutorial: Building Market Watchlist CRUD with Clean Architecture

## 📚 Overview

This step-by-step tutorial will guide you through building a complete Market Watchlist CRUD feature using clean architecture principles. You'll learn to create a new route, implement all architectural layers, and style a beautiful UI.

## 🎯 What You'll Build

A complete Market Watchlist feature with:
- ✅ **Create**: Add stocks to personal watchlist
- ✅ **Read**: View watchlist with real-time data
- ✅ **Update**: Edit watchlist items (notes, alerts)
- ✅ **Delete**: Remove stocks from watchlist
- ✅ **Clean Architecture**: Proper layer separation
- ✅ **Beautiful UI**: Modern glass morphism design
- ✅ **Real-time Updates**: Live stock price updates

## 🌟 Learning Outcomes

By completing this tutorial, you'll understand:
- 🏗️ How to structure features with clean architecture
- 🎨 How to create beautiful, consistent UI components
- 🔄 How to implement CRUD operations properly
- 🧪 How to test each architectural layer
- 📱 How to create responsive, modern interfaces

## 📋 Prerequisites

- ✅ Basic understanding of React and TypeScript
- ✅ Familiarity with the existing clean architecture (read the main guide first)
- ✅ Development environment set up (`npm install` completed)

## 🚀 Getting Started

### **Step 1: Create Learning Branches**

We'll create two branches for this tutorial:
- `tutorial/watchlist-starter` - Starting point with basic setup
- `tutorial/watchlist-completed` - Finished implementation

```bash
# Create starter branch
git checkout -b tutorial/watchlist-starter

# We'll create the completed branch at the end
```

## 🏗️ Architecture Overview

Our Market Watchlist will follow clean architecture with these layers:

```
Market Watchlist Feature
├── Domain Layer
│   ├── entities/WatchlistItem.ts
│   ├── value-objects/WatchlistNote.ts
│   └── services/IWatchlistService.ts
├── Application Layer
│   ├── use-cases/ManageWatchlistUseCase.ts
│   └── dto/WatchlistDto.ts
├── Infrastructure Layer
│   ├── repositories/IWatchlistRepository.ts
│   └── repositories/MemoryWatchlistRepository.ts
└── Presentation Layer
    ├── components/WatchlistView.tsx
    ├── containers/WatchlistContainer.tsx
    ├── hooks/useWatchlist.ts
    └── view-models/WatchlistViewModel.ts
```

## 📝 Step-by-Step Implementation

### **Phase 1: Domain Layer (Business Logic)**

#### **Step 1.1: Create WatchlistItem Entity**

```typescript
// shared/domain/entities/WatchlistItem.ts
import { StockSymbol } from '../value-objects/StockSymbol';
import { Money } from '../value-objects/Money';

export interface WatchlistItemData {
  id: number;
  userId: number;
  symbol: string;
  addedAt: Date;
  notes?: string;
  targetPrice?: string;
  alertEnabled: boolean;
}

export class WatchlistItem {
  constructor(private readonly data: WatchlistItemData) {
    this.validate();
  }

  get id(): number { return this.data.id; }
  get userId(): number { return this.data.userId; }
  get symbol(): StockSymbol { return new StockSymbol(this.data.symbol); }
  get addedAt(): Date { return this.data.addedAt; }
  get notes(): string { return this.data.notes || ''; }
  get alertEnabled(): boolean { return this.data.alertEnabled; }

  get targetPrice(): Money | null {
    return this.data.targetPrice ? Money.fromString(this.data.targetPrice) : null;
  }

  get daysSinceAdded(): number {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - this.addedAt.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  hasTargetPrice(): boolean {
    return this.targetPrice !== null;
  }

  hasNotes(): boolean {
    return this.notes.trim().length > 0;
  }

  shouldAlert(currentPrice: Money): boolean {
    if (!this.alertEnabled || !this.targetPrice) return false;
    return currentPrice.isGreaterThan(this.targetPrice) || currentPrice.isLessThan(this.targetPrice);
  }

  updateNotes(notes: string): WatchlistItem {
    return new WatchlistItem({
      ...this.data,
      notes: notes.trim()
    });
  }

  updateTargetPrice(targetPrice: Money | null): WatchlistItem {
    return new WatchlistItem({
      ...this.data,
      targetPrice: targetPrice?.amount.toString()
    });
  }

  toggleAlert(): WatchlistItem {
    return new WatchlistItem({
      ...this.data,
      alertEnabled: !this.data.alertEnabled
    });
  }

  private validate(): void {
    if (this.data.id <= 0) {
      throw new Error('Watchlist item ID must be positive');
    }
    if (this.data.userId <= 0) {
      throw new Error('User ID must be positive');
    }
    if (!this.data.symbol || this.data.symbol.trim().length === 0) {
      throw new Error('Stock symbol is required');
    }
  }

  toData(): WatchlistItemData {
    return { ...this.data };
  }
}
```

#### **Step 1.2: Create Domain Service Interface**

```typescript
// shared/domain/services/IWatchlistService.ts
import { WatchlistItem } from '../entities/WatchlistItem';
import { Stock } from '../entities/Stock';

export interface IWatchlistService {
  /**
   * Check if any watchlist items should trigger alerts
   */
  checkAlerts(watchlistItems: WatchlistItem[], currentStocks: Stock[]): AlertInfo[];

  /**
   * Get performance summary for watchlist
   */
  calculateWatchlistPerformance(
    watchlistItems: WatchlistItem[], 
    currentStocks: Stock[]
  ): WatchlistPerformance;
}

export interface AlertInfo {
  watchlistItem: WatchlistItem;
  currentPrice: Money;
  targetPrice: Money;
  alertType: 'above_target' | 'below_target';
}

export interface WatchlistPerformance {
  totalItems: number;
  itemsWithAlerts: number;
  averageDaysHeld: number;
  topPerformer: { symbol: string; change: string } | null;
}
```

### **Phase 2: Application Layer (Use Cases)**

#### **Step 2.1: Create DTOs**

```typescript
// shared/application/dto/WatchlistDto.ts
export interface WatchlistItemDto {
  id: number;
  symbol: string;
  addedAt: string;
  notes: string;
  targetPrice?: string;
  alertEnabled: boolean;
  daysSinceAdded: number;
  hasTargetPrice: boolean;
  hasNotes: boolean;
}

export interface CreateWatchlistItemDto {
  symbol: string;
  notes?: string;
  targetPrice?: string;
  alertEnabled?: boolean;
}

export interface UpdateWatchlistItemDto {
  notes?: string;
  targetPrice?: string;
  alertEnabled?: boolean;
}

export interface WatchlistWithStocksDto {
  items: WatchlistItemDto[];
  stocks: StockDto[];
  performance: {
    totalItems: number;
    itemsWithAlerts: number;
    averageDaysHeld: number;
    topPerformer: { symbol: string; change: string } | null;
  };
}
```

#### **Step 2.2: Create Use Cases**

```typescript
// shared/application/use-cases/ManageWatchlistUseCase.ts
import { WatchlistItem } from '../../domain/entities/WatchlistItem';
import { IWatchlistRepository } from '../../infrastructure/repositories/IWatchlistRepository';
import { IStockRepository } from '../../infrastructure/repositories/IStockRepository';
import { IWatchlistService } from '../../domain/services/IWatchlistService';

export class ManageWatchlistUseCase {
  constructor(
    private readonly watchlistRepository: IWatchlistRepository,
    private readonly stockRepository: IStockRepository,
    private readonly watchlistService: IWatchlistService
  ) {}

  async getUserWatchlist(userId: number): Promise<WatchlistWithStocksDto> {
    try {
      const [watchlistData, stocksData] = await Promise.all([
        this.watchlistRepository.getByUserId(userId),
        this.stockRepository.getAll()
      ]);

      const watchlistItems = watchlistData.map(data => new WatchlistItem(data));
      const stocks = stocksData.map(data => new Stock(data));
      
      const performance = this.watchlistService.calculateWatchlistPerformance(
        watchlistItems, 
        stocks
      );

      return {
        items: watchlistItems.map(item => this.mapItemToDto(item)),
        stocks: stocks.map(stock => this.mapStockToDto(stock)),
        performance
      };
    } catch (error) {
      throw new Error(`Failed to get watchlist: ${error.message}`);
    }
  }

  async addToWatchlist(userId: number, createDto: CreateWatchlistItemDto): Promise<WatchlistItemDto> {
    try {
      // Check if already exists
      const existing = await this.watchlistRepository.getByUserIdAndSymbol(userId, createDto.symbol);
      if (existing) {
        throw new Error('Stock already in watchlist');
      }

      const newItemData = await this.watchlistRepository.create({
        userId,
        symbol: createDto.symbol.toUpperCase(),
        notes: createDto.notes || '',
        targetPrice: createDto.targetPrice,
        alertEnabled: createDto.alertEnabled || false,
        addedAt: new Date()
      });

      const watchlistItem = new WatchlistItem(newItemData);
      return this.mapItemToDto(watchlistItem);
    } catch (error) {
      throw new Error(`Failed to add to watchlist: ${error.message}`);
    }
  }

  async updateWatchlistItem(
    userId: number, 
    itemId: number, 
    updateDto: UpdateWatchlistItemDto
  ): Promise<WatchlistItemDto> {
    try {
      const existingData = await this.watchlistRepository.getById(itemId);
      if (!existingData || existingData.userId !== userId) {
        throw new Error('Watchlist item not found');
      }

      const updatedData = await this.watchlistRepository.update(itemId, updateDto);
      const watchlistItem = new WatchlistItem(updatedData);
      return this.mapItemToDto(watchlistItem);
    } catch (error) {
      throw new Error(`Failed to update watchlist item: ${error.message}`);
    }
  }

  async removeFromWatchlist(userId: number, itemId: number): Promise<void> {
    try {
      const existingData = await this.watchlistRepository.getById(itemId);
      if (!existingData || existingData.userId !== userId) {
        throw new Error('Watchlist item not found');
      }

      await this.watchlistRepository.delete(itemId);
    } catch (error) {
      throw new Error(`Failed to remove from watchlist: ${error.message}`);
    }
  }

  private mapItemToDto(item: WatchlistItem): WatchlistItemDto {
    return {
      id: item.id,
      symbol: item.symbol.value,
      addedAt: item.addedAt.toISOString(),
      notes: item.notes,
      targetPrice: item.targetPrice?.toFormattedString(),
      alertEnabled: item.alertEnabled,
      daysSinceAdded: item.daysSinceAdded,
      hasTargetPrice: item.hasTargetPrice(),
      hasNotes: item.hasNotes()
    };
  }

  private mapStockToDto(stock: Stock): StockDto {
    // Use existing stock mapping logic
    return {
      id: stock.id,
      symbol: stock.symbol.value,
      name: stock.name,
      price: stock.price.toFormattedString(),
      change: stock.change.toFormattedString(),
      changePercent: stock.changePercent.toFormattedString(),
      volume: stock.volume,
      marketCap: stock.marketCap,
      isTrendingUp: stock.isTrendingUp(),
      performanceCategory: stock.getPerformanceCategory(),
      gradientColor: stock.getGradientColor(),
      volumeInMillions: stock.getVolumeInMillions()
    };
  }
}
```

### **Phase 3: Infrastructure Layer (Data Access)**

#### **Step 3.1: Create Repository Interface**

```typescript
// shared/infrastructure/repositories/IWatchlistRepository.ts
import { WatchlistItemData } from '../../domain/entities/WatchlistItem';

export interface IWatchlistRepository {
  getByUserId(userId: number): Promise<WatchlistItemData[]>;
  getById(id: number): Promise<WatchlistItemData | null>;
  getByUserIdAndSymbol(userId: number, symbol: string): Promise<WatchlistItemData | null>;
  create(item: Omit<WatchlistItemData, 'id'>): Promise<WatchlistItemData>;
  update(id: number, item: Partial<WatchlistItemData>): Promise<WatchlistItemData>;
  delete(id: number): Promise<void>;
}
```

#### **Step 3.2: Create Repository Implementation**

```typescript
// shared/infrastructure/repositories/MemoryWatchlistRepository.ts
import { IWatchlistRepository } from './IWatchlistRepository';
import { WatchlistItemData } from '../../domain/entities/WatchlistItem';

export class MemoryWatchlistRepository implements IWatchlistRepository {
  private items = new Map<number, WatchlistItemData>();
  private userItems = new Map<number, number[]>();
  private currentId = 1;

  constructor() {
    this.initializeSampleData();
  }

  async getByUserId(userId: number): Promise<WatchlistItemData[]> {
    const itemIds = this.userItems.get(userId) || [];
    return itemIds.map(id => this.items.get(id)!).filter(Boolean);
  }

  async getById(id: number): Promise<WatchlistItemData | null> {
    return this.items.get(id) || null;
  }

  async getByUserIdAndSymbol(userId: number, symbol: string): Promise<WatchlistItemData | null> {
    const userItemIds = this.userItems.get(userId) || [];
    for (const itemId of userItemIds) {
      const item = this.items.get(itemId);
      if (item && item.symbol.toUpperCase() === symbol.toUpperCase()) {
        return item;
      }
    }
    return null;
  }

  async create(itemData: Omit<WatchlistItemData, 'id'>): Promise<WatchlistItemData> {
    const newItem: WatchlistItemData = {
      ...itemData,
      id: this.currentId++
    };

    this.items.set(newItem.id, newItem);
    
    const userItemIds = this.userItems.get(itemData.userId) || [];
    userItemIds.push(newItem.id);
    this.userItems.set(itemData.userId, userItemIds);

    return newItem;
  }

  async update(id: number, updateData: Partial<WatchlistItemData>): Promise<WatchlistItemData> {
    const existing = this.items.get(id);
    if (!existing) {
      throw new Error(`Watchlist item not found: ${id}`);
    }

    const updated = { ...existing, ...updateData };
    this.items.set(id, updated);
    return updated;
  }

  async delete(id: number): Promise<void> {
    const item = this.items.get(id);
    if (!item) return;

    this.items.delete(id);
    
    const userItemIds = this.userItems.get(item.userId) || [];
    const filteredIds = userItemIds.filter(itemId => itemId !== id);
    this.userItems.set(item.userId, filteredIds);
  }

  private initializeSampleData(): void {
    const sampleItems: WatchlistItemData[] = [
      {
        id: 1,
        userId: 1,
        symbol: 'AAPL',
        addedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
        notes: 'Strong fundamentals, waiting for dip',
        targetPrice: '200.00',
        alertEnabled: true
      },
      {
        id: 2,
        userId: 1,
        symbol: 'TSLA',
        addedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        notes: 'Watching for earnings announcement',
        alertEnabled: false
      },
      {
        id: 3,
        userId: 1,
        symbol: 'NVDA',
        addedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
        notes: 'AI growth potential',
        targetPrice: '900.00',
        alertEnabled: true
      }
    ];

    sampleItems.forEach(item => {
      this.items.set(item.id, item);
      const userItemIds = this.userItems.get(item.userId) || [];
      userItemIds.push(item.id);
      this.userItems.set(item.userId, userItemIds);
    });

    this.currentId = 4;
  }
}
```

### **Phase 4: Presentation Layer (UI Components)**

#### **Step 4.1: Create Custom Hooks**

```typescript
// client/src/presentation/hooks/useWatchlist.ts
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
```

#### **Step 4.2: Create View Model**

```typescript
// client/src/presentation/view-models/WatchlistViewModel.ts
import { WatchlistWithStocksDto, WatchlistItemDto } from '@shared/application/dto/WatchlistDto';
import { StockDto } from '@shared/application/dto/PortfolioDto';

export interface WatchlistDisplayItem {
  id: number;
  symbol: string;
  name: string;
  currentPrice: string;
  change: string;
  changePercent: string;
  isPositive: boolean;
  notes: string;
  targetPrice?: string;
  alertEnabled: boolean;
  daysSinceAdded: number;
  hasTargetPrice: boolean;
  hasNotes: boolean;
  gradientColor: string;
  alertStatus: 'none' | 'above_target' | 'below_target' | 'at_target';
}

export class WatchlistViewModel {
  constructor(private readonly data: WatchlistWithStocksDto) {}

  getWatchlistItems(): WatchlistDisplayItem[] {
    return this.data.items.map(item => {
      const stock = this.findStockBySymbol(item.symbol);
      const alertStatus = this.calculateAlertStatus(item, stock);

      return {
        id: item.id,
        symbol: item.symbol,
        name: stock?.name || item.symbol,
        currentPrice: stock?.price || 'N/A',
        change: stock?.change || '0.00',
        changePercent: stock?.changePercent || '0.00%',
        isPositive: stock?.isTrendingUp || false,
        notes: item.notes,
        targetPrice: item.targetPrice,
        alertEnabled: item.alertEnabled,
        daysSinceAdded: item.daysSinceAdded,
        hasTargetPrice: item.hasTargetPrice,
        hasNotes: item.hasNotes,
        gradientColor: stock?.gradientColor || 'from-gray-500 to-gray-600',
        alertStatus
      };
    });
  }

  getPerformanceData() {
    return {
      totalItems: this.data.performance.totalItems,
      itemsWithAlerts: this.data.performance.itemsWithAlerts,
      averageDaysHeld: this.data.performance.averageDaysHeld,
      topPerformer: this.data.performance.topPerformer
    };
  }

  getAvailableStocks(): StockDto[] {
    const watchlistSymbols = new Set(this.data.items.map(item => item.symbol));
    return this.data.stocks.filter(stock => !watchlistSymbols.has(stock.symbol));
  }

  hasItems(): boolean {
    return this.data.items.length > 0;
  }

  getItemsWithAlerts(): WatchlistDisplayItem[] {
    return this.getWatchlistItems().filter(item =>
      item.alertEnabled && item.alertStatus !== 'none'
    );
  }

  private findStockBySymbol(symbol: string): StockDto | undefined {
    return this.data.stocks.find(stock => stock.symbol === symbol);
  }

  private calculateAlertStatus(item: WatchlistItemDto, stock?: StockDto): 'none' | 'above_target' | 'below_target' | 'at_target' {
    if (!item.alertEnabled || !item.targetPrice || !stock) {
      return 'none';
    }

    const currentPrice = parseFloat(stock.price.replace(/[$,]/g, ''));
    const targetPrice = parseFloat(item.targetPrice.replace(/[$,]/g, ''));
    const tolerance = targetPrice * 0.02; // 2% tolerance

    if (Math.abs(currentPrice - targetPrice) <= tolerance) {
      return 'at_target';
    } else if (currentPrice > targetPrice) {
      return 'above_target';
    } else {
      return 'below_target';
    }
  }
}
```

#### **Step 4.3: Create UI Components**

```typescript
// client/src/presentation/components/WatchlistView.tsx
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
```

#### **Step 4.4: Create Container Component**

```typescript
// client/src/presentation/containers/WatchlistContainer.tsx
import { useWatchlist, useAddToWatchlist, useUpdateWatchlistItem, useRemoveFromWatchlist } from '../hooks/useWatchlist';
import { WatchlistViewModel } from '../view-models/WatchlistViewModel';
import { WatchlistView } from '../components/WatchlistView';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { ErrorMessage } from '@/components/ui/error-message';

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
```

### **Phase 5: API Integration & Routes**

#### **Step 5.1: Update API Service**

```typescript
// client/src/infrastructure/api/ApiService.ts (add methods)
export class ApiService implements IApiService {
  // ... existing methods

  async getWatchlist(userId: number): Promise<WatchlistWithStocksDto> {
    const response = await this.fetch(`/api/watchlist/${userId}`);
    return response.json();
  }

  async addToWatchlist(userId: number, item: CreateWatchlistItemDto): Promise<WatchlistItemDto> {
    const response = await this.fetch(`/api/watchlist/${userId}`, {
      method: 'POST',
      body: JSON.stringify(item),
    });
    return response.json();
  }

  async updateWatchlistItem(userId: number, itemId: number, updates: UpdateWatchlistItemDto): Promise<WatchlistItemDto> {
    const response = await this.fetch(`/api/watchlist/${userId}/${itemId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
    return response.json();
  }

  async removeFromWatchlist(userId: number, itemId: number): Promise<void> {
    await this.fetch(`/api/watchlist/${userId}/${itemId}`, {
      method: 'DELETE',
    });
  }
}
```

#### **Step 5.2: Add Server Routes**

```typescript
// server/routes.ts (add routes)
export async function registerRoutes(app: Express): Promise<Server> {
  // ... existing routes

  // Get user watchlist
  app.get("/api/watchlist/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      if (isNaN(userId) || userId <= 0) {
        return res.status(400).json({ message: "Invalid user ID" });
      }

      const manageWatchlistUseCase = container.get<ManageWatchlistUseCase>('ManageWatchlistUseCase');
      const watchlist = await manageWatchlistUseCase.getUserWatchlist(userId);

      res.json(watchlist);
    } catch (error) {
      console.error('Error fetching watchlist:', error);
      res.status(500).json({ message: "Failed to fetch watchlist" });
    }
  });

  // Add to watchlist
  app.post("/api/watchlist/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const createDto = req.body;

      if (isNaN(userId) || userId <= 0) {
        return res.status(400).json({ message: "Invalid user ID" });
      }

      const manageWatchlistUseCase = container.get<ManageWatchlistUseCase>('ManageWatchlistUseCase');
      const newItem = await manageWatchlistUseCase.addToWatchlist(userId, createDto);

      res.status(201).json(newItem);
    } catch (error) {
      console.error('Error adding to watchlist:', error);
      res.status(500).json({ message: error.message || "Failed to add to watchlist" });
    }
  });

  // Update watchlist item
  app.patch("/api/watchlist/:userId/:itemId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const itemId = parseInt(req.params.itemId);
      const updateDto = req.body;

      if (isNaN(userId) || userId <= 0 || isNaN(itemId) || itemId <= 0) {
        return res.status(400).json({ message: "Invalid user ID or item ID" });
      }

      const manageWatchlistUseCase = container.get<ManageWatchlistUseCase>('ManageWatchlistUseCase');
      const updatedItem = await manageWatchlistUseCase.updateWatchlistItem(userId, itemId, updateDto);

      res.json(updatedItem);
    } catch (error) {
      console.error('Error updating watchlist item:', error);
      res.status(500).json({ message: error.message || "Failed to update watchlist item" });
    }
  });

  // Remove from watchlist
  app.delete("/api/watchlist/:userId/:itemId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const itemId = parseInt(req.params.itemId);

      if (isNaN(userId) || userId <= 0 || isNaN(itemId) || itemId <= 0) {
        return res.status(400).json({ message: "Invalid user ID or item ID" });
      }

      const manageWatchlistUseCase = container.get<ManageWatchlistUseCase>('ManageWatchlistUseCase');
      await manageWatchlistUseCase.removeFromWatchlist(userId, itemId);

      res.status(204).send();
    } catch (error) {
      console.error('Error removing from watchlist:', error);
      res.status(500).json({ message: error.message || "Failed to remove from watchlist" });
    }
  });

  // ... rest of routes
}
```

#### **Step 5.3: Update DI Container**

```typescript
// shared/infrastructure/di/Container.ts (add registrations)
private registerServices(): void {
  // ... existing registrations

  // Register watchlist repository
  this.services.set('IWatchlistRepository', new MemoryWatchlistRepository());

  // Register watchlist service
  this.services.set('IWatchlistService', new WatchlistService());

  // Register watchlist use case
  this.services.set('ManageWatchlistUseCase', new ManageWatchlistUseCase(
    this.get<IWatchlistRepository>('IWatchlistRepository'),
    this.get<IStockRepository>('IStockRepository'),
    this.get<IWatchlistService>('IWatchlistService')
  ));
}
```

#### **Step 5.4: Add Route to App**

```typescript
// client/src/App.tsx
import { Switch, Route } from "wouter";
import Dashboard from "@/pages/dashboard";
import { WatchlistContainer } from "@/presentation/containers/WatchlistContainer";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/watchlist" component={WatchlistContainer} />
      <Route component={NotFound} />
    </Switch>
  );
}
```

### **Phase 6: Testing**

#### **Step 6.1: Domain Tests**

```typescript
// tests/watchlist/WatchlistItem.test.ts
import { describe, it, expect } from 'vitest';
import { WatchlistItem } from '../shared/domain/entities/WatchlistItem';
import { Money } from '../shared/domain/value-objects/Money';

describe('WatchlistItem Entity', () => {
  const sampleData = {
    id: 1,
    userId: 1,
    symbol: 'AAPL',
    addedAt: new Date('2024-01-01'),
    notes: 'Great company',
    targetPrice: '200.00',
    alertEnabled: true
  };

  it('should create watchlist item with valid data', () => {
    const item = new WatchlistItem(sampleData);

    expect(item.id).toBe(1);
    expect(item.symbol.value).toBe('AAPL');
    expect(item.notes).toBe('Great company');
    expect(item.hasTargetPrice()).toBe(true);
    expect(item.alertEnabled).toBe(true);
  });

  it('should calculate days since added correctly', () => {
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const item = new WatchlistItem({ ...sampleData, addedAt: yesterday });

    expect(item.daysSinceAdded).toBe(1);
  });

  it('should update notes correctly', () => {
    const item = new WatchlistItem(sampleData);
    const updated = item.updateNotes('New notes');

    expect(updated.notes).toBe('New notes');
    expect(item.notes).toBe('Great company'); // Original unchanged
  });

  it('should validate required fields', () => {
    expect(() => new WatchlistItem({ ...sampleData, id: 0 }))
      .toThrow('Watchlist item ID must be positive');

    expect(() => new WatchlistItem({ ...sampleData, symbol: '' }))
      .toThrow('Stock symbol is required');
  });
});
```

#### **Step 6.2: Use Case Tests**

```typescript
// tests/watchlist/ManageWatchlistUseCase.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ManageWatchlistUseCase } from '../shared/application/use-cases/ManageWatchlistUseCase';

describe('ManageWatchlistUseCase', () => {
  let useCase: ManageWatchlistUseCase;
  let mockWatchlistRepo: any;
  let mockStockRepo: any;
  let mockWatchlistService: any;

  beforeEach(() => {
    mockWatchlistRepo = {
      getByUserId: vi.fn(),
      getByUserIdAndSymbol: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    };

    mockStockRepo = {
      getAll: vi.fn(),
    };

    mockWatchlistService = {
      calculateWatchlistPerformance: vi.fn(),
    };

    useCase = new ManageWatchlistUseCase(
      mockWatchlistRepo,
      mockStockRepo,
      mockWatchlistService
    );
  });

  it('should get user watchlist successfully', async () => {
    const mockWatchlistData = [{ id: 1, userId: 1, symbol: 'AAPL', addedAt: new Date() }];
    const mockStocksData = [{ id: 1, symbol: 'AAPL', name: 'Apple Inc.', price: '150.00' }];
    const mockPerformance = { totalItems: 1, itemsWithAlerts: 0, averageDaysHeld: 5 };

    mockWatchlistRepo.getByUserId.mockResolvedValue(mockWatchlistData);
    mockStockRepo.getAll.mockResolvedValue(mockStocksData);
    mockWatchlistService.calculateWatchlistPerformance.mockReturnValue(mockPerformance);

    const result = await useCase.getUserWatchlist(1);

    expect(result.items).toHaveLength(1);
    expect(result.stocks).toHaveLength(1);
    expect(result.performance.totalItems).toBe(1);
  });

  it('should add stock to watchlist', async () => {
    const createDto = { symbol: 'AAPL', notes: 'Test note' };
    const mockCreatedItem = { id: 1, userId: 1, symbol: 'AAPL', addedAt: new Date() };

    mockWatchlistRepo.getByUserIdAndSymbol.mockResolvedValue(null);
    mockWatchlistRepo.create.mockResolvedValue(mockCreatedItem);

    const result = await useCase.addToWatchlist(1, createDto);

    expect(result.symbol).toBe('AAPL');
    expect(mockWatchlistRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({ symbol: 'AAPL', userId: 1 })
    );
  });

  it('should prevent adding duplicate stocks', async () => {
    const createDto = { symbol: 'AAPL' };
    mockWatchlistRepo.getByUserIdAndSymbol.mockResolvedValue({ id: 1 });

    await expect(useCase.addToWatchlist(1, createDto))
      .rejects.toThrow('Stock already in watchlist');
  });
});
```

### **Phase 7: Git Branches & Deployment**

#### **Step 7.1: Create Starter Branch**

```bash
# Commit current progress as starter
git add .
git commit -m "feat: Add Market Watchlist CRUD starter implementation

🎯 Starter Implementation:
- Domain layer with WatchlistItem entity and value objects
- Application layer with ManageWatchlistUseCase
- Infrastructure layer with repository interfaces
- Basic presentation layer structure
- Sample data and mock implementations

📚 Learning Features:
- Clean architecture pattern implementation
- CRUD operations with proper separation of concerns
- Type-safe domain modeling
- Repository pattern with dependency injection

🚀 Ready for:
- UI component development
- Advanced styling and interactions
- Real-time features
- Comprehensive testing

This serves as the starting point for the Market Watchlist CRUD tutorial."

# Push starter branch
git push -u origin tutorial/watchlist-starter
```

#### **Step 7.2: Complete Implementation**

```bash
# Create completed branch
git checkout -b tutorial/watchlist-completed

# Add all remaining implementation
# (UI components, styling, advanced features, tests)

git add .
git commit -m "feat: Complete Market Watchlist CRUD implementation

🎉 Complete Implementation:
- Full CRUD operations (Create, Read, Update, Delete)
- Beautiful glass morphism UI with responsive design
- Real-time stock price updates
- Price alerts and notifications
- Advanced filtering and sorting
- Comprehensive testing suite

🎨 UI Features:
- Modern glass morphism design
- Responsive layout for all devices
- Interactive animations and transitions
- Toast notifications for user feedback
- Loading states and error handling

🏗️ Architecture:
- Clean architecture with proper layer separation
- Domain-driven design principles
- SOLID principles compliance
- Comprehensive test coverage
- Type-safe implementation throughout

🧪 Testing:
- Unit tests for all layers
- Integration tests for use cases
- Component tests for UI
- E2E workflow testing

This represents the complete, production-ready implementation
of the Market Watchlist CRUD feature following clean architecture principles."

# Push completed branch
git push -u origin tutorial/watchlist-completed
```

## 🎯 **Learning Outcomes & Next Steps**

### **What You've Learned:**
- ✅ **Clean Architecture**: Proper layer separation and dependency management
- ✅ **Domain Modeling**: Creating rich domain entities with business logic
- ✅ **CRUD Operations**: Implementing Create, Read, Update, Delete with clean patterns
- ✅ **UI/UX Design**: Building beautiful, responsive interfaces
- ✅ **Testing**: Comprehensive testing strategies for all layers
- ✅ **Git Workflow**: Using branches for learning and development

### **Next Steps:**
1. **Extend Features**: Add sorting, filtering, bulk operations
2. **Real-time Updates**: Implement WebSocket connections
3. **Advanced Alerts**: Email/SMS notifications
4. **Performance**: Add caching and optimization
5. **Mobile**: Create mobile-responsive enhancements

### **Branch Usage:**
- **`tutorial/watchlist-starter`**: Use this to follow along with the tutorial
- **`tutorial/watchlist-completed`**: Reference this for the final implementation
- **Compare branches**: `git diff tutorial/watchlist-starter tutorial/watchlist-completed`

## 🎉 **Congratulations!**

You've successfully built a complete Market Watchlist CRUD feature using clean architecture principles! This implementation demonstrates professional-grade code organization, beautiful UI design, and comprehensive testing strategies.

**Happy coding with clean architecture! 🚀**
```
