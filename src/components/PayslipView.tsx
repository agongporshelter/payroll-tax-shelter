import { useState } from 'react';
import { Employee, SalaryMaster, AttendanceOT, VariableInput, CustomComponent } from '../types';
import { calculateMonthlyPayroll } from '../utils/taxCalc';
import { FileText, Printer, Mail, Check, CreditCard, ChevronRight } from 'lucide-react';

interface PayslipViewProps {
  employees: Employee[];
  salaryMaster: SalaryMaster[];
  attendanceOT: AttendanceOT[];
  variables: VariableInput[];
  selectedMonth: number;
  customComponents?: CustomComponent[];
}

export default function PayslipView({
  employees,
  salaryMaster,
  attendanceOT,
  variables,
  selectedMonth,
  customComponents = []
}: PayslipViewProps) {
  
  const [selectedId, setSelectedId] = useState(employees[0]?.id || '');
  const [showSendSuccess, setShowSendSuccess] = useState(false);

  const formatIDR = (num: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(num);
  };

  const selectedEmp = employees.find(e => e.id === selectedId);
  const sal = salaryMaster.find(s => s.employeeId === selectedId) || { employeeId: selectedId, basicSalary: 0, fixedAllowance: 0, variableAllowance: 0 };
  const att = attendanceOT.find(a => a.employeeId === selectedId && a.month === selectedMonth) || { employeeId: selectedId, month: selectedMonth, actualWorkDays: 22, unpaidLeaveDays: 0, otHours: 0 };
  const v = variables.find(item => item.employeeId === selectedId && item.month === selectedMonth) || { employeeId: selectedId, month: selectedMonth, bonus: 0, incentive: 0, loanDeduction: 0, otherDeduction: 0, customValues: {} };

  const calc = selectedEmp ? calculateMonthlyPayroll(selectedEmp, sal, att, v, 12000000, 10400000, 0, customComponents) : null;

  const monthNames = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
  ];

  const handlePrint = () => {
    window.print();
  };

  const handleSendEmail = () => {
    setShowSendSuccess(true);
    setTimeout(() => {
      setShowSendSuccess(false);
    }, 2500);
  };

  return (
    <div className="space-y-6" id="payslip-panel">
      
      {/* Selection Control Panel */}
      <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-3">
        <div className="flex items-center space-x-2">
          <FileText className="w-5 h-5 text-indigo-600" />
          <span className="text-xs font-bold text-slate-700">Select Employee:</span>
          <select
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 text-slate-800 bg-white focus:outline-indigo-600"
          >
            {employees.map(emp => (
              <option key={emp.id} value={emp.id}>{emp.id} - {emp.name}</option>
            ))}
          </select>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handlePrint}
            className="px-3.5 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            Print Payslip
          </button>
          
          <button
            onClick={handleSendEmail}
            className="px-3.5 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            {showSendSuccess ? (
              <>
                <Check className="w-4 h-4" />
                Sent!
              </>
            ) : (
              <>
                <Mail className="w-4 h-4" />
                Email Payslip
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Payslip Container */}
      {selectedEmp && calc && (
        <div className="max-w-2xl mx-auto bg-white p-8 rounded-2xl border border-slate-200/80 shadow-md space-y-6 print:border-none print:shadow-none print:p-0 animate-fadeIn" id="payslip-box">
          
          {/* Logo & Company Title */}
          <div className="flex justify-between items-start border-b border-slate-200 pb-5">
            <div>
              <h2 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
                <span className="bg-indigo-600 text-white p-1 rounded font-black tracking-normal text-xs uppercase">Shelter</span>
                SHELTER INDONESIA
              </h2>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">Payroll & Outsource Management Solutions</p>
            </div>
            <div className="text-right">
              <h3 className="text-sm font-black text-slate-800 tracking-wide uppercase">PAYSLIP</h3>
              <p className="text-xs text-indigo-600 font-bold mt-1 font-mono">{monthNames[selectedMonth - 1].toUpperCase()} 2026</p>
            </div>
          </div>

          {/* Employee Metadata Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-xl text-xs font-semibold text-slate-700 border border-slate-100">
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase">Staff ID</p>
              <p className="font-bold text-slate-800 font-mono mt-0.5">{selectedEmp.id}</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase">Employee Name</p>
              <p className="font-bold text-slate-800 mt-0.5">{selectedEmp.name}</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase">Client Partner</p>
              <p className="font-bold text-slate-800 mt-0.5">{selectedEmp.clientName}</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase">Unit / Role</p>
              <p className="font-bold text-slate-800 mt-0.5">{selectedEmp.department}</p>
            </div>
          </div>

          {/* Earnings vs Deductions Split Columns */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-slate-600">
            
            {/* Earnings Column (Penghasilan) */}
            <div className="space-y-3">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-2.5">
                EARNINGS (PENERIMAAN)
              </h4>
              <div className="space-y-2 font-medium">
                <div className="flex justify-between">
                  <span>Basic Salary</span>
                  <span className="font-mono font-bold text-slate-800">{formatIDR(calc.basicSalary)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Fixed Allowance</span>
                  <span className="font-mono font-bold text-slate-800">{formatIDR(calc.fixedAllowance)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Variable Allowance</span>
                  <span className="font-mono font-bold text-slate-800">{formatIDR(calc.variableAllowance)}</span>
                </div>
                <div className="flex justify-between text-emerald-700">
                  <span>Overtime Pay (OT)</span>
                  <span className="font-mono font-bold">{formatIDR(calc.otPay)}</span>
                </div>
                <div className="flex justify-between text-emerald-700">
                  <span>Bonus / Holiday Allowance (THR)</span>
                  <span className="font-mono font-bold">{formatIDR(calc.bonus)}</span>
                </div>
                <div className="flex justify-between text-emerald-700">
                  <span>Incentive / Commission</span>
                  <span className="font-mono font-bold">{formatIDR(calc.incentive)}</span>
                </div>
                {customComponents.filter(c => c.type === 'earning').map(comp => {
                  const val = calc.customBreakdown?.[comp.id] || 0;
                  if (val === 0) return null;
                  return (
                    <div key={comp.id} className="flex justify-between text-emerald-700">
                      <span>{comp.name}</span>
                      <span className="font-mono font-bold">{formatIDR(val)}</span>
                    </div>
                  );
                })}
                {calc.unpaidLeaveDeduction > 0 && (
                  <div className="flex justify-between text-rose-600">
                    <span>Unpaid Leave Deduction</span>
                    <span className="font-mono font-bold">-{formatIDR(calc.unpaidLeaveDeduction)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Deductions Column (Potongan) */}
            <div className="space-y-3">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-2.5">
                DEDUCTIONS (POTONGAN)
              </h4>
              <div className="space-y-2 font-medium">
                <div className="flex justify-between">
                  <span>BPJS Kesehatan (Employee 1%)</span>
                  <span className="font-mono font-bold text-slate-800">{formatIDR(calc.bpjs.kesehatanEmployee)}</span>
                </div>
                <div className="flex justify-between">
                  <span>BPJS JHT (Employee 2%)</span>
                  <span className="font-mono font-bold text-slate-800">{formatIDR(calc.bpjs.jhtEmployee)}</span>
                </div>
                <div className="flex justify-between">
                  <span>BPJS JP (Employee 1%)</span>
                  <span className="font-mono font-bold text-slate-800">{formatIDR(calc.bpjs.jpEmployee)}</span>
                </div>
                <div className="flex justify-between text-rose-600">
                  <span>PPh 21 Income Tax</span>
                  <span className="font-mono font-bold">{formatIDR(calc.pph21Tax)}</span>
                </div>
                <div className="flex justify-between text-rose-600">
                  <span>Cooperative Loan Deduction</span>
                  <span className="font-mono font-bold">{formatIDR(calc.loanDeduction)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Other Deductions (SPSI / Kas)</span>
                  <span className="font-mono font-bold text-slate-800">{formatIDR(calc.otherDeduction)}</span>
                </div>
                {customComponents.filter(c => c.type === 'deduction').map(comp => {
                  const val = calc.customBreakdown?.[comp.id] || 0;
                  if (val === 0) return null;
                  return (
                    <div key={comp.id} className="flex justify-between text-rose-600">
                      <span>{comp.name}</span>
                      <span className="font-mono font-bold">-{formatIDR(val)}</span>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Summation Net Block */}
          <div className="bg-indigo-950 text-indigo-50 p-5 rounded-2xl flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="space-y-1">
              <p className="text-[10px] text-indigo-300 font-bold uppercase tracking-wider">Payment Method</p>
              <div className="flex items-center gap-2 mt-1">
                <CreditCard className="w-4 h-4 text-indigo-300" />
                <span className="text-xs font-bold text-white">Direct Transfer • Bank Mandiri Corporate</span>
              </div>
            </div>
            <div className="text-center sm:text-right">
              <p className="text-[10px] text-indigo-300 font-bold uppercase tracking-wider">TAKE HOME PAY (THP)</p>
              <p className="text-xl font-black font-mono mt-1 text-white">{formatIDR(calc.netTakeHomePay)}</p>
            </div>
          </div>

          {/* Signatures Panel */}
          <div className="grid grid-cols-2 gap-12 pt-8 text-xs font-bold text-slate-500 border-t border-slate-100">
            <div className="text-center">
              <p>Dibuat Oleh,</p>
              <p className="mt-14 border-b border-slate-200 pb-1 max-w-[150px] mx-auto text-slate-800 font-extrabold uppercase">HRD SHELTER</p>
              <p className="text-[10px] text-slate-400 mt-1 font-medium">Departemen Penggajian</p>
            </div>
            <div className="text-center">
              <p>Diterima Oleh,</p>
              <p className="mt-14 border-b border-slate-200 pb-1 max-w-[150px] mx-auto text-slate-800 font-extrabold uppercase">{selectedEmp.name}</p>
              <p className="text-[10px] text-slate-400 mt-1 font-medium">Staf Lapangan / Back Office</p>
            </div>
          </div>

          {/* Employer-paid hidden statutory contributions (Educational/Trust value) */}
          <div className="pt-2">
            <div className="p-3 bg-slate-50 rounded-lg text-[10px] text-slate-400 font-semibold border border-slate-100 flex items-center justify-between">
              <span>*Informasi Tambahan: Pemberi kerja (Perusahaan) juga membayarkan iuran BPJS sebesar <strong>{formatIDR(calc.bpjs.totalEmployer)}</strong> sebagai jaminan sosial tambahan di luar potongan gaji Anda.</span>
              <span className="text-indigo-600">Kepatuhan BPJS Terjamin</span>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
