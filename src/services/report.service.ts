import { TaxSummary } from "../models/taxSummary.model";
import { generateTaxPDF } from "../utils/pdf.util";
import { ENV } from "../config/env";

export const saveAIResultToDB = async (userId: string, period: string, aiResult: any) => {
  try {
    // Create MongoDB record
    const taxSummary = await TaxSummary.create({
      userId,
      period,
      incomeTax: aiResult.calculations.incomeTax,
      vat: aiResult.calculations.vat,
      developmentLevy: aiResult.calculations.developmentLevy,
      otherTaxes: aiResult.calculations.otherTaxes,
      legalTaxOptimisation: aiResult.legalTaxOptimisation,
      complianceNotes: aiResult.complianceNotes,
      summary: aiResult.summary
    });

    // Generate PDF
    const pdfPath = `./reports/tax-summary-${userId}-${period}.pdf`;
    generateTaxPDF({ ...taxSummary.toObject() }, pdfPath);

    console.log(`Tax summary saved and PDF generated at ${pdfPath}`);
    return taxSummary;
  } catch (err: any) {
    console.error("Error saving AI result to DB:", err.message || err);
    throw err;
  }
};
