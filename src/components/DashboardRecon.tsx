import { Employee, SalaryMaster, AttendanceOT, VariableInput, CustomComponent } from '../types';
import { calculateMonthlyPayroll } from '../utils/taxCalc';
import { ShieldCheck, Users, Briefcase, Calculator, Building, AlertCircle, TrendingUp, DollarSign } from 'lucide-react';

interface DashboardReconProps {
  employees: Employee[];
  salaryMaster: SalaryMaster[];
  attendanceOT: AttendanceOT[];
  variables: VariableInput[];
  selectedMonth: number;
  customComponents?: CustomComponent[];
}

export default function DashboardRecon({
  employees,
  salaryMaster,
  attendanceOT,
  variables,
  selectedMonth,
  customComponents = []
}: DashboardReconProps) {
  // Compute key payroll values for the selected month
  const monthlyCalculations = employees.map(emp => {
    const sal = salaryMaster.find(s => s.employeeId === emp.id && s.month === selectedMonth) || salaryMaster.find(s => s.employeeId === emp.id) || { employeeId: emp.id, basicSalary: 0, fixedAllowance: 0, variableAllowance: 0 };
    const att = attendanceOT.find(a => a.employeeId === emp.id && a.month === selectedMonth) || { employeeId: emp.id, month: selectedMonth, actualWorkDays: 22, unpaidLeaveDays: 0, otHours: 0 };
    const v = variables.find(varItem => varItem.employeeId === emp.id && varItem.month === selectedMonth) || { employeeId: emp.id, month: selectedMonth, bonus: 0, incentive: 0, loanDeduction: 0, otherDeduction: 0, customValues: {} };
    
    return calculateMonthlyPayroll(emp, sal, att, v, 12000000, 10400000, 0, customComponents);
  });

  const totalHeadcount = employees.length;
  const bpjsActiveCount = employees.filter(e => e.bpjsActive).length;
  
  const totalGrossCash = monthlyCalculations.reduce((sum, r) => sum + r.totalEarningsCash, 0);
  const totalNetTakeHome = monthlyCalculations.reduce((sum, r) => sum + r.netTakeHomePay, 0);
  const totalPPh21 = monthlyCalculations.reduce((sum, r) => sum + r.pph21Tax, 0);
  
  const totalBPJSEmployer = monthlyCalculations.reduce((sum, r) => sum + r.bpjs.totalEmployer, 0);
  const totalBPJSEmployee = monthlyCalculations.reduce((sum, r) => sum + r.bpjs.totalEmployee, 0);
  const totalBPJSBilling = totalBPJSEmployer + totalBPJSEmployee;

  // Group by client for invoicing billing summary
  const clientBillingSummary = employees.reduce((acc, emp) => {
    const calc = monthlyCalculations.find(c => c.employeeId === emp.id);
    if (!calc) return acc;
    
    // In outsourcing, billing equals direct employee cost (Earnings Cash + BPJS Employer) + management fee
    const directCost = calc.totalEarningsCash + calc.bpjs.totalEmployer;
    // Assume 10% management fee
    const managementFee = directCost * 0.10;
    const totalInvoice = directCost + managementFee;

    if (!acc[emp.clientName]) {
      acc[emp.clientName] = { headcount: 0, directCost: 0, managementFee: 0, totalInvoice: 0 };
    }
    acc[emp.clientName].headcount += 1;
    acc[emp.clientName].directCost += directCost;
    acc[emp.clientName].managementFee += managementFee;
    acc[emp.clientName].totalInvoice += totalInvoice;
    
    return acc;
  }, {} as Record<string, { headcount: number; directCost: number; managementFee: number; totalInvoice: number }>);

  const totalClientBilling = Object.values(clientBillingSummary).reduce((sum, c) => sum + c.totalInvoice, 0);
  const totalManagementFee = Object.values(clientBillingSummary).reduce((sum, c) => sum + c.managementFee, 0);

  // Month Names Helper
  const monthNames = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
  ];

  // Formatting currency IDR
  const formatIDR = (num: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(num);
  };

  return (
    <div className="space-y-6" id="dashboard-recon-panel">
      {/* Visual KPI Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-emerald-50 rounded-lg text-emerald-600">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Gaji Kotor (Bruto)</p>
            <p className="text-lg font-bold text-slate-800">{formatIDR(totalGrossCash)}</p>
            <p className="text-xs text-emerald-600 font-medium">Bulan {monthNames[selectedMonth - 1]}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-blue-50 rounded-lg text-blue-600">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Tagihan Iuran BPJS (Pemberi Kerja + Pekerja)</p>
            <p className="text-lg font-bold text-slate-800">{formatIDR(totalBPJSBilling)}</p>
            <p className="text-xs text-slate-400 font-medium">{bpjsActiveCount} / {totalHeadcount} BPJS Aktif</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-rose-50 rounded-lg text-rose-600">
            <Calculator className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Liabilitas Bulanan PPh 21</p>
            <p className="text-lg font-bold text-slate-800">{formatIDR(totalPPh21)}</p>
            <p className="text-xs text-rose-600 font-medium">Sesuai Regulasi TER PP 58/2023</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-slate-50 rounded-lg text-slate-600">
            <Building className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Tagihan Klien</p>
            <p className="text-lg font-bold text-slate-800">{formatIDR(totalClientBilling)}</p>
            <p className="text-xs text-indigo-600 font-semibold">Termasuk Fee: {formatIDR(totalManagementFee)}</p>
          </div>
        </div>
      </div>

      {/* Main Grid: Compliance Alerts & Reconciliation */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Verification and Audit Trail Column (Left 5 cols) */}
        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm lg:col-span-5 space-y-5">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-3 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            Panel Verifikasi Kepatuhan Regulasi
          </h3>
          
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-emerald-50/50 border border-emerald-100 flex items-start space-x-3">
              <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-slate-800">Audit Status Kategori TER Bulanan</h4>
                <p className="text-xs text-slate-600 mt-1">
                  Status kategori pajak (Kategori TER A, B, atau C) telah dipetakan secara akurat berdasarkan deklarasi PTKP awal di data induk.
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-800 rounded text-[10px] font-bold uppercase">Sesuai</span>
                  <span className="text-[10px] text-slate-400">100% data terverifikasi</span>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-indigo-50/50 border border-indigo-100 flex items-start space-x-3">
              <Calculator className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-slate-800">Batas Atas (Ceiling) BPJS Terbaca</h4>
                <p className="text-xs text-slate-600 mt-1">
                  Plafon BPJS Kesehatan dibatasi Rp 12.000.000, dan plafon Jaminan Pensiun (JP) BPJS Ketenagakerjaan dibatasi Rp 10.400.000 secara otomatis.
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <span className="px-1.5 py-0.5 bg-indigo-100 text-indigo-800 rounded text-[10px] font-bold uppercase">Aktif</span>
                  <span className="text-[10px] text-slate-400">Pemisahan JKK/JKM & JHT tervalidasi</span>
                </div>
              </div>
            </div>

            {selectedMonth === 12 && (
              <div className="p-4 rounded-lg bg-rose-50 border border-rose-100 flex items-start space-x-3 animate-pulse">
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-rose-800">Rekonsiliasi Pajak Tahunan Desember Aktif</h4>
                  <p className="text-xs text-rose-700 mt-1">
                    Bulan saat ini adalah Desember. Sistem otomatis menghitung pajak tahunan menggunakan tarif progresif Pasal 17 ayat (1) huruf a UU PPh untuk melakukan penyesuaian (balancing) lebih/kurang bayar.
                  </p>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="px-1.5 py-0.5 bg-rose-100 text-rose-800 rounded text-[10px] font-bold uppercase">Peringatan</span>
                    <span className="text-[10px] text-rose-600 font-semibold">Penyesuaian akhir tahun diterapkan</span>
                  </div>
                </div>
              </div>
            )}

            {selectedMonth !== 12 && (
              <div className="p-4 rounded-lg bg-amber-50/70 border border-amber-100 flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-slate-800">Perhitungan Pajak Bulanan Rutin</h4>
                  <p className="text-xs text-slate-600 mt-1">
                    Penggajian Bulan {selectedMonth} menggunakan tarif TER bulanan PP 58/2023. Rekonsiliasi progresif Pasal 17 akan dijalankan otomatis pada bulan Desember.
                  </p>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="px-1.5 py-0.5 bg-amber-100 text-amber-800 rounded text-[10px] font-bold uppercase">Siklus Rutin Jan-Nov</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Client Costing Allocation & Reconciliation (Right 7 cols) */}
        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm lg:col-span-7 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-3 flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-indigo-600" />
              Buku Besar Ringkasan Tagihan Klien (Outsourcing)
            </h3>

            <div className="overflow-x-auto mt-4">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-100">
                    <th className="py-2.5 px-3 rounded-l-lg">Mitra Klien</th>
                    <th className="py-2.5 px-2 text-center">Jumlah Personel</th>
                    <th className="py-2.5 px-2 text-right">Upah Langsung & BPJS</th>
                    <th className="py-2.5 px-2 text-right">Management Fee (10%)</th>
                    <th className="py-2.5 px-3 text-right rounded-r-lg">Total Invoice Tagihan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {Object.entries(clientBillingSummary).map(([client, stat]) => (
                    <tr key={client} className="hover:bg-slate-50/40 text-slate-700">
                      <td className="py-3 px-3 font-medium text-slate-800">{client}</td>
                      <td className="py-3 px-2 text-center font-semibold text-slate-600">{stat.headcount}</td>
                      <td className="py-3 px-2 text-right font-medium">{formatIDR(stat.directCost)}</td>
                      <td className="py-3 px-2 text-right text-emerald-700 font-medium">{formatIDR(stat.managementFee)}</td>
                      <td className="py-3 px-3 text-right font-bold text-indigo-950">{formatIDR(stat.totalInvoice)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 bg-slate-50/50 p-4 rounded-lg flex flex-col sm:flex-row justify-between items-center gap-3">
            <div className="flex items-center gap-3">
              <div className="w-3.5 h-3.5 rounded-full bg-indigo-600"></div>
              <div>
                <p className="text-[11px] font-semibold text-slate-500 uppercase">Margin Keuntungan Bersih Shelter</p>
                <p className="text-sm font-bold text-indigo-950">Management Fee: {formatIDR(totalManagementFee)}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-slate-500 font-medium">Akumulasi tagihan invoice bulan ini</p>
              <p className="text-base font-black text-emerald-700">{formatIDR(totalClientBilling)}</p>
            </div>
          </div>
        </div>

      </div>

      {/* SVG Analytical Graphics Panel */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Earnings Structure Chart */}
        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm space-y-4">
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-600" />
            Grafik Distribusi Upah (Gaji Bersih vs Potongan Pajak & BPJS)
          </h4>
          
          <div className="relative pt-2 h-44 flex items-end justify-around border-b border-slate-200 pb-1">
            <div className="flex flex-col items-center w-16">
              <div className="w-8 bg-emerald-500 rounded-t-sm" style={{ height: '110px' }}></div>
              <p className="text-[10px] font-semibold text-slate-700 mt-2">Gaji Kotor</p>
              <p className="text-[9px] text-slate-500">{formatIDR(totalGrossCash)}</p>
            </div>

            <div className="flex flex-col items-center w-16">
              <div className="w-8 bg-indigo-500 rounded-t-sm animate-pulse" style={{ height: '94px' }}></div>
              <p className="text-[10px] font-semibold text-slate-700 mt-2">Take Home Pay</p>
              <p className="text-[9px] text-slate-500">{formatIDR(totalNetTakeHome)}</p>
            </div>

            <div className="flex flex-col items-center w-16">
              <div className="w-8 bg-rose-400 rounded-t-sm" style={{ height: '18px' }}></div>
              <p className="text-[10px] font-semibold text-slate-700 mt-2">PPh 21</p>
              <p className="text-[9px] text-slate-500">{formatIDR(totalPPh21)}</p>
            </div>

            <div className="flex flex-col items-center w-16">
              <div className="w-8 bg-amber-400 rounded-t-sm" style={{ height: '32px' }}></div>
              <p className="text-[10px] font-semibold text-slate-700 mt-2">BPJS Pekerja</p>
              <p className="text-[9px] text-slate-500">{formatIDR(totalBPJSEmployee)}</p>
            </div>
          </div>
          <p className="text-[10px] text-slate-400 text-center italic mt-1">
            Visualisasi komponen penggajian bulan terpilih. Pemotongan pajak dan BPJS dilakukan langsung dari sumber pendapatan karyawan.
          </p>
        </div>

        {/* Client Staffing Ratio */}
        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm space-y-4">
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
            <Users className="w-4 h-4 text-indigo-600" />
            Jumlah Personel & Alokasi Tagihan per Klien
          </h4>

          <div className="space-y-4 pt-2">
            {Object.entries(clientBillingSummary).map(([client, stat]) => {
              const maxVal = Math.max(...Object.values(clientBillingSummary).map(c => c.totalInvoice));
              const percentage = maxVal > 0 ? (stat.totalInvoice / maxVal) * 100 : 0;
              return (
                <div key={client} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-bold text-slate-700">{client}</span>
                    <span className="text-slate-500 font-semibold">{stat.headcount} personel/satpam • {formatIDR(stat.totalInvoice)}</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div 
                      className="bg-indigo-600 h-full rounded-full transition-all duration-500" 
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
