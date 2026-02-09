// src/types/ledger.types.ts
export interface Transaction {
    id?: string;
    type: string; // ← MUST be string, not "income" | "expense"
    amount: number;
    description?: string;
    date?: Date;
    deductible?: boolean;
  }