# 🚀 Clean Architecture Quick Reference

## 📁 File Structure Template

```
your-feature/
├── shared/
│   ├── domain/
│   │   ├── entities/YourEntity.ts
│   │   ├── value-objects/YourValueObject.ts
│   │   └── services/IYourService.ts
│   ├── application/
│   │   ├── use-cases/YourUseCase.ts
│   │   └── dto/YourDto.ts
│   └── infrastructure/
│       ├── repositories/IYourRepository.ts
│       └── repositories/MemoryYourRepository.ts
└── client/src/presentation/
    ├── components/YourComponent.tsx
    ├── containers/YourContainer.tsx
    ├── hooks/useYour.ts
    └── view-models/YourViewModel.ts
```

## 🏗️ Layer Responsibilities

| Layer | Purpose | What Goes Here | What Doesn't |
|-------|---------|----------------|--------------|
| **Domain** | Business Logic | Entities, Value Objects, Business Rules | UI, Database, HTTP |
| **Application** | Use Cases | Orchestration, DTOs, Application Logic | Business Rules, UI Logic |
| **Infrastructure** | External Concerns | Repositories, APIs, Database | Business Logic |
| **Presentation** | User Interface | Components, Containers, View Models | Business Logic, Data Access |

## 🎯 Development Workflow

### 1. **Start with Domain** 🧠
```typescript
// 1. Create Entity
export class YourEntity {
  constructor(private data: YourEntityData) {}
  
  // Business methods here
  public calculateSomething(): number {
    return this.data.value * 2;
  }
}

// 2. Create Value Object (if needed)
export class YourValueObject {
  constructor(private value: string) {
    this.validate();
  }
  
  private validate(): void {
    if (!this.value) throw new Error('Value required');
  }
}
```

### 2. **Create Use Case** 🎬
```typescript
export class YourUseCase {
  constructor(private repository: IYourRepository) {}
  
  async execute(input: InputDto): Promise<OutputDto> {
    // 1. Get data
    const data = await this.repository.get(input.id);
    
    // 2. Apply business logic
    const entity = new YourEntity(data);
    const result = entity.calculateSomething();
    
    // 3. Return DTO
    return { result };
  }
}
```

### 3. **Create Repository** 🗄️
```typescript
// Interface
export interface IYourRepository {
  get(id: number): Promise<YourEntityData>;
  save(data: YourEntityData): Promise<void>;
}

// Implementation
export class MemoryYourRepository implements IYourRepository {
  private data = new Map<number, YourEntityData>();
  
  async get(id: number): Promise<YourEntityData> {
    return this.data.get(id);
  }
}
```

### 4. **Create Presentation** 🎨
```typescript
// Hook
export function useYourFeature(id: number) {
  return useQuery({
    queryKey: [`your-feature-${id}`],
    queryFn: () => apiService.getYourData(id)
  });
}

// View Model
export class YourViewModel {
  constructor(private data: YourDto) {}
  
  getDisplayData() {
    return {
      title: this.data.name.toUpperCase(),
      subtitle: `Value: ${this.data.value}`
    };
  }
}

// Container
export function YourContainer() {
  const { data, isLoading } = useYourFeature(1);
  
  if (isLoading) return <Loading />;
  
  const viewModel = new YourViewModel(data);
  return <YourComponent viewModel={viewModel} />;
}

// Component
export function YourComponent({ viewModel }) {
  const displayData = viewModel.getDisplayData();
  
  return (
    <div>
      <h1>{displayData.title}</h1>
      <p>{displayData.subtitle}</p>
    </div>
  );
}
```

## 🔧 Common Patterns

### **Repository Pattern**
```typescript
// Always start with interface
export interface IRepository<T> {
  findById(id: number): Promise<T | null>;
  save(entity: T): Promise<T>;
  delete(id: number): Promise<void>;
}

// Implement for your specific entity
export class YourRepository implements IRepository<YourEntity> {
  // Implementation here
}
```

### **Use Case Pattern**
```typescript
export class YourUseCase {
  constructor(
    private repository: IYourRepository,
    private service: IYourService
  ) {}

  async execute(input: Input): Promise<Output> {
    // 1. Validate input
    // 2. Get data from repository
    // 3. Apply business logic
    // 4. Save if needed
    // 5. Return DTO
  }
}
```

### **Entity Pattern**
```typescript
export class YourEntity {
  constructor(private data: EntityData) {
    this.validate();
  }

  // Getters for data access
  get id(): number { return this.data.id; }

  // Business methods
  public doSomething(): boolean {
    // Business logic here
    return true;
  }

  // Validation
  private validate(): void {
    if (this.data.id <= 0) {
      throw new Error('Invalid ID');
    }
  }

  // Serialization
  public toData(): EntityData {
    return { ...this.data };
  }
}
```

### **Value Object Pattern**
```typescript
export class YourValueObject {
  constructor(private readonly value: string) {
    this.validate();
  }

  get value(): string { return this.value; }

  equals(other: YourValueObject): boolean {
    return this.value === other.value;
  }

  private validate(): void {
    if (!this.value) {
      throw new Error('Value is required');
    }
  }
}
```

## 🧪 Testing Patterns

### **Domain Testing**
```typescript
describe('YourEntity', () => {
  it('should calculate correctly', () => {
    const entity = new YourEntity({ id: 1, value: 10 });
    expect(entity.calculateSomething()).toBe(20);
  });

  it('should validate input', () => {
    expect(() => new YourEntity({ id: 0, value: 10 }))
      .toThrow('Invalid ID');
  });
});
```

### **Use Case Testing**
```typescript
describe('YourUseCase', () => {
  let useCase: YourUseCase;
  let mockRepository: jest.Mocked<IYourRepository>;

  beforeEach(() => {
    mockRepository = {
      get: jest.fn(),
      save: jest.fn()
    } as any;
    
    useCase = new YourUseCase(mockRepository);
  });

  it('should execute successfully', async () => {
    mockRepository.get.mockResolvedValue({ id: 1, value: 10 });
    
    const result = await useCase.execute({ id: 1 });
    
    expect(result).toEqual({ result: 20 });
  });
});
```

### **Component Testing**
```typescript
describe('YourComponent', () => {
  it('should render correctly', () => {
    const mockViewModel = {
      getDisplayData: () => ({ title: 'Test', subtitle: 'Value: 10' })
    };
    
    render(<YourComponent viewModel={mockViewModel} />);
    
    expect(screen.getByText('Test')).toBeInTheDocument();
    expect(screen.getByText('Value: 10')).toBeInTheDocument();
  });
});
```

## ❌ Common Mistakes

### **1. Business Logic in Components**
```typescript
// ❌ Wrong
function Component({ userId }) {
  const [balance, setBalance] = useState(0);
  
  useEffect(() => {
    // Business logic in component!
    const calculateBalance = (transactions) => {
      return transactions.reduce((sum, t) => sum + t.amount, 0);
    };
    
    fetchTransactions(userId).then(transactions => {
      setBalance(calculateBalance(transactions));
    });
  }, [userId]);
}

// ✅ Correct
function Component({ viewModel }) {
  const displayData = viewModel.getBalanceDisplay();
  return <div>{displayData.balance}</div>;
}
```

### **2. Domain Depending on Infrastructure**
```typescript
// ❌ Wrong
import { ApiService } from '../infrastructure/api/ApiService';

export class Portfolio {
  constructor(private apiService: ApiService) {} // Wrong!
}

// ✅ Correct
export interface IMarketDataService {
  getCurrentPrice(symbol: string): Promise<Money>;
}

export class Portfolio {
  constructor(private marketDataService: IMarketDataService) {} // Correct!
}
```

### **3. Use Cases Doing Too Much**
```typescript
// ❌ Wrong
export class ManageEverythingUseCase {
  async execute() {
    // Getting data
    // Calculating metrics
    // Sending emails
    // Updating cache
    // Logging
    // etc...
  }
}

// ✅ Correct
export class GetDataUseCase { /* Only get data */ }
export class CalculateMetricsUseCase { /* Only calculate */ }
export class SendEmailUseCase { /* Only send email */ }
```

## 🎯 Quick Checklist

### **Before Starting a Feature:**
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

## 🚀 Commands

```bash
# Run tests
npm run test

# Run specific test file
npm run test YourEntity.test.ts

# Run tests in watch mode
npm run test:watch

# Build the application
npm run build

# Start development server
npm run dev

# Type checking
npm run check
```

## 📚 Key Principles

1. **Dependency Rule**: Dependencies point inward
2. **Single Responsibility**: One reason to change
3. **Open/Closed**: Open for extension, closed for modification
4. **Interface Segregation**: Specific interfaces
5. **Dependency Inversion**: Depend on abstractions

## 🎨 Naming Conventions

- **Entities**: `User`, `Portfolio`, `Transaction`
- **Value Objects**: `Money`, `Percentage`, `Email`
- **Use Cases**: `GetUserUseCase`, `CreatePortfolioUseCase`
- **Repositories**: `IUserRepository`, `MemoryUserRepository`
- **DTOs**: `UserDto`, `PortfolioDto`
- **View Models**: `UserViewModel`, `PortfolioViewModel`
- **Components**: `UserProfile`, `PortfolioChart`
- **Containers**: `UserProfileContainer`, `DashboardContainer`
- **Hooks**: `useUser`, `usePortfolio`

Remember: **Start with the domain, work outward, and always depend on abstractions!** 🎯
