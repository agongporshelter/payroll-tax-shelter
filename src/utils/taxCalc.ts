import { PTKPStatus, JKKRiskClass, Employee, SalaryMaster, AttendanceOT, VariableInput, CustomComponent } from '../types';

// TER Bulanan Kategori A (TK/0, TK/1, K/0)
const TER_A_BRACKETS = [
  { min: 0, max: 5400000, rate: 0 },
  { min: 5400000, max: 5650000, rate: 0.0025 },
  { min: 5650000, max: 5950000, rate: 0.0050 },
  { min: 5950000, max: 6300000, rate: 0.0075 },
  { min: 6300000, max: 6750000, rate: 0.0100 },
  { min: 6750000, max: 7500000, rate: 0.0125 },
  { min: 7500000, max: 8550000, rate: 0.0150 },
  { min: 8550000, max: 9650000, rate: 0.0175 },
  { min: 9650000, max: 10950000, rate: 0.0200 },
  { min: 10950000, max: 12500000, rate: 0.0225 },
  { min: 12500000, max: 14350000, rate: 0.0250 },
  { min: 14350000, max: 16000000, rate: 0.0300 },
  { min: 16000000, max: 17850000, rate: 0.0400 },
  { min: 17850000, max: 19850000, rate: 0.0500 },
  { min: 19850000, max: 22000000, rate: 0.0600 },
  { min: 22000000, max: 24300000, rate: 0.0700 },
  { min: 24300000, max: 26900000, rate: 0.0800 },
  { min: 26900000, max: 29900000, rate: 0.0900 },
  { min: 29900000, max: 33500000, rate: 0.1000 },
  { min: 33500000, max: 38000000, rate: 0.1100 },
  { min: 38000000, max: 43400000, rate: 0.1200 },
  { min: 43400000, max: 49900000, rate: 0.1300 },
  { min: 49900000, max: 58100000, rate: 0.1400 },
  { min: 58100000, max: 68900000, rate: 0.1500 },
  { min: 68900000, max: 8300000, rate: 0.1600 }, // Typo fix: 83,000,000
  { min: 8300000, max: 100000000, rate: 0.1700 }, // Wait, let's keep exact numbers
  { min: 100000000, max: 120000000, rate: 0.1800 },
  { min: 120000000, max: 144000000, rate: 0.1900 },
  { min: 144000000, max: 173000000, rate: 0.2000 },
  { min: 173000000, max: 210000000, rate: 0.2100 },
  { min: 210000000, max: 259000000, rate: 0.2200 },
  { min: 259000000, max: 325000000, rate: 0.2300 },
  { min: 325000000, max: 415000000, rate: 0.2400 },
  { min: 415000000, max: 540000000, rate: 0.2500 },
  { min: 540000000, max: 707000000, rate: 0.2600 },
  { min: 707000000, max: 937000000, rate: 0.2700 },
  { min: 937000000, max: 1250000000, rate: 0.2800 },
  { min: 1250000000, max: 1400000000, rate: 0.3100 },
  { min: 1400000000, max: Infinity, rate: 0.3400 }
];

// Let's refine the ranges for Category A to avoid gaps or typos:
export const TER_A = [
  { min: 0, max: 5400000, rate: 0 },
  { min: 5400000, max: 5650000, rate: 0.0025 },
  { min: 5650000, max: 5950000, rate: 0.005 },
  { min: 5950000, max: 6300000, rate: 0.0075 },
  { min: 6300000, max: 6750000, rate: 0.01 },
  { min: 6750000, max: 7500000, rate: 0.0125 },
  { min: 7500000, max: 8550000, rate: 0.015 },
  { min: 8550000, max: 9650000, rate: 0.0175 },
  { min: 9650000, max: 10950000, rate: 0.02 },
  { min: 10950000, max: 12500000, rate: 0.0225 },
  { min: 12500000, max: 14350000, rate: 0.025 },
  { min: 14350000, max: 16000000, rate: 0.03 },
  { min: 16000000, max: 17850000, rate: 0.04 },
  { min: 17850000, max: 19850000, rate: 0.05 },
  { min: 19850000, max: 22000000, rate: 0.06 },
  { min: 22000000, max: 24300000, rate: 0.07 },
  { min: 24300000, max: 26900000, rate: 0.08 },
  { min: 26900000, max: 29900000, rate: 0.09 },
  { min: 29900000, max: 33500000, rate: 0.10 },
  { min: 33500000, max: 38000000, rate: 0.11 },
  { min: 38000000, max: 43400000, rate: 0.12 },
  { min: 43400000, max: 49900000, rate: 0.13 },
  { min: 49900000, max: 58100000, rate: 0.14 },
  { min: 58100000, max: 68900000, rate: 0.15 },
  { min: 68900000, max: 83000000, rate: 0.16 },
  { min: 83000000, max: 100000000, rate: 0.17 },
  { min: 100000000, max: 120000000, rate: 0.18 },
  { min: 120000000, max: 144000000, rate: 0.19 },
  { min: 144000000, max: 173000000, rate: 0.20 },
  { min: 173000000, max: 210000000, rate: 0.21 },
  { min: 210000000, max: 259000000, rate: 0.22 },
  { min: 259000000, max: 325000000, rate: 0.23 },
  { min: 325000000, max: 415000000, rate: 0.24 },
  { min: 415000000, max: 540000000, rate: 0.25 },
  { min: 540000000, max: 707000000, rate: 0.26 },
  { min: 707000000, max: 937000000, rate: 0.27 },
  { min: 937000000, max: 1250000000, rate: 0.28 },
  { min: 1250000000, max: 1400000000, rate: 0.31 },
  { min: 1400000000, max: Infinity, rate: 0.34 }
];

// TER Bulanan Kategori B (TK/2, TK/3, K/1, K/2)
export const TER_B = [
  { min: 0, max: 6200000, rate: 0 },
  { min: 6200000, max: 6500000, rate: 0.0025 },
  { min: 6500000, max: 6850000, rate: 0.005 },
  { min: 6850000, max: 7300000, rate: 0.0075 },
  { min: 7300000, max: 7850000, rate: 0.01 },
  { min: 7850000, max: 8750000, rate: 0.0125 },
  { min: 8750000, max: 9900000, rate: 0.015 },
  { min: 9900000, max: 11200000, rate: 0.0175 },
  { min: 11200000, max: 12800000, rate: 0.02 },
  { min: 12800000, max: 14600000, rate: 0.0225 },
  { min: 14600000, max: 16700000, rate: 0.025 },
  { min: 16700000, max: 18550000, rate: 0.03 },
  { min: 18550000, max: 20500000, rate: 0.04 },
  { min: 20500000, max: 22700000, rate: 0.05 },
  { min: 22700000, max: 25100000, rate: 0.06 },
  { min: 25100000, max: 27800000, rate: 0.07 },
  { min: 27800000, max: 30700000, rate: 0.08 },
  { min: 30700000, max: 33900000, rate: 0.09 },
  { min: 33900000, max: 38000000, rate: 0.10 },
  { min: 38000000, max: 43100000, rate: 0.11 },
  { min: 43100000, max: 49200000, rate: 0.12 },
  { min: 49200000, max: 55800000, rate: 0.13 },
  { min: 55800000, max: 65000000, rate: 0.14 },
  { min: 65000000, max: 77000000, rate: 0.15 },
  { min: 77000000, max: 93000000, rate: 0.16 },
  { min: 93000000, max: 112000000, rate: 0.17 },
  { min: 112000000, max: 134000000, rate: 0.18 },
  { min: 134000000, max: 161000000, rate: 0.19 },
  { min: 161000000, max: 193000000, rate: 0.20 },
  { min: 193000000, max: 232000000, rate: 0.21 },
  { min: 232000000, max: 286000000, rate: 0.22 },
  { min: 286000000, max: 358000000, rate: 0.23 },
  { min: 358000000, max: 458000000, rate: 0.24 },
  { min: 458000000, max: 595000000, rate: 0.25 },
  { min: 595000000, max: 779000000, rate: 0.26 },
  { min: 779000000, max: 1000000000, rate: 0.27 },
  { min: 1000000000, max: 1400000000, rate: 0.31 },
  { min: 1400000000, max: Infinity, rate: 0.34 }
];

// TER Bulanan Kategori C (K/3)
export const TER_C = [
  { min: 0, max: 6600000, rate: 0 },
  { min: 6600000, max: 6950000, rate: 0.0025 },
  { min: 6950000, max: 7350000, rate: 0.005 },
  { min: 7350000, max: 7800000, rate: 0.0075 },
  { min: 7800000, max: 8350000, rate: 0.01 },
  { min: 8350000, max: 9050000, rate: 0.0125 },
  { min: 9050000, max: 9850000, rate: 0.015 },
  { min: 9850000, max: 10750000, rate: 0.0175 },
  { min: 10750000, max: 11800000, rate: 0.02 },
  { min: 11800000, max: 13050000, rate: 0.0225 },
  { min: 13050000, max: 14550000, rate: 0.025 },
  { min: 14550000, max: 16100000, rate: 0.03 },
  { min: 16100000, max: 17700000, rate: 0.04 },
  { min: 17700000, max: 19500000, rate: 0.05 },
  { min: 19500000, max: 21400000, rate: 0.06 },
  { min: 21400000, max: 23500000, rate: 0.07 },
  { min: 23500000, max: 25800000, rate: 0.08 },
  { min: 25800000, max: 28300000, rate: 0.09 },
  { min: 28300000, max: 31100000, rate: 0.10 },
  { min: 31100000, max: 34400000, rate: 0.11 },
  { min: 34400000, max: 38200000, rate: 0.12 },
  { min: 38200000, max: 42700000, rate: 0.13 },
  { min: 42700000, max: 48100000, rate: 0.14 },
  { min: 48100000, max: 55100000, rate: 0.15 },
  { min: 55100000, max: 64600000, rate: 0.16 },
  { min: 64600000, max: 77500000, rate: 0.17 },
  { min: 77500000, max: 92900000, rate: 0.18 },
  { min: 92900000, max: 111400000, rate: 0.19 },
  { min: 111400000, max: 133700000, rate: 0.20 },
  { min: 133700000, max: 160500000, rate: 0.21 },
  { min: 160500000, max: 192600000, rate: 0.22 },
  { min: 192600000, max: 231100000, rate: 0.23 },
  { min: 231100000, max: 277300000, rate: 0.24 },
  { min: 277300000, max: 332800000, rate: 0.25 },
  { min: 332800000, max: 416000000, rate: 0.26 },
  { min: 416000000, max: 520000000, rate: 0.27 },
  { min: 520000000, max: 650000000, rate: 0.28 },
  { min: 650000000, max: 1000000000, rate: 0.31 },
  { min: 1000000000, max: Infinity, rate: 0.34 }
];

export function getTERCategory(status: PTKPStatus): 'A' | 'B' | 'C' {
  if (['TK/0', 'TK/1', 'K/0'].includes(status)) {
    return 'A';
  }
  if (['TK/2', 'TK/3', 'K/1', 'K/2'].includes(status)) {
    return 'B';
  }
  return 'C'; // K/3 and others if applicable
}

export function getTERRate(category: 'A' | 'B' | 'C', grossIncome: number): number {
  const brackets = category === 'A' ? TER_A : category === 'B' ? TER_B : TER_C;
  for (const b of brackets) {
    if (grossIncome > b.min && grossIncome <= b.max) {
      return b.rate;
    }
  }
  return 0;
}

export function getJKKRate(jkkClass: JKKRiskClass): number {
  if (jkkClass.includes('0.24%')) return 0.0024;
  if (jkkClass.includes('0.54%')) return 0.0054;
  if (jkkClass.includes('0.89%')) return 0.0089;
  if (jkkClass.includes('1.27%')) return 0.0127;
  if (jkkClass.includes('1.74%')) return 0.0174;
  return 0.0024;
}

export function getPTKPValue(status: PTKPStatus): number {
  const values: Record<PTKPStatus, number> = {
    'TK/0': 54000000,
    'TK/1': 58500000,
    'TK/2': 63000000,
    'TK/3': 67500000,
    'K/0': 58500000,
    'K/1': 63000000,
    'K/2': 67500000,
    'K/3': 72000000
  };
  return values[status] || 54000000;
}

// BPJS Calculation detail function
export function calculateBPJS(
  bpjsSalary: number,
  active: boolean,
  jkkRate: number,
  healthCeiling: number = 12000000,
  jpCeiling: number = 10400000
) {
  if (!active) {
    return {
      kesehatanEmployer: 0,
      kesehatanEmployee: 0,
      jhtEmployer: 0,
      jhtEmployee: 0,
      jpEmployer: 0,
      jpEmployee: 0,
      jkkEmployer: 0,
      jkmEmployer: 0,
      totalEmployer: 0,
      totalEmployee: 0,
    };
  }

  // Base for JP and Kesehatan are subject to ceilings
  const healthSalaryBase = Math.min(bpjsSalary, healthCeiling);
  const jpSalaryBase = Math.min(bpjsSalary, jpCeiling);

  const kesehatanEmployer = healthSalaryBase * 0.04;
  const kesehatanEmployee = healthSalaryBase * 0.01;

  const jhtEmployer = bpjsSalary * 0.037;
  const jhtEmployee = bpjsSalary * 0.02;

  const jpEmployer = jpSalaryBase * 0.02;
  const jpEmployee = jpSalaryBase * 0.01;

  const jkkEmployer = bpjsSalary * jkkRate;
  const jkmEmployer = bpjsSalary * 0.003;

  return {
    kesehatanEmployer,
    kesehatanEmployee,
    jhtEmployer,
    jhtEmployee,
    jpEmployer,
    jpEmployee,
    jkkEmployer,
    jkmEmployer,
    totalEmployer: kesehatanEmployer + jhtEmployer + jpEmployer + jkkEmployer + jkmEmployer,
    totalEmployee: kesehatanEmployee + jhtEmployee + jpEmployee,
  };
}

// OT Pay calculation
export function calculateOTPay(salaryBase: number, otHours: number): number {
  if (otHours <= 0) return 0;
  
  const hourlyRate = salaryBase / 173;
  
  // Standard Indonesian OT multiplier rule: 1.5x for 1st hour, 2.0x for subsequent hours
  let totalOTMultiplier = 0;
  if (otHours <= 1) {
    totalOTMultiplier = otHours * 1.5;
  } else {
    totalOTMultiplier = 1.5 + (otHours - 1) * 2.0;
  }
  
  return hourlyRate * totalOTMultiplier;
}

// Calculate Article 17 Progressive Tax
export function calculateArticle17Tax(pkp: number): number {
  if (pkp <= 0) return 0;
  
  const brackets = [
    { limit: 60000000, rate: 0.05 },
    { limit: 250000000, rate: 0.15 },
    { limit: 500000000, rate: 0.25 },
    { limit: 5000000000, rate: 0.30 },
    { limit: Infinity, rate: 0.35 }
  ];

  let remaining = pkp;
  let tax = 0;
  let previousLimit = 0;

  for (const b of brackets) {
    const width = b.limit - previousLimit;
    if (remaining > width) {
      tax += width * b.rate;
      remaining -= width;
      previousLimit = b.limit;
    } else {
      tax += remaining * b.rate;
      break;
    }
  }

  return tax;
}

// Single month payroll logic
export function calculateMonthlyPayroll(
  employee: Employee,
  salary: SalaryMaster,
  attendance: AttendanceOT,
  variables: VariableInput,
  healthCeiling: number = 12000000,
  jpCeiling: number = 10400000,
  unpaidLeaveDayValue: number = 0, // If 0, defaults to basic / 30 or UMR / 30
  customComponents: CustomComponent[] = []
) {
  const baseSalary = salary.basicSalary;
  const fixedAllowance = salary.fixedAllowance;
  const variableAllowance = salary.variableAllowance;

  // Monthly normal salary components
  const normalSalaryBase = baseSalary + fixedAllowance;

  // Unpaid leave deduction
  const dailyRate = unpaidLeaveDayValue > 0 ? unpaidLeaveDayValue : baseSalary / 25;
  const unpaidLeaveDeduction = attendance.unpaidLeaveDays * dailyRate;

  // Overtime pay
  const otPay = calculateOTPay(normalSalaryBase, attendance.otHours);

  // Variable components and Custom components calculations
  let bonus = 0;
  let incentive = 0;
  let loanDeduction = 0;
  let otherDeduction = 0;

  let customEarningsSum = 0;
  let customDeductionsSum = 0;
  const customBreakdown: Record<string, number> = {};

  for (const comp of customComponents) {
    let val = 0;
    if (variables.customValues && comp.id in variables.customValues) {
      val = variables.customValues[comp.id];
    } else {
      // Fallback to legacy fields for backwards compatibility
      if (comp.id === 'comp_bonus') val = variables.bonus;
      else if (comp.id === 'comp_incentive') val = variables.incentive;
      else if (comp.id === 'comp_loan') val = variables.loanDeduction;
      else if (comp.id === 'comp_other') val = variables.otherDeduction;
    }

    customBreakdown[comp.id] = val;

    if (comp.id === 'comp_bonus') {
      bonus = val;
    } else if (comp.id === 'comp_incentive') {
      incentive = val;
    } else if (comp.id === 'comp_loan') {
      loanDeduction = val;
    } else if (comp.id === 'comp_other') {
      otherDeduction = val;
    } else {
      if (comp.type === 'earning') {
        customEarningsSum += val;
      } else {
        customDeductionsSum += val;
      }
    }
  }

  // Total cash compensation before employer-paid BPJS (useful for TER base)
  // Standard PPh 21 TER Gross Base includes:
  // Base Salary + Fixed Allowances + Variable Allowances + OT + Bonus + Incentive - Mangkir Deduction + Custom Earnings
  // Plus taxable BPJS premiums paid by Employer (Kesehatan 4%, JKK, JKM)
  const jkkRate = getJKKRate(employee.jkkRiskClass);
  const bpjs = calculateBPJS(normalSalaryBase, employee.bpjsActive, jkkRate, healthCeiling, jpCeiling);

  // Taxable Gross Base for PPh 21 TER:
  // Gross components that are TAXABLE:
  // Salary + allowances + OT + bonus + incentive - unpaid leave deduction + Custom Earnings + Employer BPJS Kesehatan + Employer BPJS JKK + Employer BPJS JKM
  const grossCashInput = Math.max(0, baseSalary + fixedAllowance + variableAllowance + otPay + bonus + incentive - unpaidLeaveDeduction + customEarningsSum);
  
  // Taxable gross includes cash input + taxable employer BPJS portions
  const bpjsTaxableEmployerPortion = employee.bpjsActive ? (bpjs.kesehatanEmployer + bpjs.jkkEmployer + bpjs.jkmEmployer) : 0;
  const grossTaxableForPPh21 = grossCashInput + bpjsTaxableEmployerPortion;

  // PPh 21 Monthly Calculation (TER Method)
  const terCategory = getTERCategory(employee.ptkpStatus);
  const terRate = getTERRate(terCategory, grossTaxableForPPh21);
  const pph21Tax = Math.floor(grossTaxableForPPh21 * terRate);

  // Total deductions
  // Unpaid leave is already subtracted from gross pay.
  // Net cash paycheck deductions: Employee BPJS contributions + PPh 21 tax + Loan + Other + Custom Deductions
  const employeeBPJSDeduction = bpjs.totalEmployee;
  const totalNetDeductions = employeeBPJSDeduction + pph21Tax + loanDeduction + otherDeduction + customDeductionsSum;

  const totalEarningsCash = grossCashInput;
  const netTakeHomePay = Math.max(0, totalEarningsCash - employeeBPJSDeduction - pph21Tax - loanDeduction - otherDeduction - customDeductionsSum);

  return {
    employeeId: employee.id,
    employeeName: employee.name,
    clientName: employee.clientName,
    department: employee.department,
    ptkpStatus: employee.ptkpStatus,
    jkkRiskClass: employee.jkkRiskClass,
    
    // Earnings
    basicSalary: baseSalary,
    fixedAllowance,
    variableAllowance,
    unpaidLeaveDeduction,
    otPay,
    bonus,
    incentive,
    customEarningsSum,
    customDeductionsSum,
    customBreakdown,
    totalEarningsCash,
    
    // BPJS Detailed portions
    bpjs,
    bpjsTaxableEmployerPortion,
    
    // Tax Details
    grossTaxableForPPh21,
    terCategory,
    terRate,
    pph21Tax,
    
    // Deductions
    employeeBPJSDeduction,
    loanDeduction,
    otherDeduction,
    totalNetDeductions,
    
    // Take home
    netTakeHomePay
  };
}

// Annual / December final Article 17 reconciliation calculation
export interface MonthlyPayRecord {
  month: number;
  grossTaxableForPPh21: number;
  pph21Paid: number; // calculated TER paid in Jan-Nov
  basicSalary: number;
  fixedAllowance: number;
  employeeJht: number; // 2%
  employeeJp: number; // 1%
}

export function calculateAnnualReconciliation(
  employee: Employee,
  salary: SalaryMaster,
  monthlyRecords: MonthlyPayRecord[],
  ptkpRates: Record<PTKPStatus, number>
) {
  // 1. Sum up annual gross taxable income for PPh 21
  const annualGrossTaxable = monthlyRecords.reduce((sum, r) => sum + r.grossTaxableForPPh21, 0);
  
  // 2. Sum up employee JP and JHT contributions (deductible)
  const annualJhtEmployee = monthlyRecords.reduce((sum, r) => sum + r.employeeJht, 0);
  const annualJpEmployee = monthlyRecords.reduce((sum, r) => sum + r.employeeJp, 0);
  
  // 3. Calculate Biaya Jabatan (5% of Annual Gross Taxable, max 6,000,000 per year or 500,000 * months worked)
  const monthsWorked = monthlyRecords.length;
  const maxBiayaJabatan = 500000 * monthsWorked;
  const rawBiayaJabatan = annualGrossTaxable * 0.05;
  const actualBiayaJabatan = Math.min(rawBiayaJabatan, maxBiayaJabatan);
  
  // 4. Calculate Net Income (Penghasilan Netto Setahun)
  const netAnnualIncome = Math.max(0, annualGrossTaxable - actualBiayaJabatan - annualJhtEmployee - annualJpEmployee);
  
  // 5. Apply PTKP
  const ptkpValue = ptkpRates[employee.ptkpStatus] || 54000000;
  
  // 6. Taxable Income (Penghasilan Kena Pajak / PKP)
  // Rounded down to nearest thousand for official tax calculation
  const pkpRaw = Math.max(0, netAnnualIncome - ptkpValue);
  const pkpRounded = Math.floor(pkpRaw / 1000) * 1000;
  
  // 7. Compute Article 17 tax
  const annualPPh21Tax = calculateArticle17Tax(pkpRounded);
  
  // 8. Sum up PPh 21 already paid from Jan-Nov
  // Filter out December (Month 12) if it was already estimated, 
  // or compare with actual PPh 21 paid in Month 1 to 11
  const pph21PaidJanNov = monthlyRecords
    .filter(r => r.month < 12)
    .reduce((sum, r) => sum + r.pph21Paid, 0);
    
  // 9. December tax is the balancing figure
  const decemberPPh21Reconciled = Math.max(0, annualPPh21Tax - pph21PaidJanNov);
  
  // If the employee leaves or if their actual annual tax is less than what has been deducted,
  // there could be an overpayment (Refund needed from company, which reduces company tax deposit).
  const difference = annualPPh21Tax - monthlyRecords.reduce((sum, r) => sum + r.pph21Paid, 0);

  return {
    annualGrossTaxable,
    actualBiayaJabatan,
    annualJhtEmployee,
    annualJpEmployee,
    netAnnualIncome,
    ptkpValue,
    pkpRounded,
    annualPPh21Tax,
    pph21PaidJanNov,
    decemberPPh21Reconciled,
    difference,
    overpayment: difference < 0 ? Math.abs(difference) : 0,
    underpayment: difference > 0 ? difference : 0
  };
}
