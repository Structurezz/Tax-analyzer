import mongoose, { Schema, Document } from "mongoose";

export interface ITaxSummary extends Document {
  userId: string;
  period: string;  // e.g., "2026-Q1"
  incomeTax: number;
  vat: number;
  developmentLevy: number;
  otherTaxes: number;
  legalTaxOptimisation: string[];
  complianceNotes: string;
  summary: string;
  createdAt: Date;
}

const TaxSummarySchema = new Schema<ITaxSummary>({
  userId: { type: String, required: true },
  period: { type: String, required: true },
  incomeTax: { type: Number, required: true },
  vat: { type: Number, required: true },
  developmentLevy: { type: Number, required: true },
  otherTaxes: { type: Number, required: true },
  legalTaxOptimisation: [{ type: String }],
  complianceNotes: { type: String },
  summary: { type: String },
  createdAt: { type: Date, default: Date.now }
});

export const TaxSummary = mongoose.model<ITaxSummary>("TaxSummary", TaxSummarySchema);
