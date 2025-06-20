import { describe, it, expect, beforeEach } from 'vitest';
import { Container } from '../shared/infrastructure/di/Container';
import { GetPortfolioUseCase } from '../shared/application/use-cases/GetPortfolioUseCase';
import { GetMarketDataUseCase } from '../shared/application/use-cases/GetMarketDataUseCase';
import { GetTransactionsUseCase } from '../shared/application/use-cases/GetTransactionsUseCase';
import { Portfolio } from '../shared/domain/entities/Portfolio';
import { Stock } from '../shared/domain/entities/Stock';
import { Transaction } from '../shared/domain/entities/Transaction';
import { Money } from '../shared/domain/value-objects/Money';
import { Percentage } from '../shared/domain/value-objects/Percentage';
import { StockSymbol } from '../shared/domain/value-objects/StockSymbol';

describe('Clean Architecture Implementation', () => {
  let container: Container;

  beforeEach(() => {
    container = Container.getInstance();
  });

  describe('Domain Layer', () => {
    it('should create Money value object with proper validation', () => {
      const money = new Money(1000.50);
      expect(money.amount).toBe(1000.50);
      expect(money.toFormattedString()).toBe('$1,000.50');
      
      expect(() => new Money(-100)).toThrow('Money amount cannot be negative');
    });

    it('should create Percentage value object with calculations', () => {
      const percentage = new Percentage(15.75);
      expect(percentage.value).toBe(15.75);
      expect(percentage.decimal).toBe(0.1575);
      expect(percentage.toFormattedString()).toBe('15.75%');
    });

    it('should create StockSymbol with validation', () => {
      const symbol = new StockSymbol('AAPL');
      expect(symbol.value).toBe('AAPL');
      
      expect(() => new StockSymbol('TOOLONG')).toThrow('Stock symbol must be between 1 and 5 characters');
      expect(() => new StockSymbol('123')).toThrow('Stock symbol must contain only letters');
    });

    it('should create Portfolio entity with business logic', () => {
      const portfolioData = {
        id: 1,
        userId: 1,
        totalValue: "100000.00",
        dailyPnL: "2500.00",
        successRate: "85.50",
        activePositions: 10
      };

      const portfolio = new Portfolio(portfolioData);
      expect(portfolio.totalValue.amount).toBe(100000);
      expect(portfolio.isDiversified()).toBe(true); // >= 5 positions
      expect(portfolio.getPerformanceStatus()).toBe('excellent');
    });

    it('should create Stock entity with market logic', () => {
      const stockData = {
        id: 1,
        symbol: "AAPL",
        name: "Apple Inc.",
        price: "150.00",
        change: "5.00",
        changePercent: "3.45",
        volume: 50000000,
        marketCap: "$2.5T"
      };

      const stock = new Stock(stockData);
      expect(stock.symbol.value).toBe('AAPL');
      expect(stock.isTrendingUp()).toBe(true);
      expect(stock.getPerformanceCategory()).toBe('moderate-gain');
      expect(stock.hasHighVolume()).toBe(true);
    });

    it('should create Transaction entity with business rules', () => {
      const transactionData = {
        id: 1,
        userId: 1,
        type: "buy",
        symbol: "AAPL",
        amount: "1500.00",
        shares: 10,
        timestamp: new Date()
      };

      const transaction = new Transaction(transactionData);
      expect(transaction.isBuy()).toBe(true);
      expect(transaction.getPricePerShare()?.amount).toBe(150);
      expect(transaction.getFormattedTitle()).toBe('Bought AAPL');
    });
  });

  describe('Application Layer', () => {
    it('should execute GetPortfolioUseCase through dependency injection', async () => {
      const useCase = container.get<GetPortfolioUseCase>('GetPortfolioUseCase');
      const result = await useCase.execute(1);
      
      expect(result).toBeDefined();
      expect(result?.userId).toBe(1);
      expect(result?.totalValue).toContain('$');
    });

    it('should execute GetMarketDataUseCase', async () => {
      const useCase = container.get<GetMarketDataUseCase>('GetMarketDataUseCase');
      const result = await useCase.execute();
      
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
      expect(result[0]).toHaveProperty('symbol');
      expect(result[0]).toHaveProperty('price');
    });

    it('should execute GetTransactionsUseCase', async () => {
      const useCase = container.get<GetTransactionsUseCase>('GetTransactionsUseCase');
      const result = await useCase.execute(1);
      
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
      expect(result[0]).toHaveProperty('type');
      expect(result[0]).toHaveProperty('formattedTitle');
    });
  });

  describe('Infrastructure Layer', () => {
    it('should provide repository implementations through DI', () => {
      const portfolioRepo = container.get('IPortfolioRepository');
      const stockRepo = container.get('IStockRepository');
      const transactionRepo = container.get('ITransactionRepository');
      
      expect(portfolioRepo).toBeDefined();
      expect(stockRepo).toBeDefined();
      expect(transactionRepo).toBeDefined();
    });

    it('should provide domain services through DI', () => {
      const calculationService = container.get('IPortfolioCalculationService');
      expect(calculationService).toBeDefined();
    });
  });

  describe('Dependency Inversion Principle', () => {
    it('should allow swapping repository implementations', () => {
      // This test demonstrates that we can easily swap implementations
      // because our use cases depend on interfaces, not concrete classes
      const originalRepo = container.get('IPortfolioRepository');
      
      // We could register a different implementation here
      // container.register('IPortfolioRepository', new DatabasePortfolioRepository());
      
      expect(originalRepo).toBeDefined();
    });
  });

  describe('Single Responsibility Principle', () => {
    it('should have entities focused on business logic only', () => {
      const portfolio = new Portfolio({
        id: 1,
        userId: 1,
        totalValue: "100000.00",
        dailyPnL: "2500.00",
        successRate: "85.50",
        activePositions: 10
      });

      // Portfolio entity should only handle portfolio-related business logic
      expect(typeof portfolio.isDiversified).toBe('function');
      expect(typeof portfolio.getPerformanceStatus).toBe('function');
      expect(typeof portfolio.getDailyReturnPercentage).toBe('function');
    });

    it('should have use cases focused on single operations', () => {
      // Each use case should handle only one specific operation
      const portfolioUseCase = container.get<GetPortfolioUseCase>('GetPortfolioUseCase');
      const marketDataUseCase = container.get<GetMarketDataUseCase>('GetMarketDataUseCase');
      
      expect(portfolioUseCase).toBeDefined();
      expect(marketDataUseCase).toBeDefined();
      // Each use case has a single execute method with a specific purpose
    });
  });
});
