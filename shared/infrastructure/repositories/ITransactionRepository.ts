import { TransactionData } from '../../domain/entities/Transaction';

/**
 * Repository interface for transaction data access
 */
export interface ITransactionRepository {
  /**
   * Get all transactions for a user
   */
  getByUserId(userId: number): Promise<TransactionData[]>;

  /**
   * Get recent transactions for a user
   */
  getRecentByUserId(userId: number, limit: number): Promise<TransactionData[]>;

  /**
   * Get transaction by ID
   */
  getById(id: number): Promise<TransactionData | null>;

  /**
   * Create new transaction
   */
  create(transaction: Omit<TransactionData, 'id' | 'timestamp'>): Promise<TransactionData>;

  /**
   * Update transaction
   */
  update(id: number, transaction: Partial<TransactionData>): Promise<TransactionData>;

  /**
   * Delete transaction
   */
  delete(id: number): Promise<void>;
}
