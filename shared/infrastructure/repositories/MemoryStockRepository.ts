import { IStockRepository } from './IStockRepository';
import { StockData } from '../../domain/entities/Stock';

/**
 * In-memory implementation of stock repository
 */
export class MemoryStockRepository implements IStockRepository {
  private stocks: Map<string, StockData>;
  private currentId: number;

  constructor() {
    this.stocks = new Map();
    this.currentId = 1;
    this.initializeSampleData();
  }

  async getAll(): Promise<StockData[]> {
    return Array.from(this.stocks.values());
  }

  async getBySymbol(symbol: string): Promise<StockData | null> {
    return this.stocks.get(symbol.toUpperCase()) || null;
  }

  async update(symbol: string, stock: Partial<StockData>): Promise<StockData> {
    const existing = this.stocks.get(symbol.toUpperCase());
    if (!existing) {
      throw new Error(`Stock not found: ${symbol}`);
    }

    const updated: StockData = {
      ...existing,
      ...stock,
    };

    this.stocks.set(symbol.toUpperCase(), updated);
    return updated;
  }

  async create(stock: Omit<StockData, 'id'>): Promise<StockData> {
    const newStock: StockData = {
      ...stock,
      id: this.currentId++,
      symbol: stock.symbol.toUpperCase(),
    };

    this.stocks.set(stock.symbol.toUpperCase(), newStock);
    return newStock;
  }

  async delete(symbol: string): Promise<void> {
    this.stocks.delete(symbol.toUpperCase());
  }

  private initializeSampleData(): void {
    const sampleStocks: StockData[] = [
      {
        id: 1,
        symbol: "AAPL",
        name: "Apple Inc.",
        price: "189.75",
        change: "5.42",
        changePercent: "2.95",
        volume: 52300000,
        marketCap: "$2.9T"
      },
      {
        id: 2,
        symbol: "MSFT",
        name: "Microsoft Corp.",
        price: "412.85",
        change: "8.15",
        changePercent: "2.01",
        volume: 28900000,
        marketCap: "$3.1T"
      },
      {
        id: 3,
        symbol: "GOOGL",
        name: "Alphabet Inc.",
        price: "142.65",
        change: "3.28",
        changePercent: "2.35",
        volume: 31200000,
        marketCap: "$1.8T"
      },
      {
        id: 4,
        symbol: "AMZN",
        name: "Amazon.com Inc.",
        price: "168.92",
        change: "6.45",
        changePercent: "3.97",
        volume: 41500000,
        marketCap: "$1.7T"
      },
      {
        id: 5,
        symbol: "TSLA",
        name: "Tesla Inc.",
        price: "251.82",
        change: "-4.23",
        changePercent: "-1.65",
        volume: 89600000,
        marketCap: "$801B"
      },
      {
        id: 6,
        symbol: "NVDA",
        name: "NVIDIA Corp.",
        price: "875.42",
        change: "28.75",
        changePercent: "3.40",
        volume: 45800000,
        marketCap: "$2.2T"
      },
      {
        id: 7,
        symbol: "META",
        name: "Meta Platforms Inc.",
        price: "485.23",
        change: "12.89",
        changePercent: "2.73",
        volume: 19400000,
        marketCap: "$1.2T"
      },
      {
        id: 8,
        symbol: "NFLX",
        name: "Netflix Inc.",
        price: "612.45",
        change: "-8.92",
        changePercent: "-1.44",
        volume: 8900000,
        marketCap: "$271B"
      },
      {
        id: 9,
        symbol: "AMD",
        name: "Advanced Micro Devices",
        price: "142.78",
        change: "4.56",
        changePercent: "3.30",
        volume: 67200000,
        marketCap: "$231B"
      },
      {
        id: 10,
        symbol: "CRM",
        name: "Salesforce Inc.",
        price: "289.34",
        change: "7.23",
        changePercent: "2.56",
        volume: 12300000,
        marketCap: "$287B"
      },
      {
        id: 11,
        symbol: "ORCL",
        name: "Oracle Corp.",
        price: "118.67",
        change: "2.45",
        changePercent: "2.11",
        volume: 15600000,
        marketCap: "$327B"
      },
      {
        id: 12,
        symbol: "ADBE",
        name: "Adobe Inc.",
        price: "567.89",
        change: "-3.45",
        changePercent: "-0.60",
        volume: 7800000,
        marketCap: "$259B"
      }
    ];

    sampleStocks.forEach(stock => {
      this.stocks.set(stock.symbol, stock);
    });
  }
}
