import { ITransactionRepository } from './ITransactionRepository';
import { TransactionData } from '../../domain/entities/Transaction';

/**
 * In-memory implementation of transaction repository
 */
export class MemoryTransactionRepository implements ITransactionRepository {
  private transactions: Map<number, TransactionData[]>;
  private allTransactions: Map<number, TransactionData>;
  private currentId: number;

  constructor() {
    this.transactions = new Map();
    this.allTransactions = new Map();
    this.currentId = 1;
    this.initializeSampleData();
  }

  async getByUserId(userId: number): Promise<TransactionData[]> {
    return this.transactions.get(userId) || [];
  }

  async getRecentByUserId(userId: number, limit: number): Promise<TransactionData[]> {
    const userTransactions = this.transactions.get(userId) || [];
    return userTransactions
      .sort((a, b) => {
        const dateA = a.timestamp ? new Date(a.timestamp).getTime() : 0;
        const dateB = b.timestamp ? new Date(b.timestamp).getTime() : 0;
        return dateB - dateA; // Most recent first
      })
      .slice(0, limit);
  }

  async getById(id: number): Promise<TransactionData | null> {
    return this.allTransactions.get(id) || null;
  }

  async create(transaction: Omit<TransactionData, 'id' | 'timestamp'>): Promise<TransactionData> {
    const newTransaction: TransactionData = {
      ...transaction,
      id: this.currentId++,
      timestamp: new Date(),
    };

    // Add to all transactions map
    this.allTransactions.set(newTransaction.id, newTransaction);

    // Add to user transactions
    const userTransactions = this.transactions.get(transaction.userId) || [];
    userTransactions.unshift(newTransaction); // Add to beginning for recent first
    this.transactions.set(transaction.userId, userTransactions);

    return newTransaction;
  }

  async update(id: number, transaction: Partial<TransactionData>): Promise<TransactionData> {
    const existing = this.allTransactions.get(id);
    if (!existing) {
      throw new Error(`Transaction not found: ${id}`);
    }

    const updated: TransactionData = {
      ...existing,
      ...transaction,
    };

    // Update in all transactions map
    this.allTransactions.set(id, updated);

    // Update in user transactions
    const userTransactions = this.transactions.get(existing.userId) || [];
    const index = userTransactions.findIndex(t => t.id === id);
    if (index !== -1) {
      userTransactions[index] = updated;
      this.transactions.set(existing.userId, userTransactions);
    }

    return updated;
  }

  async delete(id: number): Promise<void> {
    const existing = this.allTransactions.get(id);
    if (!existing) {
      return;
    }

    // Remove from all transactions
    this.allTransactions.delete(id);

    // Remove from user transactions
    const userTransactions = this.transactions.get(existing.userId) || [];
    const filtered = userTransactions.filter(t => t.id !== id);
    this.transactions.set(existing.userId, filtered);
  }

  private initializeSampleData(): void {
    const now = Date.now();
    const sampleTransactions: TransactionData[] = [
      // User 1 transactions
      {
        id: 1,
        userId: 1,
        type: "buy",
        symbol: "AAPL",
        amount: "9487.50",
        shares: 50,
        timestamp: new Date(now - 2 * 60 * 1000)
      },
      {
        id: 2,
        userId: 1,
        type: "sell",
        symbol: "TSLA",
        amount: "7554.60",
        shares: 30,
        timestamp: new Date(now - 15 * 60 * 1000)
      },
      {
        id: 3,
        userId: 1,
        type: "dividend",
        symbol: "MSFT",
        amount: "412.50",
        shares: null,
        timestamp: new Date(now - 60 * 60 * 1000)
      },
      {
        id: 4,
        userId: 1,
        type: "buy",
        symbol: "NVDA",
        amount: "17508.40",
        shares: 20,
        timestamp: new Date(now - 2 * 60 * 60 * 1000)
      },
      {
        id: 5,
        userId: 1,
        type: "buy",
        symbol: "GOOGL",
        amount: "7133.00",
        shares: 50,
        timestamp: new Date(now - 4 * 60 * 60 * 1000)
      },
      {
        id: 6,
        userId: 1,
        type: "sell",
        symbol: "META",
        amount: "9704.60",
        shares: 20,
        timestamp: new Date(now - 6 * 60 * 60 * 1000)
      },
      {
        id: 7,
        userId: 1,
        type: "dividend",
        symbol: "AAPL",
        amount: "125.00",
        shares: null,
        timestamp: new Date(now - 12 * 60 * 60 * 1000)
      },
      {
        id: 8,
        userId: 1,
        type: "buy",
        symbol: "AMD",
        amount: "7139.00",
        shares: 50,
        timestamp: new Date(now - 24 * 60 * 60 * 1000)
      },
      {
        id: 9,
        userId: 1,
        type: "buy",
        symbol: "CRM",
        amount: "8680.20",
        shares: 30,
        timestamp: new Date(now - 2 * 24 * 60 * 60 * 1000)
      },
      {
        id: 10,
        userId: 1,
        type: "sell",
        symbol: "NFLX",
        amount: "12249.00",
        shares: 20,
        timestamp: new Date(now - 3 * 24 * 60 * 60 * 1000)
      },

      // User 2 transactions
      {
        id: 11,
        userId: 2,
        type: "buy",
        symbol: "MSFT",
        amount: "8257.00",
        shares: 20,
        timestamp: new Date(now - 30 * 60 * 1000)
      },
      {
        id: 12,
        userId: 2,
        type: "sell",
        symbol: "AAPL",
        amount: "5692.50",
        shares: 30,
        timestamp: new Date(now - 45 * 60 * 1000)
      },
      {
        id: 13,
        userId: 2,
        type: "dividend",
        symbol: "ORCL",
        amount: "89.60",
        shares: null,
        timestamp: new Date(now - 90 * 60 * 1000)
      },

      // User 3 transactions
      {
        id: 14,
        userId: 3,
        type: "buy",
        symbol: "NVDA",
        amount: "43771.00",
        shares: 50,
        timestamp: new Date(now - 10 * 60 * 1000)
      },
      {
        id: 15,
        userId: 3,
        type: "buy",
        symbol: "TSLA",
        amount: "25182.00",
        shares: 100,
        timestamp: new Date(now - 25 * 60 * 1000)
      },
      {
        id: 16,
        userId: 3,
        type: "dividend",
        symbol: "MSFT",
        amount: "1250.00",
        shares: null,
        timestamp: new Date(now - 120 * 60 * 1000)
      }
    ];

    sampleTransactions.forEach(transaction => {
      this.allTransactions.set(transaction.id, transaction);

      const userTransactions = this.transactions.get(transaction.userId) || [];
      userTransactions.push(transaction);
      this.transactions.set(transaction.userId, userTransactions);
    });

    this.currentId = 17;
  }
}
