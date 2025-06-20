/**
 * Value object for handling percentage values with type safety
 */
export class Percentage {
  private readonly _value: number;

  constructor(value: number) {
    if (!Number.isFinite(value)) {
      throw new Error('Percentage value must be a finite number');
    }
    this._value = Math.round(value * 100) / 100; // Round to 2 decimal places
  }

  get value(): number {
    return this._value;
  }

  get decimal(): number {
    return this._value / 100;
  }

  add(other: Percentage): Percentage {
    return new Percentage(this._value + other._value);
  }

  subtract(other: Percentage): Percentage {
    return new Percentage(this._value - other._value);
  }

  multiply(factor: number): Percentage {
    return new Percentage(this._value * factor);
  }

  divide(divisor: number): Percentage {
    if (divisor === 0) {
      throw new Error('Cannot divide by zero');
    }
    return new Percentage(this._value / divisor);
  }

  isPositive(): boolean {
    return this._value > 0;
  }

  isNegative(): boolean {
    return this._value < 0;
  }

  isZero(): boolean {
    return this._value === 0;
  }

  abs(): Percentage {
    return new Percentage(Math.abs(this._value));
  }

  toFormattedString(decimalPlaces: number = 2): string {
    return `${this._value.toFixed(decimalPlaces)}%`;
  }

  toSignedString(decimalPlaces: number = 2): string {
    const sign = this._value >= 0 ? '+' : '';
    return `${sign}${this._value.toFixed(decimalPlaces)}%`;
  }

  static fromDecimal(decimal: number): Percentage {
    return new Percentage(decimal * 100);
  }

  static fromString(value: string): Percentage {
    const numericValue = parseFloat(value.replace('%', ''));
    if (isNaN(numericValue)) {
      throw new Error(`Invalid percentage string: ${value}`);
    }
    return new Percentage(numericValue);
  }

  static zero(): Percentage {
    return new Percentage(0);
  }
}
