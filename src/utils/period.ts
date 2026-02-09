// src/utils/period.ts
export function getPeriodRange(period: string): { startDate: Date; endDate: Date } {
    const currentYear = new Date().getFullYear(); // 2026
    let year: number;
    let quarter: number | null = null;
  
    // Handle full year: "2025", "2024"
    if (/^\d{4}$/.test(period)) {
      year = parseInt(period, 10);
    } 
    // Handle quarter: "2025-Q1", "2026-Q4"
    else if (/^\d{4}-Q[1-4]$/i.test(period)) {
      const match = period.match(/^(\d{4})-Q([1-4])$/i);
      if (!match) throw new Error("Invalid period format");
      year = parseInt(match[1], 10);
      quarter = parseInt(match[2], 10);
    } 
    else {
      throw new Error("Invalid period format. Use 'YYYY' or 'YYYY-Q#'");
    }
  
    let start: Date;
    let end: Date;
  
    if (quarter) {
      const startMonth = (quarter - 1) * 3; // Q1 = 0, Q2 = 3, etc.
      start = new Date(year, startMonth, 1);
      end = new Date(year, startMonth + 3, 0, 23, 59, 59, 999); // last day of quarter
    } else {
      // Full year
      start = new Date(year, 0, 1);
      end = new Date(year, 11, 31, 23, 59, 59, 999);
    }
  
    // Validate dates
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      throw new Error(`Invalid date generated for period "${period}"`);
    }
  
    return { startDate: start, endDate: end };
  }