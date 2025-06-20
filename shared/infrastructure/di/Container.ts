import { IPortfolioRepository } from '../repositories/IPortfolioRepository';
import { IStockRepository } from '../repositories/IStockRepository';
import { ITransactionRepository } from '../repositories/ITransactionRepository';
import { MemoryPortfolioRepository } from '../repositories/MemoryPortfolioRepository';
import { MemoryStockRepository } from '../repositories/MemoryStockRepository';
import { MemoryTransactionRepository } from '../repositories/MemoryTransactionRepository';
import { IPortfolioCalculationService } from '../../domain/services/IPortfolioCalculationService';
import { PortfolioCalculationService } from '../../domain/services/PortfolioCalculationService';
import { GetPortfolioUseCase } from '../../application/use-cases/GetPortfolioUseCase';
import { GetMarketDataUseCase } from '../../application/use-cases/GetMarketDataUseCase';
import { GetTransactionsUseCase } from '../../application/use-cases/GetTransactionsUseCase';
import { GetDashboardDataUseCase } from '../../application/use-cases/GetDashboardDataUseCase';

/**
 * Dependency injection container
 */
export class Container {
  private static instance: Container;
  private services: Map<string, any> = new Map();

  private constructor() {
    this.registerServices();
  }

  static getInstance(): Container {
    if (!Container.instance) {
      Container.instance = new Container();
    }
    return Container.instance;
  }

  get<T>(key: string): T {
    const service = this.services.get(key);
    if (!service) {
      throw new Error(`Service not found: ${key}`);
    }
    return service;
  }

  private registerServices(): void {
    // Register repositories
    this.services.set('IPortfolioRepository', new MemoryPortfolioRepository());
    this.services.set('IStockRepository', new MemoryStockRepository());
    this.services.set('ITransactionRepository', new MemoryTransactionRepository());

    // Register domain services
    this.services.set('IPortfolioCalculationService', new PortfolioCalculationService());

    // Register use cases
    this.services.set('GetPortfolioUseCase', new GetPortfolioUseCase(
      this.get<IPortfolioRepository>('IPortfolioRepository')
    ));

    this.services.set('GetMarketDataUseCase', new GetMarketDataUseCase(
      this.get<IStockRepository>('IStockRepository')
    ));

    this.services.set('GetTransactionsUseCase', new GetTransactionsUseCase(
      this.get<ITransactionRepository>('ITransactionRepository')
    ));

    this.services.set('GetDashboardDataUseCase', new GetDashboardDataUseCase(
      this.get<GetPortfolioUseCase>('GetPortfolioUseCase'),
      this.get<GetMarketDataUseCase>('GetMarketDataUseCase'),
      this.get<GetTransactionsUseCase>('GetTransactionsUseCase'),
      this.get<IPortfolioCalculationService>('IPortfolioCalculationService')
    ));
  }

  // Method to register additional services (useful for testing)
  register<T>(key: string, service: T): void {
    this.services.set(key, service);
  }

  // Method to clear all services (useful for testing)
  clear(): void {
    this.services.clear();
  }
}
