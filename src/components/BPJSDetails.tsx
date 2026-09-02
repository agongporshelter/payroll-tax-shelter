import { useState } from 'react';
import { Employee, SalaryMaster, BPJSConfig } from '../types';
import { calculateBPJS, getJKKRate } from '../utils/taxCalc';
import { Shield, Info, CheckCircle2, AlertTriangle, Search } from 'lucide-react';

interface BPJSDetailsProps {
  employees: Employee[];
  salaryMaster: SalaryMaster[];
  bpjsConfig: BPJSConfig;
}

export default function BPJSDetails({
  employees,
  salaryMaster,
  bpjsConfig
}: BPJSDetailsProps) {
  
  const [searchTerm, setSearchTerm] = useState('');

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

  // Compute grand totals
  let grandBasis = 0;
  let grandKesEmployer = 0;
  let grandKesEmployee = 0;
  let grandJhtEmployer = 0;
  let grandJhtEmployee = 0;
  let grandJpEmployer = 0;
  let grandJpEmployee = 0;
  let grandJkkEmployer = 0;
  let grandJkmEmployer = 0;
  let grandTotalEmployer = 0;
  let grandTotalEmployee = 0;

  const rowCalculations = filteredEmployees.map(emp => {
    const sal = salaryMaster.find(s => s.employeeId === emp.id) || { employeeId: emp.id, basicSalary: 0, fixedAllowance: 0, variableAllowance: 0 };
    const bpjsBasis = sal.basicSalary + sal.fixedAllowance;
    const jkkRate = getJKKRate(emp.jkkRiskClass);
    
    const bpjs = calculateBPJS(bpjsBasis, emp.bpjsActive, jkkRate, bpjsConfig.kesehatanCeiling, bpjsConfig.jpCeiling);
    
    if (emp.bpjsActive) {
      grandBasis += bpjsBasis;
      grandKesEmployer += bpjs.kesehatanEmployer;
      grandKesEmployee += bpjs.kesehatanEmployee;
      grandJhtEmployer += bpjs.jhtEmployer;
      grandJhtEmployee += bpjs.jhtEmployee;
      grandJpEmployer += bpjs.jpEmployer;
      grandJpEmployee += bpjs.jpEmployee;
      grandJkkEmployer += bpjs.jkkEmployer;
      grandJkmEmployer += bpjs.jkmEmployer;
      grandTotalEmployer += bpjs.totalEmployer;
      grandTotalEmployee += bpjs.totalEmployee;
    }

    return {
      emp,
      bpjsBasis,
      bpjs,
    };
  });

  return (
    <div className="space-y-6" id="bpjs-details-panel">
      
      {/* Informative Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex items-start space-x-3.5">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">BPJS Kesehatan (BPJS Kes)</h4>
            <p className="text-xs text-slate-500 mt-1">
              Pembagian: <strong>4% Ditanggung Pemberi Kerja (PK)</strong>, <strong>1% Ditanggung Pekerja (Karyawan)</strong>. 
              Batas atas (plafon) dasar perhitungan iuran adalah {formatIDR(bpjsConfig.kesehatanCeiling)}.
            </p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex items-start space-x-3.5">
          <Shield className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">BPJS Ketenagakerjaan (BPJS TK)</h4>
            <p className="text-xs text-slate-500 mt-1">
              JHT: <strong>3.7% PK</strong>, <strong>2% Karyawan</strong> (Tanpa plafon). 
              JP: <strong>2% PK</strong>, <strong>1% Karyawan</strong> (Plafon JP: {formatIDR(bpjsConfig.jpCeiling)}).
            </p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex items-start space-x-3.5 bg-amber-50/20 border-amber-100/50">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-xs font-bold text-amber-800 uppercase tracking-wide">JKK & JKM (Ditanggung Pemberi Kerja)</h4>
            <p className="text-xs text-amber-700 mt-1">
              Tarif JKK bervariasi tergantung pada kelas risiko lingkungan kerja (0,24% - 1,74%). JKM flat sebesar <strong>0,3%</strong>.
            </p>
          </div>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Cari karyawan atau unit klien..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 pr-4 py-2 w-full text-xs font-semibold rounded-lg border border-slate-200 text-slate-800 focus:outline-indigo-600"
          />
        </div>
      </div>

      {/* Big Detailed BPJS Sheet */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              {/* Main Headers */}
              <tr className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider text-[10px] border-b border-slate-100">
                <th className="py-3 px-4 rounded-tl-xl" rowSpan={2}>ID Karyawan</th>
                <th className="py-3 px-3" rowSpan={2}>Nama & Unit</th>
                <th className="py-3 px-3 text-right" rowSpan={2}>Upah Dasar BPJS</th>
                <th className="py-2 text-center border-b border-slate-100" colSpan={2}>BPJS Kesehatan (5%)</th>
                <th className="py-2 text-center border-b border-slate-100" colSpan={2}>BPJS JHT (5,7%)</th>
                <th className="py-2 text-center border-b border-slate-100" colSpan={2}>BPJS JP (3%)</th>
                <th className="py-2 text-center border-b border-slate-100" colSpan={2}>JKK & JKM (Pemberi Kerja)</th>
                <th className="py-3 px-3 text-right bg-slate-100/60 font-black" rowSpan={2}>Total Pemberi Kerja (PK)</th>
                <th className="py-3 px-3 text-right bg-indigo-50/50 text-indigo-950 font-black" rowSpan={2}>Total Pekerja (Karyawan)</th>
                <th className="py-3 px-4 text-right bg-emerald-50/40 text-emerald-950 font-black rounded-tr-xl" rowSpan={2}>Total Iuran</th>
              </tr>
              {/* Sub-headers for Splits */}
              <tr className="bg-slate-50/80 text-slate-500 font-semibold text-[9px] border-b border-slate-100">
                <th className="py-2 px-1 text-right">PK (4%)</th>
                <th className="py-2 px-1 text-right">Kary (1%)</th>
                <th className="py-2 px-1 text-right">PK (3,7%)</th>
                <th className="py-2 px-1 text-right">Kary (2%)</th>
                <th className="py-2 px-1 text-right">PK (2%)</th>
                <th className="py-2 px-1 text-right">Kary (1%)</th>
                <th className="py-2 px-1 text-right">JKK (Var)</th>
                <th className="py-2 px-1 text-right">JKM (0,3%)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {rowCalculations.map(({ emp, bpjsBasis, bpjs }) => {
                if (!emp.bpjsActive) {
                  return (
                    <tr key={emp.id} className="text-slate-400 bg-slate-50/30">
                      <td className="py-3 px-4 font-mono font-bold">{emp.id}</td>
                      <td className="py-3 px-3">
                        <p className="font-bold">{emp.name}</p>
                        <p className="text-[10px]">{emp.clientName}</p>
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-semibold">{formatIDR(bpjsBasis)}</td>
                      <td colSpan={10} className="py-3 px-4 text-center font-bold text-[10px] tracking-wide uppercase bg-slate-100/20">
                        Bebas BPJS (Karyawan tidak terdaftar BPJS di perusahaan ini)
                      </td>
                    </tr>
                  );
                }

                return (
                  <tr key={emp.id} className="hover:bg-slate-50/40 font-mono text-[11px]">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-800 text-xs">{emp.id}</td>
                    <td className="py-3.5 px-3 font-sans text-xs">
                      <p className="font-bold text-slate-800">{emp.name}</p>
                      <p className="text-[10px] text-slate-400 font-semibold uppercase">{emp.clientName}</p>
                    </td>
                    <td className="py-3.5 px-3 text-right font-semibold text-slate-600">{formatIDR(bpjsBasis)}</td>
                    
                    {/* Kesehatan ER/EE */}
                    <td className="py-3.5 px-1 text-right">{formatIDR(bpjs.kesehatanEmployer)}</td>
                    <td className="py-3.5 px-1 text-right text-indigo-700">{formatIDR(bpjs.kesehatanEmployee)}</td>
                    
                    {/* JHT ER/EE */}
                    <td className="py-3.5 px-1 text-right">{formatIDR(bpjs.jhtEmployer)}</td>
                    <td className="py-3.5 px-1 text-right text-indigo-700">{formatIDR(bpjs.jhtEmployee)}</td>
                    
                    {/* JP ER/EE */}
                    <td className="py-3.5 px-1 text-right">{formatIDR(bpjs.jpEmployer)}</td>
                    <td className="py-3.5 px-1 text-right text-indigo-700">{formatIDR(bpjs.jpEmployee)}</td>
                    
                    {/* JKK / JKM ER */}
                    <td className="py-3.5 px-1 text-right" title={`Tarif JKK: ${emp.jkkRiskClass}`}>{formatIDR(bpjs.jkkEmployer)}</td>
                    <td className="py-3.5 px-1 text-right">{formatIDR(bpjs.jkmEmployer)}</td>

                    {/* Grand Totals per Employee */}
                    <td className="py-3.5 px-3 text-right bg-slate-100/50 font-bold text-slate-800">{formatIDR(bpjs.totalEmployer)}</td>
                    <td className="py-3.5 px-3 text-right bg-indigo-50/40 text-indigo-950 font-bold">{formatIDR(bpjs.totalEmployee)}</td>
                    <td className="py-3.5 px-4 text-right bg-emerald-50/20 text-emerald-950 font-black text-xs">{formatIDR(bpjs.totalEmployer + bpjs.totalEmployee)}</td>
                  </tr>
                );
              })}

              {/* Grand Total Row */}
              <tr className="bg-slate-100 font-mono text-[11px] font-black text-slate-900 border-t-2 border-slate-200">
                <td className="py-4 px-4 font-sans text-xs uppercase" colSpan={2}>Total Buku Besar BPJS</td>
                <td className="py-4 px-3 text-right font-bold">{formatIDR(grandBasis)}</td>
                <td className="py-4 px-1 text-right">{formatIDR(grandKesEmployer)}</td>
                <td className="py-4 px-1 text-right text-indigo-900">{formatIDR(grandKesEmployee)}</td>
                <td className="py-4 px-1 text-right">{formatIDR(grandJhtEmployer)}</td>
                <td className="py-4 px-1 text-right text-indigo-900">{formatIDR(grandJhtEmployee)}</td>
                <td className="py-4 px-1 text-right">{formatIDR(grandJpEmployer)}</td>
                <td className="py-4 px-1 text-right text-indigo-900">{formatIDR(grandJpEmployee)}</td>
                <td className="py-4 px-1 text-right">{formatIDR(grandJkkEmployer)}</td>
                <td className="py-4 px-1 text-right">{formatIDR(grandJkmEmployer)}</td>
                <td className="py-4 px-3 text-right bg-slate-200/60 font-black">{formatIDR(grandTotalEmployer)}</td>
                <td className="py-4 px-3 text-right bg-indigo-100/60 text-indigo-950 font-black">{formatIDR(grandTotalEmployee)}</td>
                <td className="py-4 px-4 text-right bg-emerald-100/50 text-emerald-950 font-black text-xs">{formatIDR(grandTotalEmployer + grandTotalEmployee)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
