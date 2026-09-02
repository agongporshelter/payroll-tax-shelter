import { useState, useEffect, FormEvent } from 'react';
import { Employee, SalaryMaster } from '../types';
import { Edit2, Check, X, Search, DollarSign, UserCheck } from 'lucide-react';

interface SalaryMasterProps {
  employees: Employee[];
  salaryMaster: SalaryMaster[];
  onUpdateSalary: (sal: SalaryMaster) => void;
}

export default function SalaryMasterComponent({
  employees,
  salaryMaster,
  onUpdateSalary
}: SalaryMasterProps) {
  
  const [searchTerm, setSearchTerm] = useState('');
  
  // Selected employee for the quick configuration card
  const [selectedEmpId, setSelectedEmpId] = useState<string>(employees[0]?.id || '');
  const [cardBasic, setCardBasic] = useState<number>(0);
  const [cardFixed, setCardFixed] = useState<number>(0);
  const [cardVariable, setCardVariable] = useState<number>(0);

  // Sync card inputs when selected employee changes
  useEffect(() => {
    if (selectedEmpId) {
      const salObj = salaryMaster.find(s => s.employeeId === selectedEmpId);
      if (salObj) {
        setCardBasic(salObj.basicSalary);
        setCardFixed(salObj.fixedAllowance);
        setCardVariable(salObj.variableAllowance);
      } else {
        setCardBasic(0);
        setCardFixed(0);
        setCardVariable(0);
      }
    }
  }, [selectedEmpId, salaryMaster]);

  // Set default employee if selectedEmpId is empty but employees are available
  useEffect(() => {
    if (!selectedEmpId && employees.length > 0) {
      setSelectedEmpId(employees[0].id);
    }
  }, [employees]);

  // Editing state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [basicEdit, setBasicEdit] = useState(0);
  const [fixedEdit, setFixedEdit] = useState(0);
  const [variableEdit, setVariableEdit] = useState(0);

  const formatIDR = (num: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(num);
  };

  const handleStartEdit = (empId: string, sal: SalaryMaster) => {
    setEditingId(empId);
    setBasicEdit(sal.basicSalary);
    setFixedEdit(sal.fixedAllowance);
    setVariableEdit(sal.variableAllowance);
  };

  const handleSaveEdit = (empId: string) => {
    onUpdateSalary({
      employeeId: empId,
      basicSalary: basicEdit,
      fixedAllowance: fixedEdit,
      variableAllowance: variableEdit
    });
    setEditingId(null);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
  };

  const handleCardSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!selectedEmpId) return;
    onUpdateSalary({
      employeeId: selectedEmpId,
      basicSalary: cardBasic,
      fixedAllowance: cardFixed,
      variableAllowance: cardVariable
    });
  };

  const filteredEmployees = employees.filter(emp => 
    emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.clientName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6" id="salary-master-panel">
      
      {/* Quick Salary Config Card */}
      <div className="bg-white p-5 rounded-xl border border-slate-200/60 shadow-sm space-y-4">
        <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-3">
          <UserCheck className="w-4 h-4 text-indigo-600" />
          Konfigurasi Gaji Cepat
        </h3>

        <form onSubmit={handleCardSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div>
            <label className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider">Pilih Karyawan</label>
            <select
              value={selectedEmpId}
              onChange={(e) => setSelectedEmpId(e.target.value)}
              className="mt-1.5 block w-full text-xs font-semibold rounded-lg border border-slate-200 px-3 py-2 text-slate-800 bg-white focus:outline-indigo-600"
            >
              {employees.map(emp => (
                <option key={emp.id} value={emp.id}>{emp.id} - {emp.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider">Gaji Pokok</label>
            <div className="mt-1.5 relative rounded-lg shadow-sm">
              <input
                type="number"
                value={cardBasic}
                onChange={(e) => setCardBasic(parseInt(e.target.value) || 0)}
                className="block w-full text-xs font-semibold rounded-lg border border-slate-200 pl-3 pr-10 py-2 text-slate-800 focus:outline-indigo-600"
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <span className="text-[10px] font-bold text-slate-400">IDR</span>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider">Tunjangan Tetap</label>
            <div className="mt-1.5 relative rounded-lg shadow-sm">
              <input
                type="number"
                value={cardFixed}
                onChange={(e) => setCardFixed(parseInt(e.target.value) || 0)}
                className="block w-full text-xs font-semibold rounded-lg border border-slate-200 pl-3 pr-10 py-2 text-slate-800 focus:outline-indigo-600"
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <span className="text-[10px] font-bold text-slate-400">IDR</span>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider">Tunjangan Variabel</label>
            <div className="mt-1.5 relative rounded-lg shadow-sm">
              <input
                type="number"
                value={cardVariable}
                onChange={(e) => setCardVariable(parseInt(e.target.value) || 0)}
                className="block w-full text-xs font-semibold rounded-lg border border-slate-200 pl-3 pr-10 py-2 text-slate-800 focus:outline-indigo-600"
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <span className="text-[10px] font-bold text-slate-400">IDR</span>
              </div>
            </div>
          </div>

          <div className="md:col-span-4 flex justify-end">
            <button
              type="submit"
              className="px-5 py-2 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <Check className="w-4 h-4" />
              Simpan Profil Gaji
            </button>
          </div>
        </form>
      </div>

      {/* Top action controls */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Cari ID, nama, atau unit..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 pr-4 py-2 w-full text-xs font-semibold rounded-lg border border-slate-200 text-slate-800 focus:outline-indigo-600"
          />
        </div>
        <p className="text-xs text-slate-500 font-semibold italic">
          *Gaji Pokok & Tunjangan Tetap digunakan sebagai dasar upah utama untuk batas iuran BPJS dan perhitungan upah lembur sesuai regulasi.
        </p>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider text-[10px] border-b border-slate-100">
                <th className="py-3 px-4 break-words whitespace-normal">ID Karyawan</th>
                <th className="py-3 px-3 break-words whitespace-normal">Nama Karyawan</th>
                <th className="py-3 px-3 break-words whitespace-normal">Alokasi Klien Mitra</th>
                <th className="py-3 px-3 text-right break-words whitespace-normal">Gaji Pokok</th>
                <th className="py-3 px-3 text-right break-words whitespace-normal">Tunjangan Tetap</th>
                <th className="py-3 px-3 text-right text-indigo-700 break-words whitespace-normal">Dasar BPJS (GP + T. Tetap)</th>
                <th className="py-3 px-3 text-right break-words whitespace-normal">Tunjangan Variabel</th>
                <th className="py-3 px-4 text-center break-words whitespace-normal">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredEmployees.map((emp) => {
                const sal = salaryMaster.find(s => s.employeeId === emp.id) || {
                  employeeId: emp.id,
                  basicSalary: 0,
                  fixedAllowance: 0,
                  variableAllowance: 0
                };
                
                const isEditing = editingId === emp.id;
                const bpjsBasis = isEditing 
                  ? basicEdit + fixedEdit 
                  : sal.basicSalary + sal.fixedAllowance;

                return (
                  <tr key={emp.id} className="hover:bg-slate-50/40 font-medium">
                    <td className="py-3.5 px-4 font-bold text-slate-800 font-mono break-all">{emp.id}</td>
                    <td className="py-3.5 px-3 break-words whitespace-normal">
                      <span className="font-bold text-slate-800 block">{emp.name}</span>
                    </td>
                    <td className="py-3.5 px-3 break-words whitespace-normal">
                      <span className="text-slate-500 block">{emp.clientName}</span>
                    </td>
                    
                    {/* Basic Salary */}
                    <td className="py-3.5 px-3 text-right font-mono font-semibold">
                      {isEditing ? (
                        <input
                          type="number"
                          value={basicEdit}
                          onChange={(e) => setBasicEdit(parseInt(e.target.value) || 0)}
                          className="text-xs font-bold px-2 py-1 border border-slate-300 rounded text-right w-28 font-mono focus:outline-indigo-600"
                        />
                      ) : (
                        <span>{formatIDR(sal.basicSalary)}</span>
                      )}
                    </td>

                    {/* Fixed Allowance */}
                    <td className="py-3.5 px-3 text-right font-mono font-semibold">
                      {isEditing ? (
                        <input
                          type="number"
                          value={fixedEdit}
                          onChange={(e) => setFixedEdit(parseInt(e.target.value) || 0)}
                          className="text-xs font-bold px-2 py-1 border border-slate-300 rounded text-right w-24 font-mono focus:outline-indigo-600"
                        />
                      ) : (
                        <span>{formatIDR(sal.fixedAllowance)}</span>
                      )}
                    </td>

                    {/* BPJS Basis Column */}
                    <td className="py-3.5 px-3 text-right font-mono font-bold text-indigo-700">
                      <span>{formatIDR(bpjsBasis)}</span>
                    </td>

                    {/* Variable Allowance */}
                    <td className="py-3.5 px-3 text-right font-mono font-semibold">
                      {isEditing ? (
                        <input
                          type="number"
                          value={variableEdit}
                          onChange={(e) => setVariableEdit(parseInt(e.target.value) || 0)}
                          className="text-xs font-bold px-2 py-1 border border-slate-300 rounded text-right w-24 font-mono focus:outline-indigo-600"
                        />
                      ) : (
                        <span>{formatIDR(sal.variableAllowance)}</span>
                      )}
                    </td>

                    {/* Action Column */}
                    <td className="py-3.5 px-4 text-center">
                      {isEditing ? (
                        <div className="flex justify-center items-center gap-1">
                          <button
                            onClick={() => handleSaveEdit(emp.id)}
                            className="p-1 text-emerald-600 hover:bg-emerald-50 rounded animate-pulse"
                            title="Simpan"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="p-1 text-slate-400 hover:bg-slate-100 rounded"
                            title="Batal"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleStartEdit(emp.id, sal)}
                          className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-slate-50 rounded"
                          title="Ubah Gaji"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </td>

                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
