# 🏗️ Clean Architecture Development Guide

## 📚 Table of Contents
1. [Architecture Overview](#architecture-overview)
2. [Layer Responsibilities](#layer-responsibilities)
3. [Creating New Components](#creating-new-components)
4. [Creating New Pages](#creating-new-pages)
5. [Adding New Features](#adding-new-features)
6. [Best Practices](#best-practices)
7. [Common Patterns](#common-patterns)
8. [Testing Guidelines](#testing-guidelines)

## 🎯 Architecture Overview

Our clean architecture follows the **Dependency Rule**: dependencies point inward, from outer layers to inner layers.

```
┌─────────────────────────────────────────┐
│           Presentation Layer            │  ← UI Components, Containers
├─────────────────────────────────────────┤
│           Application Layer             │  ← Use Cases, DTOs
├─────────────────────────────────────────┤
│             Domain Layer                │  ← Entities, Value Objects
├─────────────────────────────────────────┤
│          Infrastructure Layer           │  ← Repositories, External APIs
└─────────────────────────────────────────┘
```

### **Key Principles:**
- **Inner layers** don't know about outer layers
- **Outer layers** depend on inner layer abstractions
- **Business logic** is isolated in the domain layer
- **UI logic** is separated from business logic

## 🏛️ Layer Responsibilities

### **1. Domain Layer** (`shared/domain/`)
**Purpose**: Core business logic and rules

- **Entities**: Business objects with behavior
- **Value Objects**: Immutable objects with validation
- **Domain Services**: Complex business operations
- **Interfaces**: Contracts for external dependencies

### **2. Application Layer** (`shared/application/`)
**Purpose**: Orchestrate business operations

- **Use Cases**: Single business operations
- **DTOs**: Data transfer between layers
- **Application Services**: Coordinate multiple use cases

### **3. Infrastructure Layer** (`shared/infrastructure/`)
**Purpose**: External concerns and implementations

- **Repositories**: Data access implementations
- **API Clients**: External service integrations
- **Dependency Injection**: Wire up dependencies

### **4. Presentation Layer** (`client/src/presentation/`)
**Purpose**: User interface and interaction

- **Components**: Pure UI components
- **Containers**: Connect UI to business logic
- **View Models**: Transform data for display
- **Hooks**: React-specific logic

## 🧩 Creating New Components

### **Step 1: Identify Component Type**

#### **Pure Component** (No business logic)
```typescript
// client/src/components/ui/button.tsx
interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary';
}

export function Button({ children, onClick, variant = 'primary' }: ButtonProps) {
  return (
    <button 
      onClick={onClick}
      className={`btn btn-${variant}`}
    >
      {children}
    </button>
  );
}
```

#### **Business Component** (With business logic)
```typescript
// client/src/presentation/components/StockCard.tsx
import { StockDisplayData } from '../view-models/StockViewModel';

interface StockCardProps {
  stock: StockDisplayData;
  onTrade?: (symbol: string) => void;
}

export function StockCard({ stock, onTrade }: StockCardProps) {
  return (
    <div className="stock-card">
      <div className="stock-header">
        <span className={stock.gradientColor}>{stock.symbol}</span>
        <span className={stock.isPositive ? 'positive' : 'negative'}>
          {stock.changePercent}
        </span>
      </div>
      <div className="stock-price">{stock.price}</div>
      <button onClick={() => onTrade?.(stock.symbol)}>
        Trade
      </button>
    </div>
  );
}
```

### **Step 2: Create View Model (if needed)**
```typescript
// client/src/presentation/view-models/StockViewModel.ts
import { StockDto } from '@shared/application/dto/PortfolioDto';

export interface StockDisplayData {
  symbol: string;
  price: string;
  changePercent: string;
  isPositive: boolean;
  gradientColor: string;
  performanceCategory: string;
}

export class StockViewModel {
  constructor(private readonly stocks: StockDto[]) {}

  getStocksForDisplay(): StockDisplayData[] {
    return this.stocks.map(stock => ({
      symbol: stock.symbol,
      price: stock.price,
      changePercent: stock.changePercent,
      isPositive: stock.isTrendingUp,
      gradientColor: stock.gradientColor,
      performanceCategory: stock.performanceCategory,
    }));
  }

  getTopPerformers(limit: number = 5): StockDisplayData[] {
    return this.getStocksForDisplay()
      .filter(stock => stock.isPositive)
      .slice(0, limit);
  }
}
```

### **Step 3: Create Container (if needed)**
```typescript
// client/src/presentation/containers/StockListContainer.tsx
import { useMarketData } from '../hooks/useMarketData';
import { StockViewModel } from '../view-models/StockViewModel';
import { StockList } from '../components/StockList';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { ErrorMessage } from '@/components/ui/error-message';

export function StockListContainer() {
  const { data: stocks, isLoading, error, refetch } = useMarketData();

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message="Failed to load stocks" onRetry={refetch} />;
  if (!stocks) return <ErrorMessage message="No stock data available" />;

  const viewModel = new StockViewModel(stocks);
  const stocksForDisplay = viewModel.getStocksForDisplay();

  const handleTrade = (symbol: string) => {
    // Handle trade action
    console.log(`Trading ${symbol}`);
  };

  return (
    <StockList 
      stocks={stocksForDisplay}
      onTrade={handleTrade}
    />
  );
}
```

## 📄 Creating New Pages

### **Step 1: Define the Page Purpose**
Example: Create a "Stock Details" page

### **Step 2: Create Domain Entities (if needed)**
```typescript
// shared/domain/entities/StockDetails.ts
import { Stock } from './Stock';
import { Money } from '../value-objects/Money';

export interface StockDetailsData {
  stock: Stock;
  historicalPrices: Array<{ date: Date; price: Money }>;
  news: Array<{ title: string; summary: string; date: Date }>;
  analysts: Array<{ rating: string; target: Money; firm: string }>;
}

export class StockDetails {
  constructor(private readonly data: StockDetailsData) {}

  get stock(): Stock {
    return this.data.stock;
  }

  getAverageAnalystTarget(): Money {
    const targets = this.data.analysts.map(a => a.target.amount);
    const average = targets.reduce((sum, target) => sum + target, 0) / targets.length;
    return new Money(average);
  }

  getRecentNews(days: number = 7): typeof this.data.news {
    const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    return this.data.news.filter(news => news.date >= cutoff);
  }

  getPriceChange30Days(): { amount: Money; percentage: number } {
    const prices = this.data.historicalPrices;
    if (prices.length < 2) return { amount: Money.zero(), percentage: 0 };

    const current = prices[prices.length - 1].price;
    const past = prices[0].price;
    const change = current.subtract(past);
    const percentage = (change.amount / past.amount) * 100;

    return { amount: change, percentage };
  }
}
```

### **Step 3: Create Use Case**
```typescript
// shared/application/use-cases/GetStockDetailsUseCase.ts
import { StockDetails } from '../../domain/entities/StockDetails';
import { IStockRepository } from '../../infrastructure/repositories/IStockRepository';
import { IMarketDataService } from '../../infrastructure/services/IMarketDataService';

export class GetStockDetailsUseCase {
  constructor(
    private readonly stockRepository: IStockRepository,
    private readonly marketDataService: IMarketDataService
  ) {}

  async execute(symbol: string): Promise<StockDetailsDto | null> {
    try {
      const stockData = await this.stockRepository.getBySymbol(symbol);
      if (!stockData) return null;

      const [historicalPrices, news, analysts] = await Promise.all([
        this.marketDataService.getHistoricalPrices(symbol, 30),
        this.marketDataService.getNews(symbol),
        this.marketDataService.getAnalystRatings(symbol)
      ]);

      const stockDetails = new StockDetails({
        stock: new Stock(stockData),
        historicalPrices,
        news,
        analysts
      });

      return this.mapToDto(stockDetails);
    } catch (error) {
      throw new Error(`Failed to get stock details: ${error.message}`);
    }
  }

  private mapToDto(stockDetails: StockDetails): StockDetailsDto {
    const priceChange = stockDetails.getPriceChange30Days();
    
    return {
      stock: {
        symbol: stockDetails.stock.symbol.value,
        name: stockDetails.stock.name,
        price: stockDetails.stock.price.toFormattedString(),
        // ... other stock properties
      },
      priceChange30Days: {
        amount: priceChange.amount.toFormattedString(),
        percentage: priceChange.percentage.toFixed(2)
      },
      averageAnalystTarget: stockDetails.getAverageAnalystTarget().toFormattedString(),
      recentNews: stockDetails.getRecentNews().map(news => ({
        title: news.title,
        summary: news.summary,
        date: news.date.toISOString()
      }))
    };
  }
}
```

### **Step 4: Create DTO**
```typescript
// shared/application/dto/StockDetailsDto.ts
export interface StockDetailsDto {
  stock: {
    symbol: string;
    name: string;
    price: string;
    changePercent: string;
    volume: number;
    marketCap: string;
  };
  priceChange30Days: {
    amount: string;
    percentage: string;
  };
  averageAnalystTarget: string;
  recentNews: Array<{
    title: string;
    summary: string;
    date: string;
  }>;
}
```

### **Step 5: Create Custom Hook**
```typescript
// client/src/presentation/hooks/useStockDetails.ts
import { useQuery } from "@tanstack/react-query";
import { ApiService } from "../../infrastructure/api/ApiService";
import { StockDetailsDto } from "@shared/application/dto/StockDetailsDto";

const apiService = new ApiService();

export function useStockDetails(symbol: string) {
  return useQuery<StockDetailsDto>({
    queryKey: [`stock-details-${symbol}`],
    queryFn: () => apiService.getStockDetails(symbol),
    enabled: !!symbol,
    staleTime: 60000, // 1 minute
  });
}
```

### **Step 6: Create View Model**
```typescript
// client/src/presentation/view-models/StockDetailsViewModel.ts
import { StockDetailsDto } from '@shared/application/dto/StockDetailsDto';

export class StockDetailsViewModel {
  constructor(private readonly data: StockDetailsDto) {}

  getHeaderData() {
    return {
      symbol: this.data.stock.symbol,
      name: this.data.stock.name,
      price: this.data.stock.price,
      changePercent: this.data.stock.changePercent,
      isPositive: !this.data.stock.changePercent.startsWith('-')
    };
  }

  getPerformanceData() {
    return {
      thirtyDayChange: this.data.priceChange30Days.amount,
      thirtyDayPercent: this.data.priceChange30Days.percentage,
      analystTarget: this.data.averageAnalystTarget,
      isOutperforming: parseFloat(this.data.priceChange30Days.percentage) > 0
    };
  }

  getNewsData() {
    return this.data.recentNews.map(news => ({
      ...news,
      formattedDate: new Date(news.date).toLocaleDateString(),
      shortSummary: news.summary.length > 100 
        ? news.summary.substring(0, 100) + '...'
        : news.summary
    }));
  }
}
```

### **Step 7: Create Page Container**
```typescript
// client/src/presentation/containers/StockDetailsContainer.tsx
import { useParams } from 'wouter';
import { useStockDetails } from '../hooks/useStockDetails';
import { StockDetailsViewModel } from '../view-models/StockDetailsViewModel';
import { StockDetailsView } from '../components/StockDetailsView';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { ErrorMessage } from '@/components/ui/error-message';

export function StockDetailsContainer() {
  const { symbol } = useParams<{ symbol: string }>();
  const { data, isLoading, error, refetch } = useStockDetails(symbol!);

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message="Failed to load stock details" onRetry={refetch} />;
  if (!data) return <ErrorMessage message="Stock not found" />;

  const viewModel = new StockDetailsViewModel(data);

  return <StockDetailsView viewModel={viewModel} />;
}
```

### **Step 8: Create Page Component**
```typescript
// client/src/presentation/components/StockDetailsView.tsx
import { StockDetailsViewModel } from '../view-models/StockDetailsViewModel';
import GlassPanel from '@/components/dashboard/glass-panel';

interface StockDetailsViewProps {
  viewModel: StockDetailsViewModel;
}

export function StockDetailsView({ viewModel }: StockDetailsViewProps) {
  const headerData = viewModel.getHeaderData();
  const performanceData = viewModel.getPerformanceData();
  const newsData = viewModel.getNewsData();

  return (
    <div className="min-h-screen p-6">
      {/* Header */}
      <GlassPanel className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">{headerData.symbol}</h1>
            <p className="text-slate-300">{headerData.name}</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-white">{headerData.price}</div>
            <div className={`text-sm ${headerData.isPositive ? 'text-green-400' : 'text-red-400'}`}>
              {headerData.changePercent}
            </div>
          </div>
        </div>
      </GlassPanel>

      {/* Performance */}
      <GlassPanel className="mb-6">
        <h2 className="text-xl font-semibold text-white mb-4">Performance</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <div className="text-slate-300 text-sm">30-Day Change</div>
            <div className={`text-lg font-semibold ${performanceData.isOutperforming ? 'text-green-400' : 'text-red-400'}`}>
              {performanceData.thirtyDayChange} ({performanceData.thirtyDayPercent}%)
            </div>
          </div>
          <div>
            <div className="text-slate-300 text-sm">Analyst Target</div>
            <div className="text-lg font-semibold text-white">{performanceData.analystTarget}</div>
          </div>
        </div>
      </GlassPanel>

      {/* News */}
      <GlassPanel>
        <h2 className="text-xl font-semibold text-white mb-4">Recent News</h2>
        <div className="space-y-4">
          {newsData.map((news, index) => (
            <div key={index} className="border-b border-white/10 pb-4 last:border-b-0">
              <h3 className="text-white font-medium mb-2">{news.title}</h3>
              <p className="text-slate-300 text-sm mb-2">{news.shortSummary}</p>
              <div className="text-slate-400 text-xs">{news.formattedDate}</div>
            </div>
          ))}
        </div>
      </GlassPanel>
    </div>
  );
}
```

### **Step 9: Add Route**
```typescript
// client/src/App.tsx
import { Switch, Route } from "wouter";
import Dashboard from "@/pages/dashboard";
import { StockDetailsContainer } from "@/presentation/containers/StockDetailsContainer";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/stock/:symbol" component={StockDetailsContainer} />
      <Route component={NotFound} />
    </Switch>
  );
}
```

## ✨ Adding New Features

### **Feature Development Workflow**

1. **Domain First**: Start with business logic
2. **Application Layer**: Create use cases
3. **Infrastructure**: Implement data access
4. **Presentation**: Build UI components

### **Example: Add Portfolio Alerts**

#### **Step 1: Domain Entity**
```typescript
// shared/domain/entities/Alert.ts
import { Money } from '../value-objects/Money';
import { StockSymbol } from '../value-objects/StockSymbol';

export interface AlertData {
  id: number;
  userId: number;
  symbol: string;
  type: 'price_above' | 'price_below' | 'volume_spike';
  threshold: string;
  isActive: boolean;
  createdAt: Date;
}

export class Alert {
  constructor(private readonly data: AlertData) {}

  get id(): number { return this.data.id; }
  get symbol(): StockSymbol { return new StockSymbol(this.data.symbol); }
  get threshold(): Money { return Money.fromString(this.data.threshold); }
  get isActive(): boolean { return this.data.isActive; }

  shouldTrigger(currentPrice: Money): boolean {
    if (!this.isActive) return false;

    switch (this.data.type) {
      case 'price_above':
        return currentPrice.isGreaterThan(this.threshold);
      case 'price_below':
        return currentPrice.isLessThan(this.threshold);
      default:
        return false;
    }
  }

  activate(): Alert {
    return new Alert({ ...this.data, isActive: true });
  }

  deactivate(): Alert {
    return new Alert({ ...this.data, isActive: false });
  }
}
```

#### **Step 2: Repository Interface**
```typescript
// shared/infrastructure/repositories/IAlertRepository.ts
import { AlertData } from '../../domain/entities/Alert';

export interface IAlertRepository {
  getByUserId(userId: number): Promise<AlertData[]>;
  create(alert: Omit<AlertData, 'id' | 'createdAt'>): Promise<AlertData>;
  update(id: number, alert: Partial<AlertData>): Promise<AlertData>;
  delete(id: number): Promise<void>;
}
```

#### **Step 3: Use Case**
```typescript
// shared/application/use-cases/ManageAlertsUseCase.ts
import { Alert } from '../../domain/entities/Alert';
import { IAlertRepository } from '../../infrastructure/repositories/IAlertRepository';

export class ManageAlertsUseCase {
  constructor(private readonly alertRepository: IAlertRepository) {}

  async getUserAlerts(userId: number): Promise<AlertDto[]> {
    const alertsData = await this.alertRepository.getByUserId(userId);
    return alertsData.map(data => this.mapToDto(new Alert(data)));
  }

  async createAlert(userId: number, alertData: CreateAlertDto): Promise<AlertDto> {
    const newAlert = await this.alertRepository.create({
      userId,
      symbol: alertData.symbol,
      type: alertData.type,
      threshold: alertData.threshold,
      isActive: true
    });

    return this.mapToDto(new Alert(newAlert));
  }

  private mapToDto(alert: Alert): AlertDto {
    return {
      id: alert.id,
      symbol: alert.symbol.value,
      threshold: alert.threshold.toFormattedString(),
      isActive: alert.isActive,
      // ... other properties
    };
  }
}
```

## 🎯 Best Practices

### **1. Dependency Direction**
```typescript
// ❌ Wrong: Domain depends on infrastructure
import { ApiService } from '../infrastructure/api/ApiService';

export class Portfolio {
  constructor(private apiService: ApiService) {} // Wrong!
}

// ✅ Correct: Domain defines interface, infrastructure implements
export interface IMarketDataService {
  getCurrentPrice(symbol: string): Promise<Money>;
}

export class Portfolio {
  constructor(private marketDataService: IMarketDataService) {} // Correct!
}
```

### **2. Pure Components**
```typescript
// ❌ Wrong: Component with business logic
export function StockCard({ symbol }: { symbol: string }) {
  const [price, setPrice] = useState<number>(0);

  useEffect(() => {
    // Business logic in component - Wrong!
    fetch(`/api/stocks/${symbol}`)
      .then(res => res.json())
      .then(data => setPrice(data.price));
  }, [symbol]);

  const isExpensive = price > 100; // Business logic - Wrong!

  return <div>{price}</div>;
}

// ✅ Correct: Pure component with props
interface StockCardProps {
  symbol: string;
  price: string;
  isExpensive: boolean;
}

export function StockCard({ symbol, price, isExpensive }: StockCardProps) {
  return (
    <div className={isExpensive ? 'expensive' : 'affordable'}>
      {symbol}: {price}
    </div>
  );
}
```

### **3. Single Responsibility**
```typescript
// ❌ Wrong: Use case doing too much
export class ManagePortfolioUseCase {
  async execute(userId: number) {
    // Getting data
    const portfolio = await this.portfolioRepo.get(userId);

    // Calculating metrics
    const performance = this.calculatePerformance(portfolio);

    // Sending notifications
    await this.notificationService.send(userId, performance);

    // Updating cache
    await this.cacheService.update(userId, portfolio);

    return portfolio;
  }
}

// ✅ Correct: Separate use cases
export class GetPortfolioUseCase {
  async execute(userId: number): Promise<PortfolioDto> {
    const portfolio = await this.portfolioRepo.get(userId);
    return this.mapToDto(portfolio);
  }
}

export class CalculatePortfolioMetricsUseCase {
  async execute(portfolioId: number): Promise<MetricsDto> {
    // Only calculate metrics
  }
}

export class SendPortfolioNotificationUseCase {
  async execute(userId: number, metrics: MetricsDto): Promise<void> {
    // Only send notifications
  }
}
```

## 🔄 Common Patterns

### **1. Repository Pattern**
```typescript
// Interface in domain/infrastructure
export interface IUserRepository {
  findById(id: number): Promise<UserData | null>;
  save(user: UserData): Promise<UserData>;
}

// Implementation in infrastructure
export class MemoryUserRepository implements IUserRepository {
  private users = new Map<number, UserData>();

  async findById(id: number): Promise<UserData | null> {
    return this.users.get(id) || null;
  }

  async save(user: UserData): Promise<UserData> {
    this.users.set(user.id, user);
    return user;
  }
}
```

### **2. Factory Pattern**
```typescript
// Domain service factory
export class PortfolioCalculationServiceFactory {
  static create(): IPortfolioCalculationService {
    return new PortfolioCalculationService();
  }
}

// Use in DI container
container.register('IPortfolioCalculationService',
  PortfolioCalculationServiceFactory.create()
);
```

### **3. Observer Pattern for Events**
```typescript
// Domain event
export class PortfolioUpdatedEvent {
  constructor(
    public readonly portfolioId: number,
    public readonly newValue: Money,
    public readonly timestamp: Date
  ) {}
}

// Event handler
export class PortfolioUpdatedHandler {
  async handle(event: PortfolioUpdatedEvent): Promise<void> {
    // Send notification, update cache, etc.
  }
}
```

## 🧪 Testing Guidelines

### **1. Domain Testing**
```typescript
// Test entities and value objects
describe('Portfolio Entity', () => {
  it('should calculate performance status correctly', () => {
    const portfolio = new Portfolio({
      id: 1,
      userId: 1,
      totalValue: "100000.00",
      dailyPnL: "2500.00",
      successRate: "85.50",
      activePositions: 10
    });

    expect(portfolio.getPerformanceStatus()).toBe('excellent');
    expect(portfolio.isDiversified()).toBe(true);
  });
});
```

### **2. Use Case Testing**
```typescript
// Test use cases with mocked dependencies
describe('GetPortfolioUseCase', () => {
  let useCase: GetPortfolioUseCase;
  let mockRepository: jest.Mocked<IPortfolioRepository>;

  beforeEach(() => {
    mockRepository = {
      getByUserId: jest.fn(),
    } as any;

    useCase = new GetPortfolioUseCase(mockRepository);
  });

  it('should return portfolio DTO', async () => {
    const portfolioData = { /* mock data */ };
    mockRepository.getByUserId.mockResolvedValue(portfolioData);

    const result = await useCase.execute(1);

    expect(result).toBeDefined();
    expect(result.userId).toBe(1);
  });
});
```

### **3. Component Testing**
```typescript
// Test pure components
describe('StockCard Component', () => {
  it('should display stock information correctly', () => {
    const props = {
      symbol: 'AAPL',
      price: '$150.00',
      isPositive: true,
      changePercent: '+2.5%'
    };

    render(<StockCard {...props} />);

    expect(screen.getByText('AAPL')).toBeInTheDocument();
    expect(screen.getByText('$150.00')).toBeInTheDocument();
    expect(screen.getByText('+2.5%')).toHaveClass('text-green-400');
  });
});
```

## 📋 Checklist for New Features

### **Before Starting:**
- [ ] Understand the business requirement
- [ ] Identify which layer the logic belongs to
- [ ] Check if existing patterns can be reused
- [ ] Plan the data flow from UI to domain

### **During Development:**
- [ ] Start with domain entities and business logic
- [ ] Create interfaces before implementations
- [ ] Write tests for each layer
- [ ] Keep components pure and testable
- [ ] Use dependency injection

### **Before Completion:**
- [ ] All tests pass
- [ ] No business logic in UI components
- [ ] Dependencies point inward
- [ ] Code follows established patterns
- [ ] Documentation is updated

## 🚀 Quick Start Templates

### **New Entity Template**
```typescript
// shared/domain/entities/YourEntity.ts
export interface YourEntityData {
  id: number;
  // ... other properties
}

export class YourEntity {
  constructor(private readonly data: YourEntityData) {
    this.validate();
  }

  // Getters
  get id(): number { return this.data.id; }

  // Business methods
  public someBusinessMethod(): boolean {
    // Business logic here
    return true;
  }

  private validate(): void {
    if (this.data.id <= 0) {
      throw new Error('ID must be positive');
    }
  }

  public toData(): YourEntityData {
    return { ...this.data };
  }
}
```

### **New Use Case Template**
```typescript
// shared/application/use-cases/YourUseCase.ts
export class YourUseCase {
  constructor(
    private readonly repository: IYourRepository,
    private readonly service: IYourService
  ) {}

  async execute(input: InputDto): Promise<OutputDto> {
    try {
      // 1. Validate input
      // 2. Get data from repository
      // 3. Apply business logic
      // 4. Return DTO

      return this.mapToDto(result);
    } catch (error) {
      throw new Error(`Use case failed: ${error.message}`);
    }
  }

  private mapToDto(entity: YourEntity): OutputDto {
    return {
      // Map entity to DTO
    };
  }
}
```

### **New Component Template**
```typescript
// client/src/presentation/components/YourComponent.tsx
interface YourComponentProps {
  data: YourDisplayData;
  onAction?: (id: number) => void;
}

export function YourComponent({ data, onAction }: YourComponentProps) {
  return (
    <div className="your-component">
      {/* Pure UI rendering */}
      <button onClick={() => onAction?.(data.id)}>
        Action
      </button>
    </div>
  );
}
```

This guide provides a comprehensive foundation for understanding and applying clean architecture principles in your financial dashboard application. Follow these patterns to create maintainable, testable, and scalable features! 🎉
```
