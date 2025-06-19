import { users, portfolios, stocks, transactions, type User, type InsertUser, type Portfolio, type InsertPortfolio, type Stock, type InsertStock, type Transaction, type InsertTransaction } from "@shared/schema";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  getPortfolio(userId: number): Promise<Portfolio | undefined>;
  updatePortfolio(userId: number, portfolio: InsertPortfolio): Promise<Portfolio>;
  
  getAllStocks(): Promise<Stock[]>;
  getStock(symbol: string): Promise<Stock | undefined>;
  updateStock(symbol: string, stock: InsertStock): Promise<Stock>;
  
  getTransactions(userId: number): Promise<Transaction[]>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private portfolios: Map<number, Portfolio>;
  private stocks: Map<string, Stock>;
  private transactions: Map<number, Transaction[]>;
  private currentUserId: number;
  private currentPortfolioId: number;
  private currentStockId: number;
  private currentTransactionId: number;

  constructor() {
    this.users = new Map();
    this.portfolios = new Map();
    this.stocks = new Map();
    this.transactions = new Map();
    this.currentUserId = 1;
    this.currentPortfolioId = 1;
    this.currentStockId = 1;
    this.currentTransactionId = 1;

    // Initialize with sample data
    this.initializeSampleData();
  }

  private initializeSampleData() {
    // Sample user
    const user: User = { id: 1, username: "john_portfolio", password: "hashed_password" };
    this.users.set(1, user);

    // Sample portfolio
    const portfolio: Portfolio = {
      id: 1,
      userId: 1,
      totalValue: "847293.00",
      dailyPnL: "4832.50",
      successRate: "78.60",
      activePositions: 24
    };
    this.portfolios.set(1, portfolio);

    // Sample stocks
    const sampleStocks: Stock[] = [
      { id: 1, symbol: "AAPL", name: "Apple Inc.", price: "173.50", change: "4.12", changePercent: "2.4", volume: 45200000, marketCap: "$2.7T" },
      { id: 2, symbol: "MSFT", name: "Microsoft Corp.", price: "384.30", change: "6.83", changePercent: "1.8", volume: 23100000, marketCap: "$2.9T" },
      { id: 3, symbol: "TSLA", name: "Tesla Inc.", price: "248.42", change: "-2.01", changePercent: "-0.8", volume: 67800000, marketCap: "$789B" },
      { id: 4, symbol: "AMZN", name: "Amazon.com Inc.", price: "154.89", change: "4.85", changePercent: "3.2", volume: 34500000, marketCap: "$1.6T" }
    ];

    sampleStocks.forEach(stock => {
      this.stocks.set(stock.symbol, stock);
    });

    // Sample transactions
    const sampleTransactions: Transaction[] = [
      { id: 1, userId: 1, type: "buy", symbol: "AAPL", amount: "5250.00", shares: 30, timestamp: new Date(Date.now() - 2 * 60 * 1000) },
      { id: 2, userId: 1, type: "sell", symbol: "TSLA", amount: "-3740.00", shares: -15, timestamp: new Date(Date.now() - 15 * 60 * 1000) },
      { id: 3, userId: 1, type: "dividend", symbol: "MSFT", amount: "180.00", shares: null, timestamp: new Date(Date.now() - 60 * 60 * 1000) }
    ];

    this.transactions.set(1, sampleTransactions);
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getPortfolio(userId: number): Promise<Portfolio | undefined> {
    return this.portfolios.get(userId);
  }

  async updatePortfolio(userId: number, insertPortfolio: InsertPortfolio): Promise<Portfolio> {
    const id = this.currentPortfolioId++;
    const portfolio: Portfolio = { ...insertPortfolio, id };
    this.portfolios.set(userId, portfolio);
    return portfolio;
  }

  async getAllStocks(): Promise<Stock[]> {
    return Array.from(this.stocks.values());
  }

  async getStock(symbol: string): Promise<Stock | undefined> {
    return this.stocks.get(symbol);
  }

  async updateStock(symbol: string, insertStock: InsertStock): Promise<Stock> {
    const existing = this.stocks.get(symbol);
    const id = existing?.id || this.currentStockId++;
    const stock: Stock = { ...insertStock, id };
    this.stocks.set(symbol, stock);
    return stock;
  }

  async getTransactions(userId: number): Promise<Transaction[]> {
    return this.transactions.get(userId) || [];
  }

  async createTransaction(insertTransaction: InsertTransaction): Promise<Transaction> {
    const id = this.currentTransactionId++;
    const transaction: Transaction = { 
      ...insertTransaction, 
      id, 
      timestamp: new Date() 
    };
    
    const userTransactions = this.transactions.get(insertTransaction.userId) || [];
    userTransactions.unshift(transaction);
    this.transactions.set(insertTransaction.userId, userTransactions);
    
    return transaction;
  }
}

export const storage = new MemStorage();
