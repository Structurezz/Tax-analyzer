import PDFDocument from "pdfkit";
import fs from "fs";

export const generateTaxPDF = (taxData: any, filePath: string) => {
  const doc = new PDFDocument({ margin: 50 });

  doc.pipe(fs.createWriteStream(filePath));

  doc.fontSize(20).text("Smart Tax Engine - Tax Report", { align: "center" });
  doc.moveDown();

  doc.fontSize(12).text(`User ID: ${taxData.userId}`);
  doc.text(`Period: ${taxData.period}`);
  doc.moveDown();

  doc.text("Tax Calculations:", { underline: true });
  doc.text(`Income Tax: ₦${taxData.incomeTax}`);
  doc.text(`VAT: ₦${taxData.vat}`);
  doc.text(`Development Levy: ₦${taxData.developmentLevy}`);
  doc.text(`Other Taxes: ₦${taxData.otherTaxes}`);
  doc.moveDown();

  doc.text("Legal Tax Optimisation Strategies:", { underline: true });
  taxData.legalTaxOptimisation.forEach((str: string, idx: number) => {
    doc.text(`${idx + 1}. ${str}`);
  });
  doc.moveDown();

  doc.text("Compliance Notes:", { underline: true });
  doc.text(taxData.complianceNotes);
  doc.moveDown();

  doc.text("Summary:", { underline: true });
  doc.text(taxData.summary);

  doc.end();
};
