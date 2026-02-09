import { Router } from "express";
import { addTransaction, getTransactions, getLedgerSummary } from "../controllers/ledger.controller.js";

const router = Router();
router.post("/", addTransaction);
router.get("/", getTransactions);
router.get("/summary", getLedgerSummary);

export default router;
