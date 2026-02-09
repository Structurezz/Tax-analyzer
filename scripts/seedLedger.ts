// scripts/seedRealisticLedger.ts
import mongoose, { Types } from "mongoose";
import Transaction from "../src/models/transaction.model.js";
import dotenv from "dotenv";

dotenv.config();

const USER_ID = new Types.ObjectId("695cca202c0bc0be99d52479");
const TRANSACTIONS_PER_QUARTER = 100;
const YEARS = [2024, 2025, 2026];

const INCOME_TYPES = [
  "sale",
  "invoice",
  "revenue",
  "service income",
  "product sale",
  "consulting fee",
  "payment received",
  "client payment",
];

const EXPENSE_TYPES = [
  "purchase",
  "salary",
  "rent",
  "utility",
  "transport",
  "marketing",
  "office supplies",
  "software subscription",
  "internet bill",
  "maintenance",
];

function randomChoice<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// 85% income — guarantees strong profit in every quarter/year
function randomType(): string {
  return Math.random() < 0.85 ? randomChoice(INCOME_TYPES) : randomChoice(EXPENSE_TYPES);
}

// Much higher income amounts to ensure profit
function randomAmount(type: string): number {
  const isIncome = INCOME_TYPES.some(t => type.toLowerCase().includes(t.toLowerCase()));
  if (isIncome) {
    // Income: ₦500,000 – ₦5,000,000 (average ~₦2.75M)
    return Math.floor(Math.random() * (5000000 - 500000 + 1)) + 500000;
  } else {
    // Expenses: ₦50,000 – ₦800,000 (average ~₦425k)
    return Math.floor(Math.random() * (800000 - 50000 + 1)) + 50000;
  }
}

function randomDescription(type: string, index: number): string {
  return `${type.charAt(0).toUpperCase() + type.slice(1)} transaction #${index + 1}`;
}

function randomDateInQuarter(year: number, quarter: number): Date {
  const monthStarts = [0, 3, 6, 9]; // Jan, Apr, Jul, Oct
  const startMonth = monthStarts[quarter - 1];
  const start = new Date(year, startMonth, 1);
  const end = new Date(year, startMonth + 3, 0); // last day of quarter
  const randomTime = start.getTime() + Math.random() * (end.getTime() - start.getTime());
  return new Date(randomTime);
}

async function seedGuaranteedProfitTransactions() {
  try {
    await mongoose.connect(process.env.MONGODB_URI!);
    console.log("Connected to MongoDB");

    // Clear all old data
    const deleteResult = await Transaction.deleteMany({ userId: USER_ID });
    console.log(`Deleted ${deleteResult.deletedCount} old transactions`);

    const transactions: any[] = [];
    let index = 0;

    for (const year of YEARS) {
      for (let q = 1; q <= 4; q++) {
        for (let i = 0; i < TRANSACTIONS_PER_QUARTER; i++) {
          const type = randomType();
          transactions.push({
            userId: USER_ID,
            type,
            amount: randomAmount(type),
            description: randomDescription(type, index++),
            date: randomDateInQuarter(year, q),
            deductible: true, // All expenses deductible
          });
        }
      }
    }

    await Transaction.insertMany(transactions);
    console.log(`Seeded ${transactions.length} transactions across 2024–2026`);
    console.log("   → 400 transactions per year (100 per quarter)");
    console.log("   → 85% income transactions");
    console.log("   → Income: ₦500k–₦5M | Expenses: ₦50k–₦800k");
    console.log("   → GUARANTEED positive taxable profit in EVERY period");

    // Verify distribution
    for (const year of YEARS) {
      const count = await Transaction.countDocuments({
        userId: USER_ID,
        date: { $gte: new Date(year, 0, 1), $lt: new Date(year + 1, 0, 1) },
      });
      console.log(`   ${year}: ${count} transactions`);
    }

    await mongoose.disconnect();
    console.log("\nSEED COMPLETE — ALL PERIODS NOW PROFITABLE!");
    console.log("\nTest any of these — you WILL see real tax owed:");
    console.log("   → \"2024\"");
    console.log("   → \"2025\"");
    console.log("   → \"2026-Q1\"");
    console.log("   → \"2024-Q2\", \"2025-Q4\", etc.");
    console.log("\nExpected per quarter: ~₦150–250 million revenue → ~₦100–200 million taxable profit");
    console.log("Expected per year: ~₦600–900 million taxable profit → ₦180–270 million CIT + VAT");

  } catch (err) {
    console.error("Seeding failed:", err);
    process.exit(1);
  }
}

seedGuaranteedProfitTransactions();