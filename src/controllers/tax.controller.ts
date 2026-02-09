// src/controllers/tax.controller.ts

import fs from "fs";
import path from "path";
import { Request, Response } from "express";
import mongoose from "mongoose";
import { LedgerService } from "../services/ledger.service.js";
import { TaxEngine } from "../services/tax.engine.js";
import { AIService } from "../services/ai.service.js";
import Transaction from "../models/transaction.model.js";
import { saveAIResultToDB } from "../services/report.service.js";
import { getPeriodRange } from "../utils/period.js";

const aiService = new AIService();

export const explainTax = async (req: Request, res: Response) => {
  const { userId, period, question } = req.body;

  try {
    // --- Input validation ---
    if (!userId || !period || !question) {
      return res.status(400).json({
        error: "userId, period, and question are required",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        error: "Invalid userId. Must be a valid ObjectId.",
      });
    }

    // --- Convert period string to start/end dates ---
    const { startDate, endDate } = getPeriodRange(period);

    // --- Fetch transactions for this user and period ---
    const transactions = await Transaction.find({
      userId: new mongoose.Types.ObjectId(userId),
      date: { $gte: startDate, $lte: endDate },
    }).lean();

    console.log("Fetched transactions:", transactions.length);

    // --- CRITICAL: Fail early if no transactions ---
    if (transactions.length === 0) {
      return res.status(404).json({
        error: "No transactions found for the selected period",
        details: `No financial activity recorded for user ${userId} in period ${period} (${startDate.toISOString().split('T')[0]} to ${endDate.toISOString().split('T')[0]})`,
        suggestion: "Please select a different period or add transactions first.",
      });
    }

    // Log first 5 raw transactions from DB
    console.log("First 5 raw transactions from DB:");
    transactions.slice(0, 5).forEach(tx =>
      console.log(
        tx._id.toString(),
        `rawType="${tx.type}"`,
        tx.amount,
        tx.date?.toISOString().split('T')[0]
      )
    );

    // --- Initialize LedgerService and add transactions ---
    const ledgerService = new LedgerService();

    transactions.forEach(tx => {
      ledgerService.addTransaction({
        id: tx._id.toString(),
        type: tx.type,
        amount: (tx.amount as any) instanceof mongoose.Types.Decimal128
        ? parseFloat(tx.amount.toString())
        : Number(tx.amount),
      
        description: tx.description ?? "",
        date: tx.date ? new Date(tx.date) : new Date(),
        deductible: tx.deductible ?? false,
      });
    });
    

    // === FINAL LEDGER STATE DEBUG ===
    console.log("\n=== FINAL LEDGER STATE ===");
    console.log("Total transactions added to ledger:", ledgerService.getTransactions().length);

    const { income, expense } = ledgerService.getLedgerSummary();
    console.log("TOTAL INCOME:", income);
    console.log("TOTAL EXPENSE:", expense);
    console.log("NET PROFIT:", income - expense);

    console.log("\nSample normalized transactions:");
    ledgerService.getTransactions().slice(0, 10).forEach((tx, i) => {
      console.log(`${i}: type="${tx.type}" amount=${tx.amount} deductible=${tx.deductible}`);
    });

    console.log("\nIncome transaction count:", ledgerService.getTransactions().filter(t => t.type === "income").length);
    console.log("Expense transaction count:", ledgerService.getTransactions().filter(t => t.type === "expense").length);
    console.log("=== END LEDGER DEBUG ===\n");

    // --- Compute tax summary ---
    const taxEngine = new TaxEngine(ledgerService);
    const taxSummary = taxEngine.getTaxSummary();

    console.log("Tax Summary sent to AI:", taxSummary);
    console.log("User question:", question);

    // --- Get AI explanation ---
    const ledgerData = {
        taxSummary,
        totalIncome: ledgerService.getLedgerSummary().income,
        totalExpense: ledgerService.getLedgerSummary().expense,
        transactionCount: ledgerService.getTransactions().length,
        sampleTransactions: ledgerService.getTransactions().slice(0, 20).map(tx => ({
          type: tx.type,
          amount: tx.amount,
          description: tx.description,
          date: tx.date ? tx.date.toISOString().split('T')[0] : "N/A",
          deductible: tx.deductible,
        })),
      };
      
      const aiResult = await aiService.explainTax(ledgerData, question);    console.log("Raw AI result:", aiResult);

    // --- Save AI result to DB ---
    const savedSummary = await saveAIResultToDB(userId, period, aiResult);

    // --- Generate report file ---
    const reportsDir = path.resolve("./reports");
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }

    const reportPath = path.join(reportsDir, `tax-summary-${userId}-${period}.json`);
    fs.writeFileSync(reportPath, JSON.stringify(savedSummary, null, 2), "utf-8");

    return res.json({
      message: "Tax explanation generated successfully",
      explanation: savedSummary,
      reportPath,
    });
  } catch (err: any) {
    console.error("Error in explainTax controller:", err);
    return res.status(500).json({
      error: "Failed to generate tax explanation",
      details: err.message || String(err),
    });
  }
};