import { Transaction } from '../../domain/entities/Transaction';
import { TransactionDto } from '../dto/PortfolioDto';
import { ITransactionRepository } from '../../infrastructure/repositories/ITransactionRepository';

/**
 * Use case for retrieving transaction data
 */
export class GetTransactionsUseCase {
  constructor(
    private readonly transactionRepository: ITransactionRepository
  ) {}

  async execute(userId: number): Promise<TransactionDto[]> {
    try {
      const transactionsData = await this.transactionRepository.getByUserId(userId);
      
      const transactions = transactionsData.map(data => new Transaction(data));
      
      return transactions.map(transaction => this.mapToDto(transaction));
    } catch (error) {
      throw new Error(`Failed to get transactions: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getRecent(userId: number, limit: number = 10): Promise<TransactionDto[]> {
    try {
      const transactionsData = await this.transactionRepository.getRecentByUserId(userId, limit);
      
      const transactions = transactionsData.map(data => new Transaction(data));
      
      return transactions.map(transaction => this.mapToDto(transaction));
    } catch (error) {
      throw new Error(`Failed to get recent transactions: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private mapToDto(transaction: Transaction): TransactionDto {
    const pricePerShare = transaction.getPricePerShare();
    
    return {
      id: transaction.id,
      userId: transaction.userId,
      type: transaction.type,
      symbol: transaction.symbol.value,
      amount: transaction.amount.toFormattedString(),
      shares: transaction.shares,
      timestamp: transaction.timestamp,
      formattedTitle: transaction.getFormattedTitle(),
      timeAgo: transaction.getTimeAgo(),
      iconColorClass: transaction.getIconColorClass(),
      backgroundColorClass: transaction.getBackgroundColorClass(),
      pricePerShare: pricePerShare?.toFormattedString(),
    };
  }
}
