import { Money } from '../value-objects/Money';
import { StockSymbol } from '../value-objects/StockSymbol';

export interface TransactionData {
  id: number;
  userId: number;
  type: string;
  symbol: string;
  amount: string;
  shares: number | null;
  timestamp: Date | null;
}

export type TransactionType = 'buy' | 'sell' | 'dividend';

/**
 * Transaction domain entity with business logic
 */
export class Transaction {
  private readonly _id: number;
  private readonly _userId: number;
  private readonly _type: TransactionType;
  private readonly _symbol: StockSymbol;
  private readonly _amount: Money;
  private readonly _shares: number | null;
  private readonly _timestamp: Date;

  constructor(data: TransactionData) {
    this._id = data.id;
    this._userId = data.userId;
    this._type = this.validateTransactionType(data.type);
    this._symbol = new StockSymbol(data.symbol);
    this._amount = Money.fromString(Math.abs(parseFloat(data.amount)).toString());
    this._shares = data.shares;
    this._timestamp = data.timestamp || new Date();

    this.validate();
  }

  get id(): number {
    return this._id;
  }

  get userId(): number {
    return this._userId;
  }

  get type(): TransactionType {
    return this._type;
  }

  get symbol(): StockSymbol {
    return this._symbol;
  }

  get amount(): Money {
    return this._amount;
  }

  get shares(): number | null {
    return this._shares;
  }

  get timestamp(): Date {
    return this._timestamp;
  }

  /**
   * Check if this is a buy transaction
   */
  isBuy(): boolean {
    return this._type === 'buy';
  }

  /**
   * Check if this is a sell transaction
   */
  isSell(): boolean {
    return this._type === 'sell';
  }

  /**
   * Check if this is a dividend transaction
   */
  isDividend(): boolean {
    return this._type === 'dividend';
  }

  /**
   * Get the signed amount (positive for buy/dividend, negative for sell)
   */
  getSignedAmount(): Money {
    return this._amount;
  }

  /**
   * Get the price per share if shares are available
   */
  getPricePerShare(): Money | null {
    if (!this._shares || this._shares === 0) {
      return null;
    }
    return this._amount.divide(Math.abs(this._shares));
  }

  /**
   * Get formatted transaction title for display
   */
  getFormattedTitle(): string {
    switch (this._type) {
      case 'buy':
        return `Bought ${this._symbol.value}`;
      case 'sell':
        return `Sold ${this._symbol.value}`;
      case 'dividend':
        return `${this._symbol.value} Dividend`;
      default:
        return `${this._symbol.value} Transaction`;
    }
  }

  /**
   * Get time ago string for display
   */
  getTimeAgo(): string {
    const now = new Date();
    const diffMs = now.getTime() - this._timestamp.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 60) {
      return `${diffMins} min${diffMins !== 1 ? 's' : ''} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    } else {
      return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    }
  }

  /**
   * Get transaction icon color class
   */
  getIconColorClass(): string {
    switch (this._type) {
      case 'buy':
        return 'text-green-400';
      case 'sell':
        return 'text-red-400';
      case 'dividend':
        return 'text-blue-400';
      default:
        return 'text-gray-400';
    }
  }

  /**
   * Get transaction background color class
   */
  getBackgroundColorClass(): string {
    switch (this._type) {
      case 'buy':
        return 'bg-green-500/20';
      case 'sell':
        return 'bg-red-500/20';
      case 'dividend':
        return 'bg-blue-500/20';
      default:
        return 'bg-gray-500/20';
    }
  }

  private validateTransactionType(type: string): TransactionType {
    const validTypes: TransactionType[] = ['buy', 'sell', 'dividend'];
    if (!validTypes.includes(type as TransactionType)) {
      throw new Error(`Invalid transaction type: ${type}`);
    }
    return type as TransactionType;
  }

  private validate(): void {
    if (this._id <= 0) {
      throw new Error('Transaction ID must be positive');
    }
    if (this._userId <= 0) {
      throw new Error('User ID must be positive');
    }
    if (this._type !== 'dividend' && (!this._shares || this._shares === 0)) {
      throw new Error('Buy and sell transactions must have shares');
    }
  }

  /**
   * Convert to plain object for serialization
   */
  toData(): TransactionData {
    return {
      id: this._id,
      userId: this._userId,
      type: this._type,
      symbol: this._symbol.value,
      amount: this._amount.amount.toString(),
      shares: this._shares,
      timestamp: this._timestamp,
    };
  }
}
