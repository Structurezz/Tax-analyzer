import fs from "fs";
import path from "path";
import { Request, Response } from "express";
import { AIService } from "../services/ai.service.js";
import { LedgerService } from "../services/ledger.service.js";
import { TaxEngine } from "../services/tax.engine.js";
import { saveAIResultToDB } from "../services/report.service.js";

const ledgerService = new LedgerService();
const taxEngine = new TaxEngine(ledgerService);
const aiService = new AIService();

export const explainTax = async (req: Request, res: Response) => {
  const { userId, period, question } = req.body;

  try {
    const taxSummary = taxEngine.getTaxSummary();
    console.log("Tax Summary sent to AI:", taxSummary);
    console.log("User question:", question);

    const aiResult = await aiService.explainTax(taxSummary, question);
    console.log("Raw AI result:", aiResult);

    // Save to DB
    const savedSummary = await saveAIResultToDB(userId, period, aiResult);

    // Ensure reports folder exists
    const reportsDir = path.resolve("./reports");
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }

    // Path for PDF
    const pdfPath = path.join(reportsDir, `tax-summary-${userId}-${period}.pdf`);

    // Generate PDF (example, using fs.writeFileSync for simplicity)
    fs.writeFileSync(pdfPath, "PDF content goes here"); // Replace with actual PDF generation

    res.json({
      message: "Tax summary created successfully",
      taxSummary: savedSummary,
      pdfPath,
    });
  } catch (err: any) {
    console.error("Error in explainTax controller:", err.message || err);
    res.status(500).json({ error: "AI service or DB operation failed", details: err.message });
  }
};
