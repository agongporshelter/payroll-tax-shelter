import { useState } from 'react';
import { Employee, SalaryMaster, AttendanceOT, VariableInput, TaxParameters, CustomComponent } from '../types';
import { 
  calculateMonthlyPayroll, 
  getTERCategory, 
  getTERRate, 
  getPTKPValue,
  calculateArticle17Tax,
  MonthlyPayRecord,
  calculateAnnualReconciliation
} from '../utils/taxCalc';
import { Landmark, Search, HelpCircle, FileText, Settings, ArrowRight, UserCheck, ShieldAlert, Sparkles, Check } from 'lucide-react';

interface PPh21DetailsProps {
  employees: Employee[];
  salaryMaster: SalaryMaster[];
  attendanceOT: AttendanceOT[];
  variables: VariableInput[];
  selectedMonth: number;
  taxParams: TaxParameters;
  customComponents?: CustomComponent[];
}

export default function PPh21Details({
  employees,
  salaryMaster,
  attendanceOT,
  variables,
  selectedMonth,
  taxParams,
  customComponents = []
}: PPh21DetailsProps) {
  
  const [selectedEmpId, setSelectedEmpId] = useState(employees[0]?.id || '');
  const [showAnnualRecon, setShowAnnualRecon] = useState(false);

  const formatIDR = (num: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(num);
  };

  const selectedEmp = employees.find(e => e.id === selectedEmpId);
  
  // Compute monthly details for the selected employee
  const getEmpMonthlyCalculation = (empId: string, month: number) => {
    const emp = employees.find(e => e.id === empId);
    if (!emp) return null;
    
    const sal = salaryMaster.find(s => s.employeeId === empId && s.month === month) || salaryMaster.find(s => s.employeeId === empId) || { employeeId: empId, basicSalary: 0, fixedAllowance: 0, variableAllowance: 0 };
    const att = attendanceOT.find(a => a.employeeId === empId && a.month === month) || { employeeId: empId, month, actualWorkDays: 22, unpaidLeaveDays: 0, otHours: 0 };
    const v = variables.find(varItem => varItem.employeeId === empId && varItem.month === month) || { employeeId: empId, month, bonus: 0, incentive: 0, loanDeduction: 0, otherDeduction: 0, customValues: {} };
    
    return calculateMonthlyPayroll(emp, sal, att, v, 12000000, 10400000, 0, customComponents);
  };

  const calc = getEmpMonthlyCalculation(selectedEmpId, selectedMonth);

  // Programmatically generate the full 12 months history for annual reconciliation
  const get12MonthHistory = (empId: string): MonthlyPayRecord[] => {
    const list: MonthlyPayRecord[] = [];
    for (let m = 1; m <= 12; m++) {
      const c = getEmpMonthlyCalculation(empId, m);
      if (c) {
        list.push({
          month: m,
          grossTaxableForPPh21: c.grossTaxableForPPh21,
          pph21Paid: c.pph21Tax,
          basicSalary: c.basicSalary,
          fixedAllowance: c.fixedAllowance,
          employeeJht: c.bpjs.jhtEmployee,
          employeeJp: c.bpjs.jpEmployee
        });
      }
    }
    return list;
  };

  const history = get12MonthHistory(selectedEmpId);
  const annualRecon = selectedEmp 
    ? calculateAnnualReconciliation(selectedEmp, salaryMaster.find(s => s.employeeId === selectedEmpId && s.month === 12) || salaryMaster.find(s => s.employeeId === selectedEmpId)!, history, taxParams.ptkpRates)
    : null;

  const terCategory = selectedEmp ? getTERCategory(selectedEmp.ptkpStatus) : 'A';
  const monthNames = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
  ];

  return (
    <div className="space-y-6" id="pph21-details-panel">
      
      {/* Selector Panel */}
      <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4">
        <div className="flex items-center space-x-3">
          <Landmark className="w-6 h-6 text-indigo-600 shrink-0" />
          <div>
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">Audit Kepatuhan Perhitungan PPh 21</h3>
            <p className="text-xs text-slate-500">Pilih karyawan untuk melihat detail audit TER bulanan atau rekonsiliasi progresif Pasal 17 UU PPh di bulan Desember.</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <select
            value={selectedEmpId}
            onChange={(e) => {
              setSelectedEmpId(e.target.value);
              setShowAnnualRecon(false); // reset
            }}
            className="px-3.5 py-2 text-xs font-semibold rounded-lg border border-slate-200 text-slate-800 bg-white focus:outline-indigo-600"
          >
            {employees.map(emp => (
              <option key={emp.id} value={emp.id}>{emp.id} - {emp.name} ({emp.clientName})</option>
            ))}
          </select>

          <button
            onClick={() => setShowAnnualRecon(!showAnnualRecon)}
            className={`px-3.5 py-2 text-xs font-bold rounded-lg flex items-center gap-1.5 cursor-pointer transition-colors ${showAnnualRecon ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'border border-slate-200 text-slate-700 hover:bg-slate-50'}`}
          >
            <Sparkles className="w-4 h-4" />
            {showAnnualRecon ? 'Lihat Audit TER Bulanan' : 'Jalankan Rekonsiliasi Pasal 17 Tahunan'}
          </button>
        </div>
      </div>

      {selectedEmp && calc && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Employee Summary Card */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-wide">Profil Audit Karyawan</p>
                <h3 className="text-base font-black text-slate-900 mt-1">{selectedEmp.name}</h3>
                <p className="text-xs text-slate-500 font-medium">{selectedEmp.id} • {selectedEmp.department}</p>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between p-2 rounded bg-slate-50">
                  <span className="text-slate-500 font-semibold">Lokasi Kerja Klien:</span>
                  <span className="font-bold text-slate-700">{selectedEmp.clientName}</span>
                </div>
                <div className="flex justify-between p-2 rounded bg-slate-50">
                  <span className="text-slate-500 font-semibold">Kode PTKP:</span>
                  <span className="font-bold text-indigo-600">{selectedEmp.ptkpStatus}</span>
                </div>
                <div className="flex justify-between p-2 rounded bg-slate-50">
                  <span className="text-slate-500 font-semibold">Batas PTKP (Setahun):</span>
                  <span className="font-bold text-slate-700">{formatIDR(getPTKPValue(selectedEmp.ptkpStatus))}</span>
                </div>
                <div className="flex justify-between p-2 rounded bg-slate-50">
                  <span className="text-slate-500 font-semibold">Kategori TER:</span>
                  <span className="font-bold text-emerald-700">Kategori {terCategory}</span>
                </div>
                <div className="flex justify-between p-2 rounded bg-slate-50">
                  <span className="text-slate-500 font-semibold">Status BPJS:</span>
                  <span className={`px-1.5 py-0.5 font-bold rounded text-[10px] uppercase ${selectedEmp.bpjsActive ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-500'}`}>
                    {selectedEmp.bpjsActive ? 'BPJS Aktif' : 'Bebas BPJS'}
                  </span>
                </div>
              </div>
            </div>

            {/* Informational Guidance */}
            <div className="bg-indigo-950 text-indigo-100 p-5 rounded-xl space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4 text-indigo-300" />
                Regulasi Perpajakan Indonesia
              </h4>
              <p className="text-[11px] text-indigo-200 leading-relaxed text-justify">
                Berdasarkan <strong>PP 58/2023</strong> dan <strong>PMK 168/2023</strong>, PPh 21 bulanan menggunakan Tarif Efektif Rata-rata (TER) berdasarkan penghasilan bruto. 
                Pada bulan Desember (atau masa pajak terakhir), seluruh penghasilan setahun digabungkan, dikurangi biaya jabatan dan iuran yang diperbolehkan, 
                lalu dihitung menggunakan tarif progresif Pasal 17 ayat (1) huruf a UU PPh untuk menentukan jumlah pajak terutang setahun.
              </p>
            </div>
          </div>

          {/* Core Calculation Panel (Monthly TER vs Annual Article 17) */}
          <div className="lg:col-span-8 bg-white p-6 rounded-xl border border-slate-100 shadow-sm space-y-6">
            
            {!showAnnualRecon ? (
              // Monthly TER Audit Sheet
              <div className="space-y-6 animate-fadeIn">
                <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
                  <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                    <FileText className="w-5 h-5 text-indigo-600" />
                    Bulan {selectedMonth} ({monthNames[selectedMonth - 1]}) - Audit Perhitungan TER Bulanan
                  </h3>
                  <span className="px-2.5 py-1 rounded bg-indigo-50 text-indigo-700 text-xs font-black">Rutin Bulanan</span>
                </div>

                {/* Step-by-Step Gross Formulation */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-500 uppercase">Langkah 1: Perhitungan Penghasilan Bruto (Kena Pajak PPh 21)</h4>
                  
                  <div className="border border-slate-100 rounded-lg overflow-hidden text-xs">
                    <div className="bg-slate-50 p-3 font-bold border-b border-slate-100 flex justify-between">
                      <span>Penghasilan Kompensasi Tunai Bruto</span>
                      <span className="font-mono text-slate-800">{formatIDR(calc.totalEarningsCash)}</span>
                    </div>
                    <div className="p-3 divide-y divide-slate-100/60 bg-white/50 text-slate-600">
                      <div className="py-2 flex justify-between">
                        <span>Gaji Pokok</span>
                        <span className="font-mono">{formatIDR(calc.basicSalary)}</span>
                      </div>
                      <div className="py-2 flex justify-between">
                        <span>Tunjangan Tetap</span>
                        <span className="font-mono">{formatIDR(calc.fixedAllowance)}</span>
                      </div>
                      <div className="py-2 flex justify-between">
                        <span>Tunjangan Tidak Tetap / Tunjangan Variabel</span>
                        <span className="font-mono">{formatIDR(calc.variableAllowance)}</span>
                      </div>
                      <div className="py-2 flex justify-between text-emerald-700 font-semibold">
                        <span>Upah Kerja Lembur (Overtime)</span>
                        <span className="font-mono">{formatIDR(calc.otPay)}</span>
                      </div>
                      <div className="py-2 flex justify-between text-emerald-700 font-semibold">
                        <span>Bonus & Tunjangan Hari Raya (THR)</span>
                        <span className="font-mono">{formatIDR(calc.bonus)}</span>
                      </div>
                      <div className="py-2 flex justify-between text-emerald-700 font-semibold">
                        <span>Insentif Performa</span>
                        <span className="font-mono">{formatIDR(calc.incentive)}</span>
                      </div>
                      {calc.unpaidLeaveDeduction > 0 && (
                        <div className="py-2 flex justify-between text-rose-600 font-semibold">
                          <span>Potongan Mangkir (Absen)</span>
                          <span className="font-mono">-{formatIDR(calc.unpaidLeaveDeduction)}</span>
                        </div>
                      )}
                    </div>
                    
                    {/* Non-cash Taxable Benefits */}
                    <div className="bg-slate-50 p-3 font-bold border-t border-b border-slate-100 flex justify-between">
                      <span>Premi BPJS Dibayar Pemberi Kerja (Tunjangan JKK, JKM, BPJS Kes)</span>
                      <span className="font-mono text-slate-800">{formatIDR(calc.bpjsTaxableEmployerPortion)}</span>
                    </div>
                    <div className="p-3 divide-y divide-slate-100/60 bg-white/50 text-slate-600">
                      <div className="py-2 flex justify-between">
                        <span>BPJS Kesehatan (4% Ditanggung Perusahaan)</span>
                        <span className="font-mono">{formatIDR(calc.bpjs.kesehatanEmployer)}</span>
                      </div>
                      <div className="py-2 flex justify-between">
                        <span>BPJS JKK ({calc.jkkRiskClass} premi risiko)</span>
                        <span className="font-mono">{formatIDR(calc.bpjs.jkkEmployer)}</span>
                      </div>
                      <div className="py-2 flex justify-between">
                        <span>BPJS JKM (0,3% premi kematian)</span>
                        <span className="font-mono">{formatIDR(calc.bpjs.jkmEmployer)}</span>
                      </div>
                    </div>

                    {/* Total Formulation */}
                    <div className="bg-indigo-950 text-indigo-50 p-3.5 font-bold flex justify-between text-xs">
                      <span>Total Penghasilan Bruto (Dasar Pengenaan TER PPh 21)</span>
                      <span className="font-mono text-sm">{formatIDR(calc.grossTaxableForPPh21)}</span>
                    </div>
                  </div>
                </div>

                {/* Step-by-Step TER Rule */}
                <div className="space-y-3 pt-3 border-t border-slate-100">
                  <h4 className="text-xs font-bold text-slate-500 uppercase">Langkah 2: Tentukan Tarif TER Bulanan</h4>
                  <div className="bg-slate-50 p-4 rounded-lg flex flex-col sm:flex-row justify-between gap-4 text-xs font-semibold text-slate-700">
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase">Pemetaan Status PTKP</p>
                      <p className="text-sm font-black text-slate-800 mt-1">{selectedEmp.ptkpStatus} &rarr; Kategori {terCategory}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase">Rentang Penghasilan Bruto</p>
                      <p className="text-sm font-black text-slate-800 mt-1">{formatIDR(calc.grossTaxableForPPh21)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase">Tarif TER Diberlakukan</p>
                      <p className="text-sm font-black text-indigo-700 mt-1">{(calc.terRate * 100).toFixed(2)}%</p>
                    </div>
                  </div>
                </div>

                {/* Final Tax Result */}
                <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl flex justify-between items-center text-emerald-950">
                  <div>
                    <h5 className="text-xs font-bold uppercase tracking-wider text-emerald-800">Pajak PPh 21 Bulanan Final</h5>
                    <p className="text-[11px] text-emerald-700 mt-1">Dihitung sebagai {formatIDR(calc.grossTaxableForPPh21)} * {(calc.terRate * 100).toFixed(2)}%</p>
                  </div>
                  <p className="text-lg font-black font-mono">{formatIDR(calc.pph21Tax)}</p>
                </div>
              </div>
            ) : (
              // Annual / December Reconciliation Sheet
              annualRecon && (
                <div className="space-y-6 animate-fadeIn">
                  <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
                    <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                      <Settings className="w-5 h-5 text-indigo-600" />
                      Rekonsiliasi Pajak Progresif Pasal 17 Akhir Tahun (Desember)
                    </h3>
                    <span className="px-2.5 py-1 rounded bg-rose-50 text-rose-700 text-xs font-black">Penyesuaian Akhir Tahun</span>
                  </div>

                  {/* Step 1: Cumulative Aggregate Gross */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-slate-500 uppercase">Langkah 1: Akumulasi Penghasilan Bruto Setahun</h4>
                    <div className="p-3 bg-slate-50 rounded-lg flex justify-between items-center text-xs">
                      <div>
                        <p className="font-bold text-slate-800">Akumulasi Bruto Setahun (Bulan 1-12)</p>
                        <p className="text-[10px] text-slate-500 font-medium">Mencakup seluruh gaji dasar, lembur, bonus, THR, dan premi BPJS ditanggung pemberi kerja.</p>
                      </div>
                      <span className="font-mono font-bold text-slate-800 text-sm">{formatIDR(annualRecon.annualGrossTaxable)}</span>
                    </div>
                  </div>

                  {/* Step 2: Legal Deductions */}
                  <div className="space-y-3 pt-2">
                    <h4 className="text-xs font-bold text-slate-500 uppercase">Langkah 2: Dikurangi Pengurang yang Diperbolehkan</h4>
                    <div className="border border-slate-100 rounded-lg overflow-hidden text-xs text-slate-600">
                      <div className="py-2.5 px-3 bg-slate-50/50 font-bold border-b border-slate-100 flex justify-between">
                        <span>Biaya Jabatan (Maksimal Rp 6.000.000 / tahun atau 5% dari bruto)</span>
                        <span className="font-mono">-{formatIDR(annualRecon.actualBiayaJabatan)}</span>
                      </div>
                      <div className="py-2.5 px-3 bg-slate-50/50 font-bold border-b border-slate-100 flex justify-between">
                        <span>Iuran JHT (2% iuran pekerja - pengurang pajak)</span>
                        <span className="font-mono">-{formatIDR(annualRecon.annualJhtEmployee)}</span>
                      </div>
                      <div className="py-2.5 px-3 bg-slate-50/50 font-bold border-b border-slate-100 flex justify-between">
                        <span>Iuran JP (1% iuran pekerja - pengurang pajak)</span>
                        <span className="font-mono">-{formatIDR(annualRecon.annualJpEmployee)}</span>
                      </div>
                      <div className="py-3 px-3 bg-indigo-950 text-indigo-50 font-bold flex justify-between">
                        <span>Total Penghasilan Neto Setahun</span>
                        <span className="font-mono">{formatIDR(annualRecon.netAnnualIncome)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Step 3: PTKP Deductions */}
                  <div className="space-y-3 pt-2">
                    <h4 className="text-xs font-bold text-slate-500 uppercase">Langkah 3: Dikurangi Penghasilan Tidak Kena Pajak (PTKP)</h4>
                    <div className="border border-slate-100 rounded-lg overflow-hidden text-xs text-slate-600">
                      <div className="py-2.5 px-3 bg-slate-50/50 font-bold border-b border-slate-100 flex justify-between">
                        <span>PTKP Pengurang Pajak (Berdasarkan {selectedEmp.ptkpStatus})</span>
                        <span className="font-mono font-bold text-indigo-600">-{formatIDR(annualRecon.ptkpValue)}</span>
                      </div>
                      <div className="py-3 px-3 bg-slate-900 text-white font-bold flex justify-between">
                        <span>Penghasilan Kena Pajak (PKP) - Dibulatkan ke ribuan ke bawah</span>
                        <span className="font-mono">{formatIDR(annualRecon.pkpRounded)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Step 4: Progressive Tax Slabs */}
                  <div className="space-y-3 pt-2">
                    <h4 className="text-xs font-bold text-slate-500 uppercase">Langkah 4: Hitung dengan Tarif Progresif Pasal 17 UU PPh</h4>
                    <div className="bg-slate-50 p-4 rounded-lg text-xs space-y-2">
                      <p className="font-semibold text-slate-700">Tarif progresif yang diterapkan untuk PKP {formatIDR(annualRecon.pkpRounded)}:</p>
                      <div className="divide-y divide-slate-200/60 text-slate-500 font-medium">
                        <div className="py-1.5 flex justify-between">
                          <span>Lapisan 1 (5% untuk Rp 60.000.000 pertama)</span>
                          <span className="font-mono text-slate-700 font-bold">
                            {formatIDR(Math.min(annualRecon.pkpRounded, 60000000) * 0.05)}
                          </span>
                        </div>
                        {annualRecon.pkpRounded > 60000000 && (
                          <div className="py-1.5 flex justify-between">
                            <span>Lapisan 2 (15% untuk Rp 60.000.000 s/d Rp 250.000.000)</span>
                            <span className="font-mono text-slate-700 font-bold">
                              {formatIDR(Math.min(Math.max(0, annualRecon.pkpRounded - 60000000), 190000000) * 0.15)}
                            </span>
                          </div>
                        )}
                        {annualRecon.pkpRounded > 250000000 && (
                          <div className="py-1.5 flex justify-between">
                            <span>Lapisan 3 (25% untuk Rp 250.000.000 s/d Rp 500.000.000)</span>
                            <span className="font-mono text-slate-700 font-bold">
                              {formatIDR(Math.min(Math.max(0, annualRecon.pkpRounded - 250000000), 250000000) * 0.25)}
                            </span>
                          </div>
                        )}
                        <div className="py-2 flex justify-between text-indigo-950 font-black text-xs border-t border-slate-200 mt-2">
                          <span>Total Liabilitas Pajak PPh 21 Terutang Setahun</span>
                          <span className="font-mono">{formatIDR(annualRecon.annualPPh21Tax)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Step 5: Final December Balancing Adjustment */}
                  <div className="space-y-3 pt-2 border-t border-slate-100">
                    <h4 className="text-xs font-bold text-slate-500 uppercase">Langkah 5: Perhitungan Lebih/Kurang Bayar Desember (Balancing)</h4>
                    
                    <div className="grid grid-cols-2 gap-4 text-xs font-semibold text-slate-700">
                      <div className="p-3.5 bg-slate-50 rounded-lg">
                        <p className="text-[10px] text-slate-400 font-bold uppercase">PPh 21 Telah Dipotong (TER Jan-Nov)</p>
                        <p className="text-base font-black text-slate-800 mt-1 font-mono">{formatIDR(annualRecon.pph21PaidJanNov)}</p>
                      </div>
                      <div className="p-3.5 bg-indigo-50 rounded-lg">
                        <p className="text-[10px] text-indigo-400 font-bold uppercase">PPh 21 Kurang/Lebih Bayar Desember</p>
                        <p className="text-base font-black text-indigo-950 mt-1 font-mono">{formatIDR(annualRecon.decemberPPh21Reconciled)}</p>
                      </div>
                    </div>

                    <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl flex justify-between items-center text-emerald-950">
                      <div>
                        <h5 className="text-xs font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1">
                          <Check className="w-4 h-4" />
                          Status Rekonsiliasi Tahunan Selesai
                        </h5>
                        <p className="text-[11px] text-emerald-700 mt-1">
                          Penyesuaian pajak bulan Desember telah selesai. Akumulasi penghasilan setahun telah dievaluasi, PTKP dikurangkan, dan tarif Pasal 17 telah diterapkan dengan sukses.
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] text-emerald-600 font-bold uppercase">PPh 21 Desember Disesuaikan</p>
                        <p className="text-lg font-black font-mono mt-0.5">{formatIDR(annualRecon.decemberPPh21Reconciled)}</p>
                      </div>
                    </div>
                  </div>

                </div>
              )
            )}

          </div>

        </div>
      )}

    </div>
  );
}
