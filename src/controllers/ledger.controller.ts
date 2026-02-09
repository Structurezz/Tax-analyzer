import { Request, Response } from "express";
import { LedgerService } from "../services/ledger.service";

const ledgerService = new LedgerService();

export const addTransaction = (req: Request, res: Response) => {
  try {
    const tx = ledgerService.addTransaction(req.body);
    res.status(201).json(tx);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

export const getTransactions = (_req: Request, res: Response) => {
  res.json(ledgerService.getTransactions());
};

export const getLedgerSummary = (_req: Request, res: Response) => {
  res.json(ledgerService.getLedgerSummary());
};
