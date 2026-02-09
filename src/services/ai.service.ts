// src/services/ai.service.ts
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { ENV } from "../config/env";

dotenv.config();

const genAI = new GoogleGenerativeAI(ENV.GEMINI_API_KEY || "");

export class AIService {
  async explainTax(data: any, question: string): Promise<any> {
    if (!ENV.GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is not set in env.ts");
    }

    const prompt = `
You are a professional Nigerian tax advisor. Your response must be ONLY valid JSON — no markdown, no code blocks, no extra text.

FINANCIAL DATA:
- Revenue (Income): ₦${(data.totalIncome || 0).toLocaleString()}
- Deductible Expenses: ₦${(data.totalExpense || 0).toLocaleString()}
- Taxable Profit: ₦${(data.taxSummary?.taxableProfit || 0).toLocaleString()}
- Income Tax (30% CIT): ₦${(data.taxSummary?.incomeTax || 0).toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 0})}
- VAT (7.5% on revenue): ₦${(data.taxSummary?.vat || 0).toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 0})}
- Development Levy (1% on revenue): ₦${(data.taxSummary?.levy || 0).toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 0})}

USER QUESTION: ${question}

TASK:
1. Write a clear summary of the total tax liability.
2. Present the pre-calculated taxes as-is.
3. Give 4 specific, legal tax reduction strategies.
4. Include key compliance deadlines.

RESPONSE FORMAT — RETURN ONLY THIS JSON:

{
  "summary": "Professional summary of tax liability in Naira, including total amount.",
  "calculations": {
    "incomeTax": ${(data.taxSummary?.incomeTax || 0).toFixed(0)},
    "vat": ${(data.taxSummary?.vat || 0).toFixed(0)},
    "developmentLevy": ${(data.taxSummary?.levy || 0).toFixed(0)},
    "otherTaxes": 0
  },
  "legalTaxOptimisation": [
    "Strategy 1: brief explanation",
    "Strategy 2: brief explanation",
    "Strategy 3: brief explanation",
    "Strategy 4: brief explanation"
  ],
  "complianceNotes": "Clear list of filing deadlines and record-keeping rules."
}

Do not add any text before or after the JSON. Do not use code blocks. Do not explain.
`;

    let resultText = "";

    try {
      const model = genAI.getGenerativeModel({
        model: "gemini-2.5-pro", // Kept exactly as you wanted
        generationConfig: {
          temperature: 0.2,
          topP: 0.95,
          maxOutputTokens: 2048,
        },
      });

      const result = await model.generateContent(prompt);
      const response = await result.response;
      resultText = response.text().trim();

      if (!resultText) {
        throw new Error("AI returned an empty response.");
      }

      // Cleanup any markdown or broken formatting
      let cleaned = resultText
        .replace(/```json/gi, "")
        .replace(/```/g, "")
        .replace(/,\s*}/g, "}")
        .replace(/,\s*]/g, "]")
        .trim();

      // Extract JSON block
      const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        cleaned = jsonMatch[0];
      }

      const parsed = JSON.parse(cleaned);

      // Ensure correct field names for DB save
      parsed.calculations = parsed.calculations || {};
      parsed.calculations.otherTaxes = parsed.calculations.otherTaxes || 0;

      return parsed;

    } catch (err: any) {
      console.error("AIService Error:", {
        message: err.message,
        rawResponse: resultText.substring(0, 500),
      });

      // Perfect fallback with correct field names
      return {
        summary: `Your business generated revenue of ₦${(data.totalIncome || 0).toLocaleString()} with deductible expenses of ₦${(data.totalExpense || 0).toLocaleString()}, resulting in a taxable profit of ₦${(data.taxSummary?.taxableProfit || 0).toLocaleString()}. Total estimated tax liability is ₦${Math.round((data.taxSummary?.incomeTax || 0) + (data.taxSummary?.vat || 0) + (data.taxSummary?.levy || 0)).toLocaleString()}.`,
        calculations: {
          incomeTax: Math.round(data.taxSummary?.incomeTax || 0),
          vat: Math.round(data.taxSummary?.vat || 0),
          developmentLevy: Math.round(data.taxSummary?.levy || 0),
          otherTaxes: 0,
        },
        legalTaxOptimisation: [
          "Maximize WENR deductions on all qualifying business expenses (salaries, rent, marketing, utilities).",
          "Claim full capital allowances (initial + annual) on assets like vehicles, machinery, and equipment.",
          "Carry forward any tax losses indefinitely to offset future profits.",
          "Apply for Pioneer Status or industry incentives if in manufacturing, agriculture, or tech."
        ],
        complianceNotes: "File CIT return within 6 months of year-end. Submit VAT monthly by 21st. Keep records for 6 years."
      };
    }
  }
}