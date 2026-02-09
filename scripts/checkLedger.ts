// scripts/checkLedger.ts
import mongoose from "mongoose";
import Transaction from "../src/models/transaction.model.js"; // default export
import { LedgerService } from "../src/services/ledger.service.js";
import { TaxEngine } from "../src/services/tax.engine.js";
import dotenv from "dotenv";
dotenv.config();

const USER_ID = "695cca202c0bc0be99d52479"; // same fixed ID used in seeding

async function checkLedgerSummary() {
  try {
    await mongoose.connect(process.env.MONGODB_URI!);
    console.log("✅ Connected to MongoDB");

    const ledgerService = new LedgerService();

    // Fetch all transactions for the user
    const transactions = await Transaction.find({ userId: USER_ID });
    console.log("Total transactions fetched:", transactions.length);

    transactions.forEach(tx => {
      ledgerService.addTransaction({
        id: tx._id.toString(),
        type: tx.type,
        amount: Number(tx.amount),
        description: tx.description,
        date: tx.date,
        deductible: tx.deductible,
      });
    });

    const summary = ledgerService.getLedgerSummary();
    console.log("Ledger Summary:", summary);

    const taxEngine = new TaxEngine(ledgerService);
    const taxSummary = taxEngine.getTaxSummary();
    console.log("Computed Tax Summary:", taxSummary);

    await mongoose.disconnect();
    console.log("✅ Disconnected from MongoDB");
  } catch (err) {
    console.error("❌ Error checking ledger:", err);
  }
}

checkLedgerSummary();
