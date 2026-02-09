// src/models/transaction.model.ts
import mongoose, { Schema } from "mongoose";

// Match your interface
const TransactionSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  type: { type: String,  required: true },
  amount: { type: Number, required: true },
  description: { type: String },
  date: { type: Date, default: Date.now },
  deductible: { type: Boolean, default: false },
});

// ✅ Default export
export default mongoose.model("Transaction", TransactionSchema);
