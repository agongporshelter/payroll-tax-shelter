export type PTKPStatus = 'TK/0' | 'TK/1' | 'TK/2' | 'TK/3' | 'K/0' | 'K/1' | 'K/2' | 'K/3';

export type JKKRiskClass = 'Class I (0.24%)' | 'Class II (0.54%)' | 'Class III (0.89%)' | 'Class IV (1.27%)' | 'Class V (1.74%)';

export interface Employee {
  id: string;
  name: string;
  ptkpStatus: PTKPStatus;
  jkkRiskClass: JKKRiskClass;
  bpjsActive: boolean;
  clientName: string; // Shelter is an outsourcing agency, so employees belong to clients
  department: string;
  joinDate: string;
}

export interface SalaryMaster {
  employeeId: string;
  basicSalary: number;
  fixedAllowance: number;
  variableAllowance: number;
}

export interface AttendanceOT {
  employeeId: string;
  month: number; // 1 - 12 (Jan - Dec)
  actualWorkDays: number; // e.g. 20, 22
  unpaidLeaveDays: number; // mangkir
  otHours: number; // Overtime hours
}

export interface CustomComponent {
  id: string;
  name: string;
  type: 'earning' | 'deduction'; // 'earning' is penambah, 'deduction' is pengurang
  description?: string;
}

export interface VariableInput {
  employeeId: string;
  month: number;
  bonus: number;
  incentive: number;
  loanDeduction: number;
  otherDeduction: number;
  customValues?: Record<string, number>; // key: customComponent.id, value: amount in IDR
}

export interface BPJSConfig {
  kesehatanEmployerRate: number; // 4%
  kesehatanEmployeeRate: number; // 1%
  kesehatanCeiling: number; // 12,000,000
  kesehatanFloor: number; // 2,200,000 (UMR)
  
  jhtEmployerRate: number; // 3.7%
  jhtEmployeeRate: number; // 2%
  
  jpEmployerRate: number; // 2%
  jpEmployeeRate: number; // 1%
  jpCeiling: number; // 10,400,000
  
  jkmEmployerRate: number; // 0.3%
}

export interface TaxParameters {
  biayaJabatanRate: number; // 5%
  biayaJabatanMaxMonthly: number; // 500,000
  biayaJabatanMaxYearly: number; // 6,000,000
  ptkpRates: Record<PTKPStatus, number>;
}
