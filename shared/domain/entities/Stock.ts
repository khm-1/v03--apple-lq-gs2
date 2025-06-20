import { Money } from '../value-objects/Money';
import { Percentage } from '../value-objects/Percentage';
import { StockSymbol } from '../value-objects/StockSymbol';

export interface StockData {
  id: number;
  symbol: string;
  name: string;
  price: string;
  change: string;
  changePercent: string;
  volume: number;
  marketCap: string;
}

/**
 * Stock domain entity with market data logic
 */
export class Stock {
  private readonly _id: number;
  private readonly _symbol: StockSymbol;
  private readonly _name: string;
  private readonly _price: Money;
  private readonly _change: Money;
  private readonly _changePercent: Percentage;
  private readonly _volume: number;
  private readonly _marketCap: string;

  constructor(data: StockData) {
    this._id = data.id;
    this._symbol = new StockSymbol(data.symbol);
    this._name = data.name;
    this._price = Money.fromString(data.price);
    this._change = Money.fromString(Math.abs(parseFloat(data.change)).toString());
    this._changePercent = Percentage.fromString(data.changePercent);
    this._volume = data.volume;
    this._marketCap = data.marketCap;

    this.validate();
  }

  get id(): number {
    return this._id;
  }

  get symbol(): StockSymbol {
    return this._symbol;
  }

  get name(): string {
    return this._name;
  }

  get price(): Money {
    return this._price;
  }

  get change(): Money {
    return this._change;
  }

  get changePercent(): Percentage {
    return this._changePercent;
  }

  get volume(): number {
    return this._volume;
  }

  get marketCap(): string {
    return this._marketCap;
  }

  /**
   * Check if the stock is trending upward
   */
  isTrendingUp(): boolean {
    return this._changePercent.isPositive();
  }

  /**
   * Check if the stock is trending downward
   */
  isTrendingDown(): boolean {
    return this._changePercent.isNegative();
  }

  /**
   * Get the previous day's closing price
   */
  getPreviousPrice(): Money {
    if (this._changePercent.isPositive()) {
      return this._price.subtract(this._change);
    } else {
      return this._price.add(this._change);
    }
  }

  /**
   * Check if the stock has high volume (above 10M)
   */
  hasHighVolume(): boolean {
    return this._volume > 10_000_000;
  }

  /**
   * Get volume in millions for display
   */
  getVolumeInMillions(): number {
    return Math.round((this._volume / 1_000_000) * 10) / 10;
  }

  /**
   * Get stock performance category
   */
  getPerformanceCategory(): 'strong-gain' | 'moderate-gain' | 'stable' | 'moderate-loss' | 'strong-loss' {
    const change = this._changePercent.value;
    
    if (change >= 5) return 'strong-gain';
    if (change >= 2) return 'moderate-gain';
    if (change >= -2) return 'stable';
    if (change >= -5) return 'moderate-loss';
    return 'strong-loss';
  }

  /**
   * Check if the stock is a large cap (market cap > $10B)
   */
  isLargeCap(): boolean {
    const capValue = this._marketCap.toLowerCase();
    if (capValue.includes('t')) {
      return true; // Trillion dollar companies
    }
    if (capValue.includes('b')) {
      const value = parseFloat(capValue.replace('$', '').replace('b', ''));
      return value >= 10;
    }
    return false;
  }

  /**
   * Get the gradient color class for UI display
   */
  getGradientColor(): string {
    const gradients: Record<string, string> = {
      'AAPL': 'from-blue-500 to-blue-600',
      'MSFT': 'from-purple-500 to-purple-600',
      'TSLA': 'from-green-500 to-emerald-600',
      'AMZN': 'from-yellow-500 to-orange-500',
    };
    return gradients[this._symbol.value] || 'from-gray-500 to-gray-600';
  }

  private validate(): void {
    if (this._id <= 0) {
      throw new Error('Stock ID must be positive');
    }
    if (!this._name || this._name.trim().length === 0) {
      throw new Error('Stock name cannot be empty');
    }
    if (this._volume < 0) {
      throw new Error('Volume cannot be negative');
    }
  }

  /**
   * Convert to plain object for serialization
   */
  toData(): StockData {
    return {
      id: this._id,
      symbol: this._symbol.value,
      name: this._name,
      price: this._price.amount.toString(),
      change: (this._changePercent.isPositive() ? '' : '-') + this._change.amount.toString(),
      changePercent: this._changePercent.value.toString(),
      volume: this._volume,
      marketCap: this._marketCap,
    };
  }
}
