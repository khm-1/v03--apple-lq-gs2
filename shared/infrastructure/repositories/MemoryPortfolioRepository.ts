import { IPortfolioRepository } from './IPortfolioRepository';
import { PortfolioData } from '../../domain/entities/Portfolio';

/**
 * In-memory implementation of portfolio repository
 */
export class MemoryPortfolioRepository implements IPortfolioRepository {
  private portfolios: Map<number, PortfolioData>;
  private currentId: number;

  constructor() {
    this.portfolios = new Map();
    this.currentId = 1;
    this.initializeSampleData();
  }

  async getByUserId(userId: number): Promise<PortfolioData | null> {
    return this.portfolios.get(userId) || null;
  }

  async update(userId: number, portfolio: Partial<PortfolioData>): Promise<PortfolioData> {
    const existing = this.portfolios.get(userId);
    if (!existing) {
      throw new Error(`Portfolio not found for user ${userId}`);
    }

    const updated: PortfolioData = {
      ...existing,
      ...portfolio,
    };

    this.portfolios.set(userId, updated);
    return updated;
  }

  async create(portfolio: Omit<PortfolioData, 'id'>): Promise<PortfolioData> {
    const newPortfolio: PortfolioData = {
      ...portfolio,
      id: this.currentId++,
    };

    this.portfolios.set(portfolio.userId, newPortfolio);
    return newPortfolio;
  }

  async delete(userId: number): Promise<void> {
    this.portfolios.delete(userId);
  }

  private initializeSampleData(): void {
    const portfolios: PortfolioData[] = [
      {
        id: 1,
        userId: 1,
        totalValue: "1247893.75",
        dailyPnL: "8432.50",
        successRate: "82.40",
        activePositions: 28
      },
      {
        id: 2,
        userId: 2,
        totalValue: "567234.20",
        dailyPnL: "-2341.80",
        successRate: "74.20",
        activePositions: 15
      },
      {
        id: 3,
        userId: 3,
        totalValue: "2156789.45",
        dailyPnL: "15678.90",
        successRate: "89.60",
        activePositions: 42
      }
    ];

    portfolios.forEach(portfolio => {
      this.portfolios.set(portfolio.userId, portfolio);
    });
  }
}
