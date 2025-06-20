/**
 * Value object for stock symbols with validation
 */
export class StockSymbol {
  private readonly _symbol: string;

  constructor(symbol: string) {
    if (!symbol || typeof symbol !== 'string') {
      throw new Error('Stock symbol must be a non-empty string');
    }
    
    const cleanSymbol = symbol.trim().toUpperCase();
    
    if (cleanSymbol.length < 1 || cleanSymbol.length > 5) {
      throw new Error('Stock symbol must be between 1 and 5 characters');
    }
    
    if (!/^[A-Z]+$/.test(cleanSymbol)) {
      throw new Error('Stock symbol must contain only letters');
    }
    
    this._symbol = cleanSymbol;
  }

  get value(): string {
    return this._symbol;
  }

  equals(other: StockSymbol): boolean {
    return this._symbol === other._symbol;
  }

  toString(): string {
    return this._symbol;
  }

  static isValid(symbol: string): boolean {
    try {
      new StockSymbol(symbol);
      return true;
    } catch {
      return false;
    }
  }
}
