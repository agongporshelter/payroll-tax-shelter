import { PTKPStatus, JKKRiskClass, BPJSConfig, TaxParameters } from '../types';
import { getPTKPValue } from '../utils/taxCalc';
import { HelpCircle, Percent, Shield, Landmark } from 'lucide-react';

interface ParametersProps {
  bpjsConfig: BPJSConfig;
  taxParams: TaxParameters;
  onUpdateBPJS: (config: BPJSConfig) => void;
  onUpdateTax: (params: TaxParameters) => void;
}

export default function Parameters({
  bpjsConfig,
  taxParams,
  onUpdateBPJS,
  onUpdateTax
}: ParametersProps) {
  
  const ptkpKeys: PTKPStatus[] = ['TK/0', 'TK/1', 'TK/2', 'TK/3', 'K/0', 'K/1', 'K/2', 'K/3'];
  const jkkRiskClasses: { name: JKKRiskClass; rate: string; desc: string }[] = [
    { name: 'Class I (0.24%)', rate: '0.24%', desc: 'Sangat Rendah (Sektor Perkantoran, Administrasi)' },
    { name: 'Class II (0.54%)', rate: '0.54%', desc: 'Rendah (Sektor Jasa Finansial, Perdagangan)' },
    { name: 'Class III (0.89%)', rate: '0.89%', desc: 'Sedang (Sektor Keamanan, Guarding, Driver, Facility)' },
    { name: 'Class IV (1.27%)', rate: '1.27%', desc: 'Tinggi (Sektor Manufaktur, Konstruksi Ringan)' },
    { name: 'Class V (1.74%)', rate: '1.74%', desc: 'Sangat Tinggi (Sektor Konstruksi Berat, Pertambangan)' }
  ];

  const formatIDR = (num: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(num);
  };

  return (
    <div className="space-y-6" id="parameters-panel">
      
      {/* Informative Header Banner */}
      <div className="bg-slate-50 border border-slate-200/60 p-4 rounded-xl flex items-start space-x-3">
        <HelpCircle className="w-5 h-5 text-indigo-600 mt-0.5 shrink-0" />
        <div>
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide">Mesin Regulasi Terpusat</h3>
          <p className="text-xs text-slate-600 mt-1">
            Iuran BPJS Indonesia, tarif pajak, dan batas PTKP telah dikalibrasi untuk tahun 2026 sesuai peraturan terbaru. 
            Mengubah batas parameter di sini akan langsung memperbarui kalkulasi penggajian di seluruh lembar kerja.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Tax Parameters Panel */}
        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm space-y-6">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-3 flex items-center gap-2">
            <Landmark className="w-5 h-5 text-indigo-600" />
            Batas PTKP & Parameter PPh 21
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase">Biaya Jabatan (Tarif & Batas Bulanan Maksimal)</label>
              <div className="mt-1.5 flex gap-2">
                <div className="relative rounded-md shadow-sm w-1/3">
                  <input
                    type="number"
                    value={taxParams.biayaJabatanRate * 100}
                    onChange={(e) => onUpdateTax({ ...taxParams, biayaJabatanRate: parseFloat(e.target.value) / 100 })}
                    className="block w-full text-xs font-semibold rounded-lg border border-slate-200 px-3 py-2 text-slate-800 focus:outline-indigo-600"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <span className="text-xs font-bold text-slate-400">%</span>
                  </div>
                </div>
                <div className="relative rounded-md shadow-sm w-2/3">
                  <input
                    type="number"
                    value={taxParams.biayaJabatanMaxMonthly}
                    onChange={(e) => onUpdateTax({ ...taxParams, biayaJabatanMaxMonthly: parseInt(e.target.value) || 0, biayaJabatanMaxYearly: (parseInt(e.target.value) || 0) * 12 })}
                    className="block w-full text-xs font-semibold rounded-lg border border-slate-200 px-3 py-2 text-slate-800 focus:outline-indigo-600"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <span className="text-xs font-bold text-slate-400">IDR / Bln</span>
                  </div>
                </div>
              </div>
              <p className="text-[10px] text-slate-400 mt-1 italic">Maksimal pengurang biaya jabatan adalah 5% dari bruto atau setinggi-tingginya Rp 500.000 per bulan.</p>
            </div>

            <div className="pt-2">
              <h4 className="text-xs font-bold text-slate-600 uppercase mb-2">Referensi Nilai Penghasilan Tidak Kena Pajak (PTKP) Setahun</h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {ptkpKeys.map((status) => (
                  <div key={status} className="p-2.5 rounded-lg border border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <span className="font-bold text-slate-700">{status}</span>
                    <span className="font-semibold text-slate-500">{formatIDR(getPTKPValue(status))}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* BPJS Parameter Panel */}
        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm space-y-6">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-3 flex items-center gap-2">
            <Shield className="w-5 h-5 text-emerald-600" />
            Pembagian & Batas Atas Iuran BPJS
          </h3>

          <div className="space-y-4">
            
            {/* BPJS Kesehatan */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-700 uppercase flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                BPJS Kesehatan
              </h4>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] text-slate-500 font-bold uppercase">Ditanggung Pemberi Kerja (PK)</label>
                  <input
                    type="number"
                    value={bpjsConfig.kesehatanEmployerRate * 100}
                    onChange={(e) => onUpdateBPJS({ ...bpjsConfig, kesehatanEmployerRate: parseFloat(e.target.value) / 100 })}
                    className="mt-1 block w-full text-xs font-semibold rounded-lg border border-slate-200 px-3 py-2 text-slate-800 focus:outline-indigo-600"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-500 font-bold uppercase">Ditanggung Pekerja (Karyawan)</label>
                  <input
                    type="number"
                    value={bpjsConfig.kesehatanEmployeeRate * 100}
                    onChange={(e) => onUpdateBPJS({ ...bpjsConfig, kesehatanEmployeeRate: parseFloat(e.target.value) / 100 })}
                    className="mt-1 block w-full text-xs font-semibold rounded-lg border border-slate-200 px-3 py-2 text-slate-800 focus:outline-indigo-600"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] text-slate-500 font-bold uppercase">Batas Atas Gaji Dasar BPJS Kesehatan</label>
                <input
                  type="number"
                  value={bpjsConfig.kesehatanCeiling}
                  onChange={(e) => onUpdateBPJS({ ...bpjsConfig, kesehatanCeiling: parseInt(e.target.value) || 0 })}
                  className="mt-1 block w-full text-xs font-semibold rounded-lg border border-slate-200 px-3 py-2 text-slate-800 focus:outline-indigo-600"
                />
              </div>
            </div>

            {/* Jaminan Pensiun */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <h4 className="text-xs font-bold text-slate-700 uppercase flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                Jaminan Pensiun (JP)
              </h4>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] text-slate-500 font-bold uppercase">Ditanggung Pemberi Kerja (PK)</label>
                  <input
                    type="number"
                    value={bpjsConfig.jpEmployerRate * 100}
                    onChange={(e) => onUpdateBPJS({ ...bpjsConfig, jpEmployerRate: parseFloat(e.target.value) / 100 })}
                    className="mt-1 block w-full text-xs font-semibold rounded-lg border border-slate-200 px-3 py-2 text-slate-800 focus:outline-indigo-600"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-500 font-bold uppercase">Ditanggung Pekerja (Karyawan)</label>
                  <input
                    type="number"
                    value={bpjsConfig.jpEmployeeRate * 100}
                    onChange={(e) => onUpdateBPJS({ ...bpjsConfig, jpEmployeeRate: parseFloat(e.target.value) / 100 })}
                    className="mt-1 block w-full text-xs font-semibold rounded-lg border border-slate-200 px-3 py-2 text-slate-800 focus:outline-indigo-600"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] text-slate-500 font-bold uppercase">Batas Atas Gaji Dasar JP</label>
                <input
                  type="number"
                  value={bpjsConfig.jpCeiling}
                  onChange={(e) => onUpdateBPJS({ ...bpjsConfig, jpCeiling: parseInt(e.target.value) || 0 })}
                  className="mt-1 block w-full text-xs font-semibold rounded-lg border border-slate-200 px-3 py-2 text-slate-800 focus:outline-indigo-600"
                />
              </div>
            </div>

            {/* JHT JKK JKM */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <h4 className="text-xs font-bold text-slate-700 uppercase flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                Tarif JHT & JKM
              </h4>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[10px] text-slate-500 font-bold uppercase">JHT Pemberi Kerja (PK)</label>
                  <p className="mt-2 text-xs font-semibold text-slate-700">3.70%</p>
                </div>
                <div>
                  <label className="block text-[10px] text-slate-500 font-bold uppercase">JHT Pekerja (Karyawan)</label>
                  <p className="mt-2 text-xs font-semibold text-slate-700">2.00%</p>
                </div>
                <div>
                  <label className="block text-[10px] text-slate-500 font-bold uppercase">JKM Pemberi Kerja (PK)</label>
                  <p className="mt-2 text-xs font-semibold text-slate-700">0.30%</p>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* JKK Risk Classes Display */}
      <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-3 flex items-center gap-2">
          <Percent className="w-5 h-5 text-amber-500" />
          Klasifikasi Risiko JKK BPJS Ketenagakerjaan (Ditanggung Pemberi Kerja)
        </h3>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs divide-y divide-slate-100">
            <thead>
              <tr className="bg-slate-50 text-slate-600 font-semibold">
                <th className="py-2.5 px-3 rounded-l-lg">Tingkat Kelas Risiko</th>
                <th className="py-2.5 px-2">Tarif Iuran</th>
                <th className="py-2.5 px-3 rounded-r-lg">Deskripsi Sektor & Lingkungan Kerja</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {jkkRiskClasses.map((cl) => (
                <tr key={cl.name} className="hover:bg-slate-50/50">
                  <td className="py-3 px-3 font-bold text-slate-800">{cl.name}</td>
                  <td className="py-3 px-2 font-mono text-amber-700 font-bold">{cl.rate}</td>
                  <td className="py-3 px-3 text-slate-500">{cl.desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-[10px] text-slate-400 italic">
          Tenaga kerja lapangan Shelter Indonesia (Keamanan & Pengemudi) dipetakan secara otomatis ke Kelas III (0,89%) sesuai ketentuan risiko operasional lapangan.
        </p>
      </div>

    </div>
  );
}
