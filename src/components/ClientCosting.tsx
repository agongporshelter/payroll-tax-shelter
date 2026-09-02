import { useState } from 'react';
import { Employee, SalaryMaster, AttendanceOT, VariableInput, CustomComponent } from '../types';
import { calculateMonthlyPayroll } from '../utils/taxCalc';
import { Search, Percent, Building, CheckCircle, ArrowRight, Printer } from 'lucide-react';

interface ClientCostingProps {
  employees: Employee[];
  salaryMaster: SalaryMaster[];
  attendanceOT: AttendanceOT[];
  variables: VariableInput[];
  selectedMonth: number;
  customComponents?: CustomComponent[];
}

export default function ClientCosting({
  employees,
  salaryMaster,
  attendanceOT,
  variables,
  selectedMonth,
  customComponents = []
}: ClientCostingProps) {
  
  const [searchTerm, setSearchTerm] = useState('');
  const [markupPercent, setMarkupPercent] = useState(10); // Default 10% management fee markup

  const formatIDR = (num: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(num);
  };

  const filteredEmployees = employees.filter(emp => 
    emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.clientName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Group by client
  const clientsData = filteredEmployees.reduce((acc, emp) => {
    const sal = salaryMaster.find(s => s.employeeId === emp.id) || { employeeId: emp.id, basicSalary: 0, fixedAllowance: 0, variableAllowance: 0 };
    const att = attendanceOT.find(a => a.employeeId === emp.id && a.month === selectedMonth) || { employeeId: emp.id, month: selectedMonth, actualWorkDays: 22, unpaidLeaveDays: 0, otHours: 0 };
    const v = variables.find(varItem => varItem.employeeId === emp.id && varItem.month === selectedMonth) || { employeeId: emp.id, month: selectedMonth, bonus: 0, incentive: 0, loanDeduction: 0, otherDeduction: 0, customValues: {} };
    
    const calc = calculateMonthlyPayroll(emp, sal, att, v, 12000000, 10400000, 0, customComponents);
    
    // Direct employee cost is Gross Cash + BPJS Employer contribution
    const directEmployeeCost = calc.totalEarningsCash + calc.bpjs.totalEmployer;
    const mfee = directEmployeeCost * (markupPercent / 100);
    const totalInvoice = directEmployeeCost + mfee;

    if (!acc[emp.clientName]) {
      acc[emp.clientName] = {
        clientName: emp.clientName,
        staffList: [],
        totalSalary: 0,
        totalOT: 0,
        totalBPJSEmployer: 0,
        totalDirectCost: 0
      };
    }

    acc[emp.clientName].staffList.push({
      id: emp.id,
      name: emp.name,
      department: emp.department,
      cashEarnings: calc.totalEarningsCash,
      bpjsEmployer: calc.bpjs.totalEmployer,
      directCost: directEmployeeCost,
      fee: mfee,
      billing: totalInvoice
    });

    acc[emp.clientName].totalSalary += (calc.basicSalary + calc.fixedAllowance + calc.variableAllowance + calc.bonus + calc.incentive - calc.unpaidLeaveDeduction);
    acc[emp.clientName].totalOT += calc.otPay;
    acc[emp.clientName].totalBPJSEmployer += calc.bpjs.totalEmployer;
    acc[emp.clientName].totalDirectCost += directEmployeeCost;

    return acc;
  }, {} as Record<string, {
    clientName: string;
    staffList: Array<{ id: string; name: string; department: string; cashEarnings: number; bpjsEmployer: number; directCost: number; fee: number; billing: number }>;
    totalSalary: number;
    totalOT: number;
    totalBPJSEmployer: number;
    totalDirectCost: number;
  }>);

  const monthNames = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
  ];

  return (
    <div className="space-y-6" id="client-costing-panel">
      
      {/* Configuration Header Banner */}
      <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4">
        <div className="flex items-center space-x-3.5">
          <Building className="w-6 h-6 text-indigo-600 shrink-0" />
          <div>
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">Alokasi Biaya Klien & Markup Invoice</h3>
            <p className="text-xs text-slate-500">Hitung nilai tagihan kontrak klien berdasarkan total upah langsung aktual + iuran BPJS pemberi kerja + agency management fee.</p>
          </div>
        </div>

        {/* Markup Configurator */}
        <div className="flex items-center space-x-2 bg-slate-50 border border-slate-200/60 p-2 rounded-lg">
          <Percent className="w-4 h-4 text-indigo-600" />
          <label className="text-xs font-bold text-slate-700">Management Fee Markup:</label>
          <div className="relative rounded-md shadow-sm w-20">
            <input
              type="number"
              min={0}
              max={100}
              value={markupPercent}
              onChange={(e) => setMarkupPercent(Math.max(0, parseFloat(e.target.value) || 0))}
              className="block w-full text-xs font-bold rounded border border-slate-200 px-2 py-1 text-slate-800 bg-white focus:outline-indigo-600 text-center"
            />
          </div>
          <span className="text-xs font-bold text-slate-400">%</span>
        </div>
      </div>

      {/* Grouped Clients Display */}
      {Object.values(clientsData).length === 0 ? (
        <div className="bg-white p-12 text-center text-slate-400 rounded-xl border border-slate-100 shadow-sm">
          Tidak ada data transaksi yang dapat ditampilkan.
        </div>
      ) : (
        Object.values(clientsData).map((cdata) => {
          const clientDirectCost = cdata.totalDirectCost;
          const clientFee = clientDirectCost * (markupPercent / 100);
          const clientTotalBilling = clientDirectCost + clientFee;

          return (
            <div key={cdata.clientName} className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden space-y-4">
              
              {/* Client Header bar */}
              <div className="bg-slate-50/80 px-5 py-4 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wide">Mitra Klien</h4>
                  <p className="text-base font-black text-slate-800">{cdata.clientName}</p>
                </div>
                
                {/* Invoice Totals Banner */}
                <div className="flex flex-wrap items-center gap-4 text-xs font-bold">
                  <div className="text-right p-2.5 bg-white border border-slate-100 rounded-lg">
                    <p className="text-[10px] text-slate-400 font-semibold uppercase">Biaya Tenaga Kerja Langsung</p>
                    <p className="text-slate-800 font-mono font-bold mt-0.5">{formatIDR(clientDirectCost)}</p>
                  </div>
                  <div className="text-right p-2.5 bg-white border border-slate-100 rounded-lg">
                    <p className="text-[10px] text-indigo-500 font-semibold uppercase">Management Fee ({markupPercent}%)</p>
                    <p className="text-indigo-700 font-mono font-bold mt-0.5">{formatIDR(clientFee)}</p>
                  </div>
                  <div className="text-right p-2.5 bg-indigo-950 text-indigo-50 rounded-lg">
                    <p className="text-[10px] text-indigo-300 font-semibold uppercase">Total Tagihan Invoice</p>
                    <p className="text-sm font-mono font-black mt-0.5">{formatIDR(clientTotalBilling)}</p>
                  </div>
                </div>
              </div>

              {/* Staff Breakdown Table */}
              <div className="px-5 pb-5">
                <div className="overflow-x-auto border border-slate-100 rounded-lg">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 text-slate-500 font-semibold text-[10px] uppercase border-b border-slate-100">
                        <th className="py-2.5 px-3">ID Karyawan</th>
                        <th className="py-2.5 px-2">Nama Karyawan</th>
                        <th className="py-2.5 px-2">Departemen/Sektor</th>
                        <th className="py-2.5 px-2 text-right">Gaji Kotor (Bruto)</th>
                        <th className="py-2.5 px-2 text-right">BPJS Ditanggung Perusahaan (PK)</th>
                        <th className="py-2.5 px-2 text-right bg-slate-50/50 font-bold">Biaya Langsung (A+B)</th>
                        <th className="py-2.5 px-2 text-right text-indigo-600">Markup Kontrak</th>
                        <th className="py-2.5 px-3 text-right bg-indigo-50/20 text-indigo-950 font-black">Nilai Kontrak Ditagihkan</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-600 font-medium">
                      {cdata.staffList.map((st) => (
                        <tr key={st.id} className="hover:bg-slate-50/30 font-mono text-[11px]">
                          <td className="py-3 px-3 font-bold text-slate-800 text-xs font-mono">{st.id}</td>
                          <td className="py-3 px-2 font-sans text-xs text-slate-800 font-bold">{st.name}</td>
                          <td className="py-3 px-2 font-sans text-xs text-slate-500">{st.department}</td>
                          <td className="py-3 px-2 text-right">{formatIDR(st.cashEarnings)}</td>
                          <td className="py-3 px-2 text-right text-slate-500">{formatIDR(st.bpjsEmployer)}</td>
                          <td className="py-3 px-2 text-right bg-slate-50/30 font-bold text-slate-700">{formatIDR(st.directCost)}</td>
                          <td className="py-3 px-2 text-right text-indigo-600">{formatIDR(st.directCost * (markupPercent / 100))}</td>
                          <td className="py-3 px-3 text-right bg-indigo-50/10 text-indigo-950 font-bold text-xs">{formatIDR(st.directCost * (1 + markupPercent / 100))}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          );
        })
      )}

    </div>
  );
}
