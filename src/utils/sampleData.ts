import { Employee, SalaryMaster, AttendanceOT, VariableInput } from '../types';

export const INITIAL_EMPLOYEES: Employee[] = [
  {
    id: "EMP-001",
    name: "Adi Santoso",
    ptkpStatus: "TK/0",
    jkkRiskClass: "Class III (0.89%)", // Security guard risk class
    bpjsActive: true,
    clientName: "PT Astra International",
    department: "Security Services",
    joinDate: "2023-01-15"
  },
  {
    id: "EMP-002",
    name: "Bambang Wijaya",
    ptkpStatus: "K/1",
    jkkRiskClass: "Class III (0.89%)",
    bpjsActive: true,
    clientName: "PT Astra International",
    department: "Security Services",
    joinDate: "2022-08-10"
  },
  {
    id: "EMP-003",
    name: "Citra Lestari",
    ptkpStatus: "TK/1",
    jkkRiskClass: "Class I (0.24%)", // Back office low risk
    bpjsActive: true,
    clientName: "Shelter Head Office",
    department: "Human Resources",
    joinDate: "2024-03-01"
  },
  {
    id: "EMP-004",
    name: "Dedi Kurniawan",
    ptkpStatus: "K/2",
    jkkRiskClass: "Class II (0.54%)", // Field manager medium-low
    bpjsActive: true,
    clientName: "PT Bank Mandiri",
    department: "Facility Services",
    joinDate: "2021-11-20"
  },
  {
    id: "EMP-005",
    name: "Eka Rahmawati",
    ptkpStatus: "TK/2",
    jkkRiskClass: "Class I (0.24%)",
    bpjsActive: true,
    clientName: "PT Unilever Indonesia",
    department: "Cleaning & Caretaker",
    joinDate: "2024-05-12"
  },
  {
    id: "EMP-006",
    name: "Farhan Saputra",
    ptkpStatus: "K/3", // Category C PPh 21
    jkkRiskClass: "Class III (0.89%)",
    bpjsActive: true,
    clientName: "PT Bank Mandiri",
    department: "Security Services",
    joinDate: "2023-06-01"
  },
  {
    id: "EMP-007",
    name: "Gita Permata",
    ptkpStatus: "K/0",
    jkkRiskClass: "Class I (0.24%)",
    bpjsActive: false, // Opted out / covered elsewhere to show non-active BPJS scenario
    clientName: "PT Unilever Indonesia",
    department: "Administrative Support",
    joinDate: "2024-01-10"
  }
];

export const INITIAL_SALARY_MASTER: SalaryMaster[] = [
  {
    employeeId: "EMP-001",
    basicSalary: 5200000, // Slightly above Surabaya/Jakarta UMR
    fixedAllowance: 800000, // Position allowance
    variableAllowance: 400000 // Meal & transport
  },
  {
    employeeId: "EMP-002",
    basicSalary: 5400000,
    fixedAllowance: 1000000,
    variableAllowance: 500000
  },
  {
    employeeId: "EMP-003",
    basicSalary: 7500000,
    fixedAllowance: 1500000,
    variableAllowance: 600000
  },
  {
    employeeId: "EMP-004",
    basicSalary: 12000000,
    fixedAllowance: 2500000,
    variableAllowance: 1000000
  },
  {
    employeeId: "EMP-005",
    basicSalary: 4900000, // Cleaning UMR
    fixedAllowance: 400000,
    variableAllowance: 300000
  },
  {
    employeeId: "EMP-006",
    basicSalary: 5200000,
    fixedAllowance: 800000,
    variableAllowance: 400000
  },
  {
    employeeId: "EMP-007",
    basicSalary: 6200000,
    fixedAllowance: 1000000,
    variableAllowance: 500000
  }
];

// Let's programmatically generate 12 months of highly realistic attendance & overtime data
// to avoid manual massive arrays while still providing authentic history.
export function generateAttendanceOTHistory(): AttendanceOT[] {
  const list: AttendanceOT[] = [];
  
  // Base pattern for each employee
  const employeePatterns: Record<string, { days: number, ot: number }> = {
    "EMP-001": { days: 22, ot: 18 }, // Active overtime earner
    "EMP-002": { days: 22, ot: 15 },
    "EMP-003": { days: 21, ot: 0 },  // Back office, zero overtime
    "EMP-004": { days: 22, ot: 4 },  // Manager, minimal overtime
    "EMP-005": { days: 22, ot: 10 },
    "EMP-006": { days: 20, ot: 25 }, // High overtime but occasionally has unpaid leave
    "EMP-007": { days: 22, ot: 0 }
  };

  for (const emp of INITIAL_EMPLOYEES) {
    const pattern = employeePatterns[emp.id] || { days: 22, ot: 0 };
    for (let month = 1; month <= 12; month++) {
      // Add slight seasonal variance (holidays in Dec/April, sickness in wet season)
      let actualDays = pattern.days;
      let unpaidDays = 0;
      let ot = pattern.ot;

      if (month === 4 || month === 12) {
        actualDays -= 1; // Eid / Year-end leaves
      }

      // EMP-006 has a mangkir day in month 3 and 8
      if (emp.id === "EMP-006" && (month === 3 || month === 8)) {
        unpaidDays = 1;
        actualDays -= 1;
      }

      // Overtime peaks in seasonal rush (Months 6, 11, 12)
      if (month === 6 || month === 11 || month === 12) {
        ot = Math.round(ot * 1.3);
      } else if (month === 4) {
        ot = Math.round(ot * 0.7); // Low season during Eid holidays
      }

      list.push({
        employeeId: emp.id,
        month,
        actualWorkDays: actualDays,
        unpaidLeaveDays: unpaidDays,
        otHours: ot
      });
    }
  }

  return list;
}

// Generate programmatically consistent variable inputs for all 12 months
export function generateVariableInputsHistory(): VariableInput[] {
  const list: VariableInput[] = [];

  for (const emp of INITIAL_EMPLOYEES) {
    for (let month = 1; month <= 12; month++) {
      let bonus = 0;
      let incentive = 0;
      let loan = 0;
      let other = 0;

      // Festive bonus (THR) in month 4 (assume 1 month base salary THR)
      if (month === 4) {
        const sal = INITIAL_SALARY_MASTER.find(s => s.employeeId === emp.id);
        if (sal) {
          bonus = sal.basicSalary; // 1 month THR
        }
      }

      // Year-end performance incentive in December
      if (month === 12) {
        if (emp.id === "EMP-004") incentive = 5000000; // Manager bonus
        else if (emp.id === "EMP-001" || emp.id === "EMP-002") incentive = 1200000; // Guard performance award
      }

      // Occasional loan deductions
      if (emp.id === "EMP-001" && month >= 6 && month <= 10) {
        loan = 300000; // Cooperative loan repayments
      }

      // Miscellaneous cooperative membership fee
      if (emp.id !== "EMP-007") {
        other = 50000; // Rp 50k monthly cooperative dues
      }

      list.push({
        employeeId: emp.id,
        month,
        bonus,
        incentive,
        loanDeduction: loan,
        otherDeduction: other
      });
    }
  }

  return list;
}
