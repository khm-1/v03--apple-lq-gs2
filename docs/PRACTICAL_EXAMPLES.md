# 🛠️ Practical Examples: Building Features with Clean Architecture

## 📚 Table of Contents
1. [Example 1: User Profile Page](#example-1-user-profile-page)
2. [Example 2: Trading Component](#example-2-trading-component)
3. [Example 3: Notification System](#example-3-notification-system)
4. [Example 4: Portfolio Comparison](#example-4-portfolio-comparison)
5. [Common Mistakes & Solutions](#common-mistakes--solutions)

## 🎯 Example 1: User Profile Page

Let's build a complete user profile page following clean architecture principles.

### **Step 1: Domain Layer - User Entity**

```typescript
// shared/domain/entities/User.ts
import { Money } from '../value-objects/Money';

export interface UserData {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  joinDate: Date;
  totalInvested: string;
  riskTolerance: 'conservative' | 'moderate' | 'aggressive';
  isVerified: boolean;
}

export class User {
  constructor(private readonly data: UserData) {
    this.validate();
  }

  get id(): number { return this.data.id; }
  get email(): string { return this.data.email; }
  get firstName(): string { return this.data.firstName; }
  get lastName(): string { return this.data.lastName; }
  get joinDate(): Date { return this.data.joinDate; }
  get riskTolerance(): string { return this.data.riskTolerance; }
  get isVerified(): boolean { return this.data.isVerified; }

  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  get totalInvested(): Money {
    return Money.fromString(this.data.totalInvested);
  }

  get membershipDuration(): number {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - this.joinDate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)); // days
  }

  get membershipLevel(): 'bronze' | 'silver' | 'gold' | 'platinum' {
    const invested = this.totalInvested.amount;
    if (invested >= 1000000) return 'platinum';
    if (invested >= 500000) return 'gold';
    if (invested >= 100000) return 'silver';
    return 'bronze';
  }

  canTrade(): boolean {
    return this.isVerified && this.totalInvested.amount > 0;
  }

  getRiskDescription(): string {
    const descriptions = {
      conservative: 'Prefers stable, low-risk investments',
      moderate: 'Balanced approach to risk and reward',
      aggressive: 'Seeks high returns, accepts high risk'
    };
    return descriptions[this.data.riskTolerance];
  }

  private validate(): void {
    if (!this.data.email.includes('@')) {
      throw new Error('Invalid email format');
    }
    if (this.data.firstName.trim().length === 0) {
      throw new Error('First name is required');
    }
    if (this.data.lastName.trim().length === 0) {
      throw new Error('Last name is required');
    }
  }

  toData(): UserData {
    return { ...this.data };
  }
}
```

### **Step 2: Infrastructure Layer - Repository**

```typescript
// shared/infrastructure/repositories/IUserRepository.ts
import { UserData } from '../../domain/entities/User';

export interface IUserRepository {
  getById(id: number): Promise<UserData | null>;
  update(id: number, data: Partial<UserData>): Promise<UserData>;
  updateRiskTolerance(id: number, riskTolerance: string): Promise<UserData>;
}

// shared/infrastructure/repositories/MemoryUserRepository.ts
export class MemoryUserRepository implements IUserRepository {
  private users = new Map<number, UserData>();

  constructor() {
    this.initializeSampleData();
  }

  async getById(id: number): Promise<UserData | null> {
    return this.users.get(id) || null;
  }

  async update(id: number, data: Partial<UserData>): Promise<UserData> {
    const existing = this.users.get(id);
    if (!existing) {
      throw new Error(`User not found: ${id}`);
    }

    const updated = { ...existing, ...data };
    this.users.set(id, updated);
    return updated;
  }

  async updateRiskTolerance(id: number, riskTolerance: string): Promise<UserData> {
    return this.update(id, { riskTolerance: riskTolerance as any });
  }

  private initializeSampleData(): void {
    const sampleUsers: UserData[] = [
      {
        id: 1,
        email: 'john.doe@example.com',
        firstName: 'John',
        lastName: 'Doe',
        joinDate: new Date('2023-01-15'),
        totalInvested: '1247893.75',
        riskTolerance: 'moderate',
        isVerified: true
      },
      {
        id: 2,
        email: 'jane.smith@example.com',
        firstName: 'Jane',
        lastName: 'Smith',
        joinDate: new Date('2023-06-20'),
        totalInvested: '567234.20',
        riskTolerance: 'conservative',
        isVerified: true
      }
    ];

    sampleUsers.forEach(user => {
      this.users.set(user.id, user);
    });
  }
}
```

### **Step 3: Application Layer - Use Cases**

```typescript
// shared/application/use-cases/GetUserProfileUseCase.ts
import { User } from '../../domain/entities/User';
import { IUserRepository } from '../../infrastructure/repositories/IUserRepository';

export interface UserProfileDto {
  id: number;
  fullName: string;
  email: string;
  membershipLevel: string;
  membershipDuration: number;
  totalInvested: string;
  riskTolerance: string;
  riskDescription: string;
  canTrade: boolean;
  isVerified: boolean;
  joinDate: string;
}

export class GetUserProfileUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(userId: number): Promise<UserProfileDto | null> {
    try {
      const userData = await this.userRepository.getById(userId);
      if (!userData) return null;

      const user = new User(userData);
      return this.mapToDto(user);
    } catch (error) {
      throw new Error(`Failed to get user profile: ${error.message}`);
    }
  }

  private mapToDto(user: User): UserProfileDto {
    return {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      membershipLevel: user.membershipLevel,
      membershipDuration: user.membershipDuration,
      totalInvested: user.totalInvested.toFormattedString(),
      riskTolerance: user.riskTolerance,
      riskDescription: user.getRiskDescription(),
      canTrade: user.canTrade(),
      isVerified: user.isVerified,
      joinDate: user.joinDate.toLocaleDateString()
    };
  }
}

// shared/application/use-cases/UpdateUserRiskToleranceUseCase.ts
export class UpdateUserRiskToleranceUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(userId: number, riskTolerance: string): Promise<UserProfileDto> {
    try {
      const validRiskLevels = ['conservative', 'moderate', 'aggressive'];
      if (!validRiskLevels.includes(riskTolerance)) {
        throw new Error('Invalid risk tolerance level');
      }

      const updatedUserData = await this.userRepository.updateRiskTolerance(userId, riskTolerance);
      const user = new User(updatedUserData);
      
      return {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        membershipLevel: user.membershipLevel,
        membershipDuration: user.membershipDuration,
        totalInvested: user.totalInvested.toFormattedString(),
        riskTolerance: user.riskTolerance,
        riskDescription: user.getRiskDescription(),
        canTrade: user.canTrade(),
        isVerified: user.isVerified,
        joinDate: user.joinDate.toLocaleDateString()
      };
    } catch (error) {
      throw new Error(`Failed to update risk tolerance: ${error.message}`);
    }
  }
}
```

### **Step 4: Presentation Layer - Hooks**

```typescript
// client/src/presentation/hooks/useUserProfile.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ApiService } from "../../infrastructure/api/ApiService";
import { UserProfileDto } from "@shared/application/use-cases/GetUserProfileUseCase";

const apiService = new ApiService();

export function useUserProfile(userId: number) {
  return useQuery<UserProfileDto>({
    queryKey: [`user-profile-${userId}`],
    queryFn: () => apiService.getUserProfile(userId),
    staleTime: 300000, // 5 minutes
  });
}

export function useUpdateRiskTolerance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, riskTolerance }: { userId: number; riskTolerance: string }) =>
      apiService.updateUserRiskTolerance(userId, riskTolerance),
    onSuccess: (data) => {
      // Update the cache
      queryClient.setQueryData([`user-profile-${data.id}`], data);
    },
  });
}
```

### **Step 5: Presentation Layer - View Model**

```typescript
// client/src/presentation/view-models/UserProfileViewModel.ts
import { UserProfileDto } from '@shared/application/use-cases/GetUserProfileUseCase';

export class UserProfileViewModel {
  constructor(private readonly data: UserProfileDto) {}

  getHeaderData() {
    return {
      fullName: this.data.fullName,
      email: this.data.email,
      membershipLevel: this.data.membershipLevel,
      membershipBadgeColor: this.getMembershipBadgeColor(),
      joinDate: this.data.joinDate
    };
  }

  getInvestmentData() {
    return {
      totalInvested: this.data.totalInvested,
      membershipDuration: `${this.data.membershipDuration} days`,
      canTrade: this.data.canTrade,
      isVerified: this.data.isVerified
    };
  }

  getRiskData() {
    return {
      riskTolerance: this.data.riskTolerance,
      riskDescription: this.data.riskDescription,
      riskColor: this.getRiskColor(),
      riskIcon: this.getRiskIcon()
    };
  }

  private getMembershipBadgeColor(): string {
    const colors = {
      bronze: 'bg-amber-600',
      silver: 'bg-gray-400',
      gold: 'bg-yellow-500',
      platinum: 'bg-purple-600'
    };
    return colors[this.data.membershipLevel as keyof typeof colors] || 'bg-gray-400';
  }

  private getRiskColor(): string {
    const colors = {
      conservative: 'text-green-400',
      moderate: 'text-yellow-400',
      aggressive: 'text-red-400'
    };
    return colors[this.data.riskTolerance as keyof typeof colors] || 'text-gray-400';
  }

  private getRiskIcon(): string {
    const icons = {
      conservative: '🛡️',
      moderate: '⚖️',
      aggressive: '🚀'
    };
    return icons[this.data.riskTolerance as keyof typeof icons] || '❓';
  }
}
```

### **Step 6: Presentation Layer - Components**

```typescript
// client/src/presentation/components/UserProfileView.tsx
import { UserProfileViewModel } from '../view-models/UserProfileViewModel';
import GlassPanel from '@/components/dashboard/glass-panel';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface UserProfileViewProps {
  viewModel: UserProfileViewModel;
  onUpdateRiskTolerance: (riskTolerance: string) => void;
  isUpdating?: boolean;
}

export function UserProfileView({ 
  viewModel, 
  onUpdateRiskTolerance, 
  isUpdating = false 
}: UserProfileViewProps) {
  const headerData = viewModel.getHeaderData();
  const investmentData = viewModel.getInvestmentData();
  const riskData = viewModel.getRiskData();

  return (
    <div className="min-h-screen p-6 space-y-6">
      {/* Header */}
      <GlassPanel>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              {headerData.fullName}
            </h1>
            <p className="text-slate-300 mb-4">{headerData.email}</p>
            <div className="flex items-center gap-4">
              <Badge className={headerData.membershipBadgeColor}>
                {headerData.membershipLevel.toUpperCase()}
              </Badge>
              <span className="text-slate-400 text-sm">
                Member since {headerData.joinDate}
              </span>
            </div>
          </div>
          {investmentData.isVerified && (
            <div className="text-green-400 flex items-center gap-2">
              <span className="text-2xl">✓</span>
              <span>Verified</span>
            </div>
          )}
        </div>
      </GlassPanel>

      {/* Investment Summary */}
      <GlassPanel>
        <h2 className="text-xl font-semibold text-white mb-4">Investment Summary</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <div className="text-slate-300 text-sm mb-1">Total Invested</div>
            <div className="text-2xl font-bold text-white">{investmentData.totalInvested}</div>
          </div>
          <div>
            <div className="text-slate-300 text-sm mb-1">Membership Duration</div>
            <div className="text-lg font-semibold text-white">{investmentData.membershipDuration}</div>
          </div>
          <div>
            <div className="text-slate-300 text-sm mb-1">Trading Status</div>
            <div className={`text-lg font-semibold ${investmentData.canTrade ? 'text-green-400' : 'text-red-400'}`}>
              {investmentData.canTrade ? 'Enabled' : 'Disabled'}
            </div>
          </div>
        </div>
      </GlassPanel>

      {/* Risk Tolerance */}
      <GlassPanel>
        <h2 className="text-xl font-semibold text-white mb-4">Risk Tolerance</h2>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-2xl">{riskData.riskIcon}</span>
            <div>
              <div className={`text-lg font-semibold ${riskData.riskColor}`}>
                {riskData.riskTolerance.charAt(0).toUpperCase() + riskData.riskTolerance.slice(1)}
              </div>
              <div className="text-slate-300 text-sm">{riskData.riskDescription}</div>
            </div>
          </div>
          <div className="flex gap-2">
            {['conservative', 'moderate', 'aggressive'].map((level) => (
              <Button
                key={level}
                variant={riskData.riskTolerance === level ? 'default' : 'outline'}
                size="sm"
                onClick={() => onUpdateRiskTolerance(level)}
                disabled={isUpdating}
                className="capitalize"
              >
                {level}
              </Button>
            ))}
          </div>
        </div>
      </GlassPanel>
    </div>
  );
}
```

### **Step 7: Container Component**

```typescript
// client/src/presentation/containers/UserProfileContainer.tsx
import { useParams } from 'wouter';
import { useUserProfile, useUpdateRiskTolerance } from '../hooks/useUserProfile';
import { UserProfileViewModel } from '../view-models/UserProfileViewModel';
import { UserProfileView } from '../components/UserProfileView';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { ErrorMessage } from '@/components/ui/error-message';
import { toast } from 'sonner';

export function UserProfileContainer() {
  const { userId } = useParams<{ userId: string }>();
  const userIdNum = parseInt(userId || '1');
  
  const { data: userProfile, isLoading, error, refetch } = useUserProfile(userIdNum);
  const updateRiskTolerance = useUpdateRiskTolerance();

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message="Failed to load user profile" onRetry={refetch} />;
  if (!userProfile) return <ErrorMessage message="User not found" />;

  const viewModel = new UserProfileViewModel(userProfile);

  const handleUpdateRiskTolerance = async (riskTolerance: string) => {
    try {
      await updateRiskTolerance.mutateAsync({ 
        userId: userIdNum, 
        riskTolerance 
      });
      toast.success('Risk tolerance updated successfully');
    } catch (error) {
      toast.error('Failed to update risk tolerance');
    }
  };

  return (
    <UserProfileView
      viewModel={viewModel}
      onUpdateRiskTolerance={handleUpdateRiskTolerance}
      isUpdating={updateRiskTolerance.isPending}
    />
  );
}
```

### **Step 8: API Integration**

```typescript
// client/src/infrastructure/api/ApiService.ts (add methods)
export class ApiService implements IApiService {
  // ... existing methods

  async getUserProfile(userId: number): Promise<UserProfileDto> {
    const response = await this.fetch(`/api/users/${userId}/profile`);
    return response.json();
  }

  async updateUserRiskTolerance(userId: number, riskTolerance: string): Promise<UserProfileDto> {
    const response = await this.fetch(`/api/users/${userId}/risk-tolerance`, {
      method: 'PATCH',
      body: JSON.stringify({ riskTolerance }),
    });
    return response.json();
  }
}
```

### **Step 9: Server Routes**

```typescript
// server/routes.ts (add routes)
export async function registerRoutes(app: Express): Promise<Server> {
  // ... existing routes

  // Get user profile
  app.get("/api/users/:userId/profile", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      if (isNaN(userId) || userId <= 0) {
        return res.status(400).json({ message: "Invalid user ID" });
      }

      const getUserProfileUseCase = container.get<GetUserProfileUseCase>('GetUserProfileUseCase');
      const profile = await getUserProfileUseCase.execute(userId);
      
      if (!profile) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json(profile);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      res.status(500).json({ message: "Failed to fetch user profile" });
    }
  });

  // Update user risk tolerance
  app.patch("/api/users/:userId/risk-tolerance", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const { riskTolerance } = req.body;

      if (isNaN(userId) || userId <= 0) {
        return res.status(400).json({ message: "Invalid user ID" });
      }

      const updateRiskToleranceUseCase = container.get<UpdateUserRiskToleranceUseCase>('UpdateUserRiskToleranceUseCase');
      const updatedProfile = await updateRiskToleranceUseCase.execute(userId, riskTolerance);
      
      res.json(updatedProfile);
    } catch (error) {
      console.error('Error updating risk tolerance:', error);
      res.status(500).json({ message: "Failed to update risk tolerance" });
    }
  });

  // ... rest of routes
}
```

### **Step 10: Update DI Container**

```typescript
// shared/infrastructure/di/Container.ts (add registrations)
private registerServices(): void {
  // ... existing registrations

  // Register user repository
  this.services.set('IUserRepository', new MemoryUserRepository());

  // Register user use cases
  this.services.set('GetUserProfileUseCase', new GetUserProfileUseCase(
    this.get<IUserRepository>('IUserRepository')
  ));

  this.services.set('UpdateUserRiskToleranceUseCase', new UpdateUserRiskToleranceUseCase(
    this.get<IUserRepository>('IUserRepository')
  ));
}
```

## ✅ Complete Feature Checklist

- [x] **Domain Entity**: User with business logic
- [x] **Value Objects**: Money for type safety
- [x] **Repository Interface**: Abstract data access
- [x] **Repository Implementation**: In-memory storage
- [x] **Use Cases**: Get profile, update risk tolerance
- [x] **DTOs**: Clean data transfer objects
- [x] **View Model**: Transform data for UI
- [x] **Custom Hooks**: React integration
- [x] **Pure Components**: No business logic
- [x] **Container Component**: Connect UI to use cases
- [x] **API Service**: External service abstraction
- [x] **Server Routes**: HTTP endpoints
- [x] **Dependency Injection**: Wire up dependencies

This example demonstrates a complete feature built with clean architecture principles, showing how each layer has a specific responsibility and how they work together to create a maintainable, testable system.
