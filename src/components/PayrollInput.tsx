import { useState, useEffect, FormEvent } from 'react';
import { Employee, VariableInput, CustomComponent } from '../types';
import { Search, Edit2, Check, X, Award, PiggyBank } from 'lucide-react';
import CustomComponentManager from './CustomComponentManager';

interface PayrollInputProps {
  employees: Employee[];
  variables: VariableInput[];
  selectedMonth: number;
  onUpdateVariables: (variables: VariableInput) => void;
  customComponents?: CustomComponent[];
  onAddCustomComponent?: (comp: CustomComponent) => void;
  onUpdateCustomComponent?: (comp: CustomComponent) => void;
  onDeleteCustomComponent?: (id: string) => void;
}

export default function PayrollInput({
  employees,
  variables,
  selectedMonth,
  onUpdateVariables,
  customComponents = [],
  onAddCustomComponent = () => {},
  onUpdateCustomComponent = () => {},
  onDeleteCustomComponent = () => {}
}: PayrollInputProps) {
  
  const [searchTerm, setSearchTerm] = useState('');
  
  // Selected employee for quick configuration card
  const [selectedEmpId, setSelectedEmpId] = useState<string>(employees[0]?.id || '');
  const [cardCustomValues, setCardCustomValues] = useState<Record<string, number>>({});

  // Sync card inputs when selected employee, month, or custom components change
  useEffect(() => {
    if (selectedEmpId) {
      const vObj = variables.find(v => v.employeeId === selectedEmpId && v.month === selectedMonth);
      if (vObj) {
        // Build initial custom values mapping, falling back to legacy fields if needed
        const initialVals: Record<string, number> = { ...(vObj.customValues || {}) };
        customComponents.forEach(comp => {
          if (!(comp.id in initialVals)) {
            if (comp.id === 'comp_bonus') initialVals[comp.id] = vObj.bonus;
            else if (comp.id === 'comp_incentive') initialVals[comp.id] = vObj.incentive;
            else if (comp.id === 'comp_loan') initialVals[comp.id] = vObj.loanDeduction;
            else if (comp.id === 'comp_other') initialVals[comp.id] = vObj.otherDeduction;
            else initialVals[comp.id] = 0;
          }
        });
        setCardCustomValues(initialVals);
      } else {
        const defaultVals: Record<string, number> = {};
        customComponents.forEach(comp => {
          defaultVals[comp.id] = 0;
        });
        setCardCustomValues(defaultVals);
      }
    }
  }, [selectedEmpId, selectedMonth, variables, customComponents]);

  // Set default employee if selectedEmpId is empty but employees are available
  useEffect(() => {
    if (!selectedEmpId && employees.length > 0) {
      setSelectedEmpId(employees[0].id);
    }
  }, [employees]);

  // Editing state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [customValuesEdit, setCustomValuesEdit] = useState<Record<string, number>>({});

  const formatIDR = (num: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(num);
  };

  const handleStartEdit = (empId: string, v: VariableInput) => {
    setEditingId(empId);
    
    // Create an editable map of all custom components, filling in fallbacks for legacy variables
    const editVals: Record<string, number> = { ...(v.customValues || {}) };
    customComponents.forEach(comp => {
      if (!(comp.id in editVals)) {
        if (comp.id === 'comp_bonus') editVals[comp.id] = v.bonus;
        else if (comp.id === 'comp_incentive') editVals[comp.id] = v.incentive;
        else if (comp.id === 'comp_loan') editVals[comp.id] = v.loanDeduction;
        else if (comp.id === 'comp_other') editVals[comp.id] = v.otherDeduction;
        else editVals[comp.id] = 0;
      }
    });
    setCustomValuesEdit(editVals);
  };

  const handleSaveEdit = (empId: string) => {
    // Maintain backwards compatibility by populating standard fields too
    onUpdateVariables({
      employeeId: empId,
      month: selectedMonth,
      bonus: customValuesEdit['comp_bonus'] || 0,
      incentive: customValuesEdit['comp_incentive'] || 0,
      loanDeduction: customValuesEdit['comp_loan'] || 0,
      otherDeduction: customValuesEdit['comp_other'] || 0,
      customValues: customValuesEdit
    });
    setEditingId(null);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
  };

  const handleCardSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!selectedEmpId) return;

    // Save dynamic components and mirror values to standard fields for backward reports compatibility
    onUpdateVariables({
      employeeId: selectedEmpId,
      month: selectedMonth,
      bonus: cardCustomValues['comp_bonus'] || 0,
      incentive: cardCustomValues['comp_incentive'] || 0,
      loanDeduction: cardCustomValues['comp_loan'] || 0,
      otherDeduction: cardCustomValues['comp_other'] || 0,
      customValues: cardCustomValues
    });
  };

  const filteredEmployees = employees.filter(emp => 
    emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.clientName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const monthNames = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
  ];

  return (
    <div className="space-y-6" id="payroll-inputs-panel">
      
      {/* Custom Components Manager UI Widget */}
      <CustomComponentManager
        customComponents={customComponents}
        onAddCustomComponent={onAddCustomComponent}
        onUpdateCustomComponent={onUpdateCustomComponent}
        onDeleteCustomComponent={onDeleteCustomComponent}
      />

      {/* Quick Additions & Deductions Configuration Card */}
      <div className="bg-white p-5 rounded-xl border border-slate-200/60 shadow-sm space-y-4">
        <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-3">
          <PiggyBank className="w-4 h-4 text-indigo-600" />
          Konfigurasi Pendapatan & Potongan Cepat
        </h3>

        <form onSubmit={handleCardSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end bg-slate-50/50 p-4 rounded-xl border border-slate-100">
            <div className="col-span-1 md:col-span-2">
              <label className="block text-[10px] text-slate-500 font-extrabold uppercase tracking-wider">Pilih Karyawan</label>
              <select
                value={selectedEmpId}
                onChange={(e) => setSelectedEmpId(e.target.value)}
                className="mt-1.5 block w-full text-xs font-bold rounded-lg border border-slate-200 px-3 py-2.5 text-slate-800 bg-white focus:outline-indigo-600"
              >
                {employees.map(emp => (
                  <option key={emp.id} value={emp.id}>{emp.id} - {emp.name} ({emp.clientName})</option>
                ))}
              </select>
            </div>
            <div className="col-span-1 md:col-span-2 flex justify-end">
              <button
                type="submit"
                className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 transition-colors flex items-center gap-1.5 cursor-pointer shadow-md"
              >
                <Check className="w-4 h-4" />
                Simpan Variabel Karyawan
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Earnings Section */}
            <div className="space-y-3 bg-emerald-50/10 p-4 rounded-xl border border-emerald-100/30">
              <h4 className="text-[10px] font-extrabold text-emerald-800 uppercase tracking-widest flex items-center gap-1 border-b border-emerald-100/20 pb-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                Komponen Pendapatan (Earnings)
              </h4>
              {customComponents.filter(c => c.type === 'earning').length === 0 ? (
                <p className="text-[10px] text-slate-400 italic">Belum ada komponen pendapatan kustom.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {customComponents.filter(c => c.type === 'earning').map((comp) => {
                    const val = cardCustomValues[comp.id] || 0;
                    return (
                      <div key={comp.id} className="space-y-1">
                        <label className="block text-[10px] text-emerald-700 font-bold uppercase tracking-wider break-words whitespace-normal" title={comp.description}>
                          {comp.name}
                        </label>
                        <div className="relative rounded-lg shadow-sm">
                          <input
                            type="number"
                            value={val}
                            onChange={(e) => setCardCustomValues({
                              ...cardCustomValues,
                              [comp.id]: parseInt(e.target.value) || 0
                            })}
                            className="block w-full text-xs font-semibold rounded-lg border border-slate-200 pl-3 pr-10 py-2 text-slate-800 focus:outline-indigo-600 bg-white"
                          />
                          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                            <span className="text-[10px] font-bold text-slate-400">IDR</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Deductions Section */}
            <div className="space-y-3 bg-rose-50/10 p-4 rounded-xl border border-rose-100/30">
              <h4 className="text-[10px] font-extrabold text-rose-800 uppercase tracking-widest flex items-center gap-1 border-b border-rose-100/20 pb-2">
                <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                Komponen Potongan (Deductions)
              </h4>
              {customComponents.filter(c => c.type === 'deduction').length === 0 ? (
                <p className="text-[10px] text-slate-400 italic">Belum ada komponen potongan kustom.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {customComponents.filter(c => c.type === 'deduction').map((comp) => {
                    const val = cardCustomValues[comp.id] || 0;
                    return (
                      <div key={comp.id} className="space-y-1">
                        <label className="block text-[10px] text-rose-700 font-bold uppercase tracking-wider break-words whitespace-normal" title={comp.description}>
                          {comp.name}
                        </label>
                        <div className="relative rounded-lg shadow-sm">
                          <input
                            type="number"
                            value={val}
                            onChange={(e) => setCardCustomValues({
                              ...cardCustomValues,
                              [comp.id]: parseInt(e.target.value) || 0
                            })}
                            className="block w-full text-xs font-semibold rounded-lg border border-slate-200 pl-3 pr-10 py-2 text-slate-800 focus:outline-indigo-600 bg-white"
                          />
                          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                            <span className="text-[10px] font-bold text-slate-400">IDR</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </form>
      </div>

      {/* Informative Header */}
      <div className="bg-slate-50 border border-slate-200/60 p-4 rounded-xl flex items-start space-x-3">
        <Award className="w-5 h-5 text-indigo-600 mt-0.5 shrink-0" />
        <div>
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide">Buku Besar Penambahan & Pemotongan Variabel</h3>
          <p className="text-xs text-slate-600 mt-1">
            Kelola komponen pendapatan tidak berkala (seperti THR di bulan April, bonus, atau insentif) serta potongan 
            (pinjaman koperasi, iuran keanggotaan SPSI, atau potongan khusus) untuk periode bulan <strong>{monthNames[selectedMonth - 1]}</strong>.
          </p>
        </div>
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
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider text-[10px] border-b border-slate-100">
                <th className="py-3 px-4 break-words whitespace-normal">ID Karyawan</th>
                <th className="py-3 px-3 break-words whitespace-normal">Nama Karyawan</th>
                <th className="py-3 px-3 break-words whitespace-normal">Alokasi Mitra Klien</th>
                
                {/* Dynamically appended custom component headers */}
                {customComponents.map((comp) => (
                  <th key={comp.id} className={`py-3 px-3 text-right break-words whitespace-normal min-w-[120px] ${comp.type === 'earning' ? 'text-emerald-700 bg-emerald-50/5' : 'text-rose-700 bg-rose-50/5'}`}>
                    {comp.name}
                  </th>
                ))}

                <th className="py-3 px-4 text-center break-words whitespace-normal">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredEmployees.map((emp) => {
                const v = variables.find(item => item.employeeId === emp.id && item.month === selectedMonth) || {
                  employeeId: emp.id,
                  month: selectedMonth,
                  bonus: 0,
                  incentive: 0,
                  loanDeduction: 0,
                  otherDeduction: 0,
                  customValues: {}
                };

                const isEditing = editingId === emp.id;

                return (
                  <tr key={emp.id} className="hover:bg-slate-50/40 font-medium">
                    <td className="py-3.5 px-4 font-bold text-slate-800 font-mono break-all">{emp.id}</td>
                    <td className="py-3.5 px-3 break-words whitespace-normal">
                      <span className="font-bold text-slate-800 block">{emp.name}</span>
                    </td>
                    <td className="py-3.5 px-3 break-words whitespace-normal">
                      <span className="text-slate-500 block">{emp.clientName}</span>
                    </td>

                    {/* Dynamic appends for Custom Components */}
                    {customComponents.map((comp) => {
                      let val = 0;
                      if (isEditing) {
                        val = customValuesEdit[comp.id] || 0;
                      } else {
                        if (v.customValues && comp.id in v.customValues) {
                          val = v.customValues[comp.id];
                        } else {
                          if (comp.id === 'comp_bonus') val = v.bonus;
                          else if (comp.id === 'comp_incentive') val = v.incentive;
                          else if (comp.id === 'comp_loan') val = v.loanDeduction;
                          else if (comp.id === 'comp_other') val = v.otherDeduction;
                        }
                      }

                      return (
                        <td key={comp.id} className={`py-3.5 px-3 text-right font-mono font-bold ${comp.type === 'earning' ? 'text-emerald-700 bg-emerald-50/5' : 'text-rose-700 bg-rose-50/5'}`}>
                          {isEditing ? (
                            <input
                              type="number"
                              value={val}
                              onChange={(e) => setCustomValuesEdit({
                                ...customValuesEdit,
                                [comp.id]: parseInt(e.target.value) || 0
                              })}
                              className="text-xs font-bold px-2 py-1 border border-slate-300 rounded text-right w-28 font-mono focus:outline-indigo-600 bg-white"
                            />
                          ) : (
                            <span>{formatIDR(val)}</span>
                          )}
                        </td>
                      );
                    })}

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
                          onClick={() => handleStartEdit(emp.id, v)}
                          className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-slate-50 rounded"
                          title="Ubah Input"
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
