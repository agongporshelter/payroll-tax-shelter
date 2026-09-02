import { useState } from 'react';
import { TER_A, TER_B, TER_C, getTERCategory, getTERRate } from '../utils/taxCalc';
import { PTKPStatus } from '../types';
import { Calculator, Search, Shield, Info, ArrowRight, HelpCircle } from 'lucide-react';

export default function TERTable() {
  const [activeCategory, setActiveCategory] = useState<'A' | 'B' | 'C'>('A');
  const [calcIncome, setCalcIncome] = useState<number>(7500000);
  const [calcStatus, setCalcStatus] = useState<PTKPStatus>('TK/0');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const formatIDR = (num: number) => {
    if (num === Infinity) return 'Infinity';
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(num);
  };

  const getBrackets = () => {
    switch (activeCategory) {
      case 'A': return TER_A;
      case 'B': return TER_B;
      case 'C': return TER_C;
    }
  };

  const getCategoryInfo = (cat: 'A' | 'B' | 'C') => {
    switch (cat) {
      case 'A':
        return {
          title: 'TER Bulanan Kategori A',
          status: 'TK/0, TK/1, K/0',
          desc: 'Diberlakukan bagi wajib pajak dengan status PTKP Tidak Kawin tanpa tanggungan (TK/0), Tidak Kawin dengan 1 tanggungan (TK/1), atau Kawin tanpa tanggungan (K/0).'
        };
      case 'B':
        return {
          title: 'TER Bulanan Kategori B',
          status: 'TK/2, TK/3, K/1, K/2',
          desc: 'Diberlakukan bagi wajib pajak dengan status PTKP Tidak Kawin dengan 2 tanggungan (TK/2), Tidak Kawin dengan 3 tanggungan (TK/3), Kawin dengan 1 tanggungan (K/1), atau Kawin dengan 2 tanggungan (K/2).'
        };
      case 'C':
        return {
          title: 'TER Bulanan Kategori C',
          status: 'K/3',
          desc: 'Diberlakukan bagi wajib pajak dengan status PTKP Kawin dengan 3 tanggungan (K/3).'
        };
    }
  };

  const activeBrackets = getBrackets();
  const catInfo = getCategoryInfo(activeCategory);

  // Filter brackets based on search term (can search by rate or range values)
  const filteredBrackets = activeBrackets.filter(b => {
    if (!searchTerm) return true;
    const rateText = (b.rate * 100).toFixed(2) + '%';
    const minText = b.min.toString();
    const maxText = b.max.toString();
    return (
      rateText.includes(searchTerm) ||
      minText.includes(searchTerm) ||
      maxText.includes(searchTerm)
    );
  });

  // Calculate live estimate for Calculator
  const estimatedCategory = getTERCategory(calcStatus);
  const estimatedRate = getTERRate(estimatedCategory, calcIncome);
  const estimatedTax = Math.floor(calcIncome * estimatedRate);

  return (
    <div className="space-y-6" id="ter-table-panel">
      {/* Informational Header */}
      <div className="bg-slate-50 border border-slate-200/60 p-4 rounded-xl flex items-start space-x-3 shadow-sm">
        <Info className="w-5 h-5 text-indigo-600 mt-0.5 shrink-0" />
        <div>
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide">Tarif Efektif Rata-rata (TER) PPh 21</h3>
          <p className="text-xs text-slate-600 mt-1 leading-relaxed">
            Sesuai Peraturan Pemerintah Nomor 58 Tahun 2023 dan Peraturan Menteri Keuangan Nomor 168/2023, perhitungan PPh Pasal 21 Masa (Januari - November) menggunakan Tarif Efektif Rata-rata (TER). 
            TER dibagi menjadi tiga kategori utama berdasarkan status PTKP wajib pajak.
          </p>
        </div>
      </div>

      {/* Calculator Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Interactive Calculator */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/60 shadow-sm space-y-4 lg:col-span-1">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide flex items-center gap-2 border-b border-slate-100 pb-3">
            <Calculator className="w-4 h-4 text-indigo-600" />
            TER Rate Estimator
          </h3>

          <div className="space-y-3">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide">
                Penghasilan Bruto Bulanan (Gross Monthly Income)
              </label>
              <div className="mt-1.5 relative rounded-lg shadow-sm">
                <input
                  type="number"
                  value={calcIncome}
                  onChange={(e) => setCalcIncome(parseFloat(e.target.value) || 0)}
                  className="block w-full text-xs font-semibold rounded-lg border border-slate-200 pl-3 pr-12 py-2 text-slate-800 focus:outline-indigo-600"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <span className="text-[10px] font-bold text-slate-400">IDR</span>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide">
                Status PTKP (Tax Status)
              </label>
              <select
                value={calcStatus}
                onChange={(e) => setCalcStatus(e.target.value as PTKPStatus)}
                className="mt-1.5 block w-full text-xs font-semibold rounded-lg border border-slate-200 px-3 py-2 text-slate-800 focus:outline-indigo-600"
              >
                <option value="TK/0">TK/0 (Tidak Kawin, 0 Tanggungan)</option>
                <option value="TK/1">TK/1 (Tidak Kawin, 1 Tanggungan)</option>
                <option value="TK/2">TK/2 (Tidak Kawin, 2 Tanggungan)</option>
                <option value="TK/3">TK/3 (Tidak Kawin, 3 Tanggungan)</option>
                <option value="K/0">K/0 (Kawin, 0 Tanggungan)</option>
                <option value="K/1">K/1 (Kawin, 1 Tanggungan)</option>
                <option value="K/2">K/2 (Kawin, 2 Tanggungan)</option>
                <option value="K/3">K/3 (Kawin, 3 Tanggungan)</option>
              </select>
            </div>
          </div>

          <div className="bg-indigo-950 text-indigo-100 p-4 rounded-xl space-y-3 shadow-inner">
            <h4 className="text-[10px] font-bold text-indigo-300 uppercase tracking-widest">Hasil Perkiraan TER</h4>
            
            <div className="grid grid-cols-2 gap-2 text-xs border-b border-indigo-900 pb-2">
              <div>
                <p className="text-[9px] text-indigo-400">Kategori TER</p>
                <p className="font-extrabold text-white text-base">Kategori {estimatedCategory}</p>
              </div>
              <div>
                <p className="text-[9px] text-indigo-400">Tarif TER</p>
                <p className="font-extrabold text-amber-400 text-base">{(estimatedRate * 100).toFixed(2)}%</p>
              </div>
            </div>

            <div>
              <p className="text-[9px] text-indigo-400 uppercase tracking-wide font-semibold">Estimasi Potongan PPh 21</p>
              <p className="font-black text-white text-lg font-mono mt-0.5">{formatIDR(estimatedTax)}</p>
            </div>

            <div className="bg-indigo-900/40 p-2.5 rounded-lg border border-indigo-850 text-[10px] text-indigo-300 flex items-start gap-1.5">
              <HelpCircle className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
              <span>
                PPh 21 ini dihitung menggunakan formula: <strong className="text-white">Penghasilan Bruto &times; Tarif TER</strong>. Berlaku untuk masa pajak bulanan selain Desember.
              </span>
            </div>
          </div>
        </div>

        {/* Right Tabbed Category Details and Table */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/60 shadow-sm space-y-4 lg:col-span-2 flex flex-col">
          
          {/* Tabs header */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 flex-wrap gap-2">
            <div className="flex gap-1.5 bg-slate-100 p-1 rounded-lg">
              {(['A', 'B', 'C'] as const).map(cat => (
                <button
                  key={cat}
                  onClick={() => {
                    setActiveCategory(cat);
                    // Match a suitable status for calc to show compatibility
                    if (cat === 'A') setCalcStatus('TK/0');
                    if (cat === 'B') setCalcStatus('K/1');
                    if (cat === 'C') setCalcStatus('K/3');
                  }}
                  className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${
                    activeCategory === cat
                      ? 'bg-white text-indigo-600 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  Kategori {cat}
                </button>
              ))}
            </div>

            {/* Inline search */}
            <div className="relative rounded-md shadow-sm w-full sm:w-48">
              <Search className="absolute left-2.5 top-2 w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Cari tarif / batas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 pr-3 py-1.5 w-full text-xs font-medium rounded-lg border border-slate-200 text-slate-800 focus:outline-indigo-600"
              />
            </div>
          </div>

          {/* Active category explanation */}
          <div className="p-3.5 bg-indigo-50/50 rounded-xl border border-indigo-100/60 space-y-1">
            <h4 className="text-xs font-black text-indigo-950 flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-indigo-600" />
              {catInfo.title} <span className="text-[10px] px-1.5 py-0.5 bg-indigo-100 text-indigo-800 rounded font-bold">Status: {catInfo.status}</span>
            </h4>
            <p className="text-[11px] text-indigo-900 leading-relaxed font-semibold">{catInfo.desc}</p>
          </div>

          {/* Brackets spreadsheet view */}
          <div className="overflow-y-auto max-h-[350px] border border-slate-100 rounded-xl">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-100 sticky top-0 bg-white shadow-sm">
                  <th className="py-2.5 px-4 text-center">No.</th>
                  <th className="py-2.5 px-3">Batas Minimum Bruto (Min)</th>
                  <th className="py-2.5 px-3">Batas Maksimum Bruto (Max)</th>
                  <th className="py-2.5 px-3 text-center">Tarif TER (%)</th>
                  <th className="py-2.5 px-4 text-right">Potongan pada Batas Max</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-mono text-[11px]">
                {filteredBrackets.length > 0 ? (
                  filteredBrackets.map((b, idx) => {
                    const sampleVal = b.max === Infinity ? b.min * 1.2 : b.max;
                    const sampleTax = Math.floor(sampleVal * b.rate);
                    return (
                      <tr 
                        key={idx} 
                        className={`hover:bg-slate-50/70 transition-colors ${
                          calcIncome > b.min && calcIncome <= b.max ? 'bg-amber-50/50 text-slate-900 font-bold border-l-2 border-amber-500' : ''
                        }`}
                      >
                        <td className="py-2 px-4 text-center text-slate-400 font-bold">{idx + 1}</td>
                        <td className="py-2 px-3">{formatIDR(b.min)}</td>
                        <td className="py-2 px-3">{b.max === Infinity ? 'Tidak Terbatas' : formatIDR(b.max)}</td>
                        <td className="py-2 px-3 text-center text-indigo-600 font-bold">{(b.rate * 100).toFixed(2)}%</td>
                        <td className="py-2 px-4 text-right text-slate-500 font-semibold">
                          {b.rate === 0 ? '-' : formatIDR(sampleTax)}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400 italic">
                      Tidak ditemukan data kecocokan batas TER.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          <div className="pt-2 flex justify-between items-center text-[10px] text-slate-400">
            <span className="italic">* Baris berwarna kuning muda adalah batas TER yang saat ini aktif di Calculator.</span>
            <span>PP 58/2023 &bull; PMK 168/2023</span>
          </div>

        </div>
      </div>
    </div>
  );
}
