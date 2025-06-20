import { Money } from '../value-objects/Money';
import { Percentage } from '../value-objects/Percentage';

export interface PortfolioData {
  id: number;
  userId: number;
  totalValue: string;
  dailyPnL: string;
  successRate: string;
  activePositions: number;
}

/**
 * Portfolio domain entity with business logic
 */
export class Portfolio {
  private readonly _id: number;
  private readonly _userId: number;
  private readonly _totalValue: Money;
  private readonly _dailyPnL: Money;
  private readonly _successRate: Percentage;
  private readonly _activePositions: number;

  constructor(data: PortfolioData) {
    this._id = data.id;
    this._userId = data.userId;
    this._totalValue = Money.fromString(data.totalValue);
    this._dailyPnL = Money.fromString(data.dailyPnL);
    this._successRate = Percentage.fromString(data.successRate);
    this._activePositions = data.activePositions;

    this.validate();
  }

  get id(): number {
    return this._id;
  }

  get userId(): number {
    return this._userId;
  }

  get totalValue(): Money {
    return this._totalValue;
  }

  get dailyPnL(): Money {
    return this._dailyPnL;
  }

  get successRate(): Percentage {
    return this._successRate;
  }

  get activePositions(): number {
    return this._activePositions;
  }

  /**
   * Calculate the daily return percentage
   */
  getDailyReturnPercentage(): Percentage {
    if (this._totalValue.amount === 0) {
      return Percentage.zero();
    }
    
    const previousValue = this._totalValue.subtract(this._dailyPnL);
    if (previousValue.amount === 0) {
      return Percentage.zero();
    }
    
    const returnDecimal = this._dailyPnL.amount / previousValue.amount;
    return Percentage.fromDecimal(returnDecimal);
  }

  /**
   * Check if the portfolio is performing well
   */
  isPerformingWell(): boolean {
    return this._dailyPnL.amount > 0 && this._successRate.value >= 70;
  }

  /**
   * Get the average position value
   */
  getAveragePositionValue(): Money {
    if (this._activePositions === 0) {
      return Money.zero();
    }
    return this._totalValue.divide(this._activePositions);
  }

  /**
   * Check if the portfolio is diversified (has multiple positions)
   */
  isDiversified(): boolean {
    return this._activePositions >= 5;
  }

  /**
   * Get portfolio performance status
   */
  getPerformanceStatus(): 'excellent' | 'good' | 'average' | 'poor' {
    const dailyReturn = this.getDailyReturnPercentage();
    
    if (dailyReturn.value >= 2 && this._successRate.value >= 80) {
      return 'excellent';
    } else if (dailyReturn.value >= 1 && this._successRate.value >= 70) {
      return 'good';
    } else if (dailyReturn.value >= 0 && this._successRate.value >= 60) {
      return 'average';
    } else {
      return 'poor';
    }
  }

  private validate(): void {
    if (this._id <= 0) {
      throw new Error('Portfolio ID must be positive');
    }
    if (this._userId <= 0) {
      throw new Error('User ID must be positive');
    }
    if (this._activePositions < 0) {
      throw new Error('Active positions cannot be negative');
    }
    if (this._successRate.value < 0 || this._successRate.value > 100) {
      throw new Error('Success rate must be between 0 and 100');
    }
  }

  /**
   * Convert to plain object for serialization
   */
  toData(): PortfolioData {
    return {
      id: this._id,
      userId: this._userId,
      totalValue: this._totalValue.amount.toString(),
      dailyPnL: this._dailyPnL.amount.toString(),
      successRate: this._successRate.value.toString(),
      activePositions: this._activePositions,
    };
  }
}
