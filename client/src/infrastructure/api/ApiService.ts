import { CreateWatchlistItemDto, UpdateWatchlistItemDto, WatchlistItemDto, WatchlistWithStocksDto } from '@shared/application/dto/WatchlistDto';
import { IApiService } from './IApiService';
import {
  PortfolioDto,
  StockDto,
  TransactionDto,
  DashboardDataDto
} from '@shared/application/dto/PortfolioDto';

/**
 * HTTP API service implementation
 */
export class ApiService implements IApiService {
  private baseUrl: string;

  constructor(baseUrl: string = '') {
    this.baseUrl = baseUrl;
  }

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


  async getPortfolio(userId: number): Promise<PortfolioDto> {
    const response = await this.fetch(`/api/portfolio/${userId}`);
    return response.json();
  }

  async getMarketData(): Promise<StockDto[]> {
    const response = await this.fetch('/api/stocks');
    return response.json();
  }

  async getStock(symbol: string): Promise<StockDto> {
    const response = await this.fetch(`/api/stocks/${symbol}`);
    return response.json();
  }

  async getTransactions(userId: number): Promise<TransactionDto[]> {
    const response = await this.fetch(`/api/transactions/${userId}`);
    return response.json();
  }

  async getDashboardData(userId: number): Promise<DashboardDataDto> {
    const response = await this.fetch(`/api/dashboard/${userId}`);
    return response.json();
  }

  private async fetch(url: string, options?: RequestInit): Promise<Response> {
    const fullUrl = `${this.baseUrl}${url}`;

    const response = await fetch(fullUrl, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      credentials: 'include',
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API Error ${response.status}: ${errorText || response.statusText}`);
    }

    return response;
  }
}
