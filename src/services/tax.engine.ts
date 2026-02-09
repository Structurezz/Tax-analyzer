// src/services/tax.engine.ts
import { LedgerService } from "./ledger.service";

export class TaxEngine {
  constructor(private ledgerService: LedgerService) {}

  computeIncomeTax(rate: number = 0.3) {
    const { income, expense } = this.ledgerService.getLedgerSummary();
    const taxableProfit = Math.max(income - expense, 0);
    const incomeTax = taxableProfit * rate;
    return { taxableProfit, incomeTax };
  }

  computeVAT(vatRate: number = 0.075) {
    const { income } = this.ledgerService.getLedgerSummary();
    const vat = income * vatRate;
    return { vat };
  }

  computeDevelopmentLevy(levyRate: number = 0.01) {
    const { income } = this.ledgerService.getLedgerSummary();
    const levy = income * levyRate;
    return { levy };
  }

  computeAllTaxes() {
    return {
      ...this.computeIncomeTax(),
      ...this.computeVAT(),
      ...this.computeDevelopmentLevy(),
    };
  }
}
