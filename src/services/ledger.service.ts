// src/services/ledger.service.ts
import { Transaction } from "../types/ledger.types";

export class LedgerService {
  private transactions: Transaction[] = [];

  addTransaction(tx: Partial<Transaction> & { type: string; amount: number }) {
    if (tx.amount == null || !tx.type) {
      throw new Error("Transaction must include amount and type");
    }

    const rawType = tx.type.toLowerCase().trim();
    let normalizedType: "income" | "expense" = "expense";

    if (
      rawType.includes("sale") ||
      rawType.includes("invoice") ||
      rawType.includes("revenue") ||
      rawType.includes("income") ||
      rawType.includes("service") ||
      rawType.includes("fee") ||
      rawType.includes("payment received") ||
      rawType.includes("client")
    ) {
      normalizedType = "income";
    }

    const transaction: Transaction = {
      ...tx,
      id: tx.id,
      type: normalizedType,
      amount: Math.abs(Number(tx.amount)),
      description: tx.description ?? "",
      date: tx.date || new Date(),
      deductible: tx.deductible ?? true,
    };

    this.transactions.push(transaction);
    return transaction;
  }

  getTransactions(): Transaction[] {
    return this.transactions;
  }

  getLedgerSummary() {
    let income = 0;
    let expense = 0;

    for (const tx of this.transactions) {
      if (tx.type === "income") {
        income += tx.amount;
      }
      if (tx.type === "expense" && tx.deductible !== false) {
        expense += tx.amount;
      }
    }

    return { income, expense };
  }
}