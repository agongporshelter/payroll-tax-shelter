import { useState } from 'react';
import { Employee, SalaryMaster, AttendanceOT, VariableInput, CustomComponent } from '../types';
import { calculateMonthlyPayroll } from '../utils/taxCalc';
import { Search, Download, Table, FileSpreadsheet, Layers } from 'lucide-react';

interface PayrollWorkbookProps {
  employees: Employee[];
  salaryMaster: SalaryMaster[];
  attendanceOT: AttendanceOT[];
  variables: VariableInput[];
  selectedMonth: number;
  customComponents?: CustomComponent[];
}

export default function PayrollWorkbook({
  employees,
  salaryMaster,
  attendanceOT,
  variables,
  selectedMonth,
  customComponents = []
}: PayrollWorkbookProps) {
  
  const [searchTerm, setSearchTerm] = useState('');
  const [clientFilter, setClientFilter] = useState('ALL');

  const formatIDR = (num: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(num);
  };

  const uniqueClients = ['ALL', ...Array.from(new Set(employees.map(e => e.clientName)))];

  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = emp.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          emp.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClient = clientFilter === 'ALL' || emp.clientName === clientFilter;
    return matchesSearch && matchesClient;
  });

  const payrollRows = filteredEmployees.map(emp => {
    const sal = salaryMaster.find(s => s.employeeId === emp.id) || { employeeId: emp.id, basicSalary: 0, fixedAllowance: 0, variableAllowance: 0 };
    const att = attendanceOT.find(a => a.employeeId === emp.id && a.month === selectedMonth) || { employeeId: emp.id, month: selectedMonth, actualWorkDays: 22, unpaidLeaveDays: 0, otHours: 0 };
    const v = variables.find(item => item.employeeId === emp.id && item.month === selectedMonth) || { employeeId: emp.id, month: selectedMonth, bonus: 0, incentive: 0, loanDeduction: 0, otherDeduction: 0, customValues: {} };
    
    return calculateMonthlyPayroll(emp, sal, att, v, 12000000, 10400000, 0, customComponents);
  });

  // Export to CSV
  const handleExportCSV = () => {
    const headers = [
      'ID Karyawan', 'Nama Karyawan', 'Mitra Klien', 'Departemen', 'Status PTKP',
      'Gaji Pokok', 'Tunjangan Tetap', 'Tunjangan Variabel', 'Potongan Mangkir',
      'Upah Lembur', 'Bonus dan THR', 'Insentif', 'Total Bruto Tunai', 'BPJS Ditanggung PK',
      'Potongan BPJS Pekerja', 'Potongan PPh 21', 'Potongan Pinjaman Koperasi', 'Iuran Anggota SPSI', 'Take Home Pay Bersih'
    ];

    const rows = payrollRows.map(r => [
      r.employeeId, r.employeeName, r.clientName, r.department, r.ptkpStatus,
      r.basicSalary, r.fixedAllowance, r.variableAllowance, r.unpaidLeaveDeduction,
      r.otPay, r.bonus, r.incentive, r.totalEarningsCash, r.bpjs.totalEmployer,
      r.bpjs.totalEmployee, r.pph21Tax, r.loanDeduction, r.otherDeduction, r.netTakeHomePay
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `SHELTER_PAYROLL_WORKBOOK_M${selectedMonth}_2026.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const monthNames = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
  ];

  return (
    <div className="space-y-6" id="payroll-workbook-panel">
      
      {/* Top Filter Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
        <div className="flex flex-1 gap-2">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Cari karyawan..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 w-full text-xs font-semibold rounded-lg border border-slate-200 text-slate-800 focus:outline-indigo-600 bg-white"
            />
          </div>

          <select
            value={clientFilter}
            onChange={(e) => setClientFilter(e.target.value)}
            className="px-3 py-2 text-xs font-semibold rounded-lg border border-slate-200 text-slate-700 bg-white focus:outline-indigo-600"
          >
            {uniqueClients.map(c => (
              <option key={c} value={c}>{c === 'ALL' ? 'Semua Klien' : c}</option>
            ))}
          </select>
        </div>

        <button
          onClick={handleExportCSV}
          className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700 flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <Download className="w-4 h-4" />
          Ekspor CSV Master
        </button>
      </div>

      {/* Gigantic master workbook table sheet */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <FileSpreadsheet className="w-4 h-4 text-indigo-600" />
            Buku Besar Penggajian Konsolidasi Periode {monthNames[selectedMonth - 1]} 2026
          </h4>
          <span className="px-1.5 py-0.5 bg-slate-200 rounded text-[10px] font-bold text-slate-600">Format spreadsheet lebar</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/50 text-slate-500 font-bold uppercase tracking-wider text-[9px] border-b border-slate-100">
                <th className="py-3 px-4 font-bold text-slate-700 break-words whitespace-normal">ID</th>
                <th className="py-3 px-3 font-bold text-slate-700 break-words whitespace-normal">Nama</th>
                <th className="py-3 px-3 font-bold text-slate-700 break-words whitespace-normal">Klien Mitra</th>
                <th className="py-3 px-2 text-right break-words whitespace-normal">Gaji Pokok</th>
                <th className="py-3 px-2 text-right break-words whitespace-normal">Tunj. Tetap</th>
                <th className="py-3 px-2 text-right break-words whitespace-normal">Tunj. Variabel</th>
                <th className="py-3 px-2 text-right text-rose-600 break-words whitespace-normal">Potongan Mangkir</th>
                <th className="py-3 px-2 text-right break-words whitespace-normal">Upah Lembur</th>
                <th className="py-3 px-2 text-right break-words whitespace-normal">Bonus/THR</th>
                <th className="py-3 px-2 text-right break-words whitespace-normal">Insentif</th>
                <th className="py-3 px-3 text-right bg-slate-50 font-bold text-slate-800 break-words whitespace-normal">Total Bruto Tunai</th>
                <th className="py-3 px-2 text-right text-blue-800 break-words whitespace-normal">BPJS PK (Pemberi Kerja)</th>
                <th className="py-3 px-2 text-right text-rose-700 break-words whitespace-normal">BPJS Pekerja (Potongan)</th>
                <th className="py-3 px-2 text-right text-rose-700 break-words whitespace-normal">Pajak PPh 21</th>
                <th className="py-3 px-2 text-right text-rose-700 break-words whitespace-normal">Pinjaman</th>
                <th className="py-3 px-3 text-right bg-indigo-50/50 text-indigo-950 font-black break-words whitespace-normal">THP Bersih (Gaji Bersih)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium font-mono text-[11px] text-slate-600">
              {payrollRows.map((r) => (
                <tr key={r.employeeId} className="hover:bg-slate-50/30">
                  <td className="py-3 px-4 font-bold text-slate-800 font-mono text-xs break-all">{r.employeeId}</td>
                  <td className="py-3 px-3 font-sans text-xs font-bold text-slate-800 break-words whitespace-normal">{r.employeeName}</td>
                  <td className="py-3 px-3 font-sans text-xs text-slate-500 break-words whitespace-normal">{r.clientName}</td>
                  <td className="py-3 px-2 text-right">{formatIDR(r.basicSalary)}</td>
                  <td className="py-3 px-2 text-right">{formatIDR(r.fixedAllowance)}</td>
                  <td className="py-3 px-2 text-right">{formatIDR(r.variableAllowance)}</td>
                  <td className="py-3 px-2 text-right text-rose-600 font-bold">-{formatIDR(r.unpaidLeaveDeduction)}</td>
                  <td className="py-3 px-2 text-right text-emerald-700">{formatIDR(r.otPay)}</td>
                  <td className="py-3 px-2 text-right text-emerald-700">{formatIDR(r.bonus)}</td>
                  <td className="py-3 px-2 text-right text-emerald-700">{formatIDR(r.incentive)}</td>
                  <td className="py-3 px-3 text-right bg-slate-50/50 font-bold text-slate-800 text-xs">{formatIDR(r.totalEarningsCash)}</td>
                  <td className="py-3 px-2 text-right text-blue-700">{formatIDR(r.bpjs.totalEmployer)}</td>
                  <td className="py-3 px-2 text-right text-rose-700">-{formatIDR(r.bpjs.totalEmployee)}</td>
                  <td className="py-3 px-2 text-right text-rose-700">-{formatIDR(r.pph21Tax)}</td>
                  <td className="py-3 px-2 text-right text-rose-700">-{formatIDR(r.loanDeduction)}</td>
                  <td className="py-3 px-3 text-right bg-indigo-50/30 text-indigo-950 font-black text-xs">{formatIDR(r.netTakeHomePay)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
