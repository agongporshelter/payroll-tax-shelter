import { useState, FormEvent, useEffect } from 'react';
import { Employee, PTKPStatus, JKKRiskClass } from '../types';
import { Plus, Search, Trash2, Edit2, Check, X, ShieldAlert } from 'lucide-react';

interface EmployeeMasterProps {
  employees: Employee[];
  onAddEmployee: (emp: Employee) => void;
  onUpdateEmployee: (emp: Employee) => void;
  onDeleteEmployee: (id: string) => void;
}

export default function EmployeeMaster({
  employees,
  onAddEmployee,
  onUpdateEmployee,
  onDeleteEmployee
}: EmployeeMasterProps) {
  
  const [searchTerm, setSearchTerm] = useState('');
  const [clientFilter, setClientFilter] = useState('ALL');
  
  // Editing state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Employee | null>(null);

  // Dynamic Option lists from existing data
  const existingClients = Array.from(new Set(employees.map(e => e.clientName))).filter(Boolean);
  const existingDepts = Array.from(new Set(employees.map(e => e.department))).filter(Boolean);

  // New Employee state
  const [isAdding, setIsAdding] = useState(false);
  const [newForm, setNewForm] = useState<Omit<Employee, 'id'>>({
    name: '',
    ptkpStatus: 'TK/0',
    jkkRiskClass: 'Class III (0.89%)',
    bpjsActive: true,
    clientName: '',
    department: '',
    joinDate: new Date().toISOString().split('T')[0]
  });

  const [selectedClient, setSelectedClient] = useState(existingClients[0] || 'PT Astra International');
  const [customClientName, setCustomClientName] = useState('');
  
  const [selectedDept, setSelectedDept] = useState(existingDepts[0] || 'Security Services');
  const [customDept, setCustomDept] = useState('');

  // Sync state if employees change
  useEffect(() => {
    if (existingClients.length > 0 && !selectedClient) {
      setSelectedClient(existingClients[0]);
    }
    if (existingDepts.length > 0 && !selectedDept) {
      setSelectedDept(existingDepts[0]);
    }
  }, [employees]);

  const ptkpStatuses: PTKPStatus[] = ['TK/0', 'TK/1', 'TK/2', 'TK/3', 'K/0', 'K/1', 'K/2', 'K/3'];
  const jkkRiskClasses: JKKRiskClass[] = [
    'Class I (0.24%)',
    'Class II (0.54%)',
    'Class III (0.89%)',
    'Class IV (1.27%)',
    'Class V (1.74%)'
  ];

  // Unique clients for filtering
  const uniqueClients = ['ALL', ...Array.from(new Set(employees.map(e => e.clientName)))];

  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = emp.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          emp.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          emp.department.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClient = clientFilter === 'ALL' || emp.clientName === clientFilter;
    return matchesSearch && matchesClient;
  });

  const handleStartEdit = (emp: Employee) => {
    setEditingId(emp.id);
    setEditForm({ ...emp });
  };

  const handleSaveEdit = () => {
    if (editForm) {
      onUpdateEmployee(editForm);
      setEditingId(null);
      setEditForm(null);
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm(null);
  };

  const handleAddSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!newForm.name) return;

    const finalClient = selectedClient === '__NEW__' ? customClientName.trim() : selectedClient;
    const finalDept = selectedDept === '__NEW__' ? customDept.trim() : selectedDept;

    if (!finalClient) {
      alert('Mohon pilih atau masukkan nama Mitra Klien baru!');
      return;
    }
    if (!finalDept) {
      alert('Mohon pilih atau masukkan Departemen / Sektor baru!');
      return;
    }
    
    // Generate new sequential ID
    const nextNum = employees.length > 0 
      ? Math.max(...employees.map(e => parseInt(e.id.split('-')[1]) || 0)) + 1 
      : 1;
    const newId = `EMP-${String(nextNum).padStart(3, '0')}`;
    
    onAddEmployee({
      id: newId,
      name: newForm.name,
      ptkpStatus: newForm.ptkpStatus,
      jkkRiskClass: newForm.jkkRiskClass,
      bpjsActive: newForm.bpjsActive,
      clientName: finalClient,
      department: finalDept,
      joinDate: newForm.joinDate
    });

    // Reset Form
    setNewForm({
      name: '',
      ptkpStatus: 'TK/0',
      jkkRiskClass: 'Class III (0.89%)',
      bpjsActive: true,
      clientName: '',
      department: '',
      joinDate: new Date().toISOString().split('T')[0]
    });
    setCustomClientName('');
    setCustomDept('');
    setIsAdding(false);
  };

  return (
    <div className="space-y-6" id="employee-master-panel">
      
      {/* Top action controls */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
        <div className="flex flex-1 gap-2">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Cari ID, nama, atau departemen..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 w-full text-xs font-semibold rounded-lg border border-slate-200 text-slate-800 focus:outline-indigo-600"
            />
          </div>

          <select
            value={clientFilter}
            onChange={(e) => setClientFilter(e.target.value)}
            className="px-3 py-2 text-xs font-semibold rounded-lg border border-slate-200 text-slate-700 focus:outline-indigo-600 bg-white"
          >
            {uniqueClients.map(c => (
              <option key={c} value={c}>{c === 'ALL' ? 'Semua Klien' : c}</option>
            ))}
          </select>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setIsAdding(!isAdding)}
            className="px-3 py-2 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 flex items-center gap-1.5 transition-colors cursor-pointer animate-pulse"
          >
            <Plus className="w-4 h-4" />
            Tambah Karyawan
          </button>
        </div>
      </div>

      {/* Add Employee Form */}
      {isAdding && (
        <form onSubmit={handleAddSubmit} className="bg-slate-50 border border-slate-200/60 p-5 rounded-xl space-y-4 animate-fadeIn">
          <div className="flex justify-between items-center border-b border-slate-200/60 pb-2">
            <h3 className="text-xs font-bold text-slate-700 uppercase">Pendaftaran Karyawan Baru</h3>
            <button type="button" onClick={() => setIsAdding(false)} className="text-slate-400 hover:text-slate-600">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-[10px] text-slate-500 font-bold uppercase">Nama Lengkap</label>
              <input
                type="text"
                required
                value={newForm.name}
                onChange={(e) => setNewForm({ ...newForm, name: e.target.value })}
                className="mt-1 block w-full text-xs font-semibold rounded-lg border border-slate-200 px-3 py-2 text-slate-800 bg-white focus:outline-indigo-600"
                placeholder="misal: Budi Santoso"
              />
            </div>

            <div>
              <label className="block text-[10px] text-slate-500 font-bold uppercase">Alokasi Mitra Klien</label>
              <select
                value={selectedClient}
                onChange={(e) => setSelectedClient(e.target.value)}
                className="mt-1 block w-full text-xs font-semibold rounded-lg border border-slate-200 px-3 py-2 text-slate-800 bg-white focus:outline-indigo-600"
              >
                {existingClients.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
                <option value="__NEW__" className="text-indigo-600 font-bold">+ Tambah Klien Baru...</option>
              </select>

              {selectedClient === '__NEW__' && (
                <input
                  type="text"
                  required
                  value={customClientName}
                  onChange={(e) => setCustomClientName(e.target.value)}
                  className="mt-2 block w-full text-xs font-semibold rounded-lg border border-indigo-300 px-3 py-2 text-slate-800 bg-indigo-50/20 focus:outline-indigo-600 animate-fadeIn"
                  placeholder="Ketik nama klien baru..."
                />
              )}
            </div>

            <div>
              <label className="block text-[10px] text-slate-500 font-bold uppercase">Departemen / Sektor</label>
              <select
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                className="mt-1 block w-full text-xs font-semibold rounded-lg border border-slate-200 px-3 py-2 text-slate-800 bg-white focus:outline-indigo-600"
              >
                {existingDepts.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
                <option value="__NEW__" className="text-indigo-600 font-bold">+ Tambah Departemen Baru...</option>
              </select>

              {selectedDept === '__NEW__' && (
                <input
                  type="text"
                  required
                  value={customDept}
                  onChange={(e) => setCustomDept(e.target.value)}
                  className="mt-2 block w-full text-xs font-semibold rounded-lg border border-indigo-300 px-3 py-2 text-slate-800 bg-indigo-50/20 focus:outline-indigo-600 animate-fadeIn"
                  placeholder="Ketik nama departemen baru..."
                />
              )}
            </div>

            <div>
              <label className="block text-[10px] text-slate-500 font-bold uppercase">Status PTKP (Penghasilan Tidak Kena Pajak)</label>
              <select
                value={newForm.ptkpStatus}
                onChange={(e) => setNewForm({ ...newForm, ptkpStatus: e.target.value as PTKPStatus })}
                className="mt-1 block w-full text-xs font-semibold rounded-lg border border-slate-200 px-3 py-2 text-slate-800 bg-white focus:outline-indigo-600"
              >
                {ptkpStatuses.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] text-slate-500 font-bold uppercase">Kelas Risiko JKK BPJS Ketenagakerjaan</label>
              <select
                value={newForm.jkkRiskClass}
                onChange={(e) => setNewForm({ ...newForm, jkkRiskClass: e.target.value as JKKRiskClass })}
                className="mt-1 block w-full text-xs font-semibold rounded-lg border border-slate-200 px-3 py-2 text-slate-800 bg-white focus:outline-indigo-600"
              >
                {jkkRiskClasses.map(cl => (
                  <option key={cl} value={cl}>{cl}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] text-slate-500 font-bold uppercase">Kepesertaan Iuran BPJS</label>
              <div className="mt-2.5 flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="add-bpjs"
                  checked={newForm.bpjsActive}
                  onChange={(e) => setNewForm({ ...newForm, bpjsActive: e.target.checked })}
                  className="w-4 h-4 rounded text-indigo-600 border-slate-300 focus:ring-indigo-500"
                />
                <label htmlFor="add-bpjs" className="text-xs font-semibold text-slate-700">Terdaftar Aktif BPJS Kesehatan & Ketenagakerjaan</label>
              </div>
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-3.5 py-1.5 border border-slate-200 text-slate-500 rounded-lg text-xs font-bold hover:bg-slate-100"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700"
            >
              Simpan Data Karyawan
            </button>
          </div>
        </form>
      )}

      {/* Main Employee Table */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider text-[10px] border-b border-slate-100">
                <th className="py-3 px-4 break-words whitespace-normal">ID Karyawan</th>
                <th className="py-3 px-3 break-words whitespace-normal">Nama Karyawan</th>
                <th className="py-3 px-3 break-words whitespace-normal">Mitra Klien</th>
                <th className="py-3 px-3 break-words whitespace-normal">Departemen</th>
                <th className="py-3 px-3 text-center break-words whitespace-normal">Status PTKP</th>
                <th className="py-3 px-3 break-words whitespace-normal">Risiko BPJS Ketenagakerjaan</th>
                <th className="py-3 px-3 text-center break-words whitespace-normal">Status BPJS</th>
                <th className="py-3 px-4 text-center break-words whitespace-normal">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <ShieldAlert className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                    Tidak ada data karyawan yang cocok dengan kriteria pencarian.
                  </td>
                </tr>
              ) : (
                filteredEmployees.map((emp) => {
                  const isEditing = editingId === emp.id;
                  
                  return (
                    <tr key={emp.id} className="hover:bg-slate-50/40 font-medium">
                      <td className="py-3 px-4 font-bold text-slate-800 font-mono break-all">{emp.id}</td>
                      
                      <td className="py-3 px-3 break-words whitespace-normal">
                        {isEditing ? (
                          <input
                            type="text"
                            value={editForm?.name || ''}
                            onChange={(e) => setEditForm({ ...editForm!, name: e.target.value })}
                            className="text-xs px-2 py-1 border border-slate-300 rounded font-bold w-full"
                          />
                        ) : (
                          <span className="font-bold text-slate-800 block">{emp.name}</span>
                        )}
                      </td>

                      <td className="py-3 px-3 break-words whitespace-normal">
                        {isEditing ? (
                          <input
                            type="text"
                            value={editForm?.clientName || ''}
                            onChange={(e) => setEditForm({ ...editForm!, clientName: e.target.value })}
                            className="text-xs px-2 py-1 border border-slate-300 rounded w-full"
                          />
                        ) : (
                          <span className="block">{emp.clientName}</span>
                        )}
                      </td>

                      <td className="py-3 px-3 break-words whitespace-normal">
                        {isEditing ? (
                          <input
                            type="text"
                            value={editForm?.department || ''}
                            onChange={(e) => setEditForm({ ...editForm!, department: e.target.value })}
                            className="text-xs px-2 py-1 border border-slate-300 rounded w-full"
                          />
                        ) : (
                          <span className="px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded text-[11px] inline-block break-words max-w-[120px]">{emp.department}</span>
                        )}
                      </td>

                      <td className="py-3 px-3 text-center font-bold">
                        {isEditing ? (
                          <select
                            value={editForm?.ptkpStatus}
                            onChange={(e) => setEditForm({ ...editForm!, ptkpStatus: e.target.value as PTKPStatus })}
                            className="text-xs p-1 border border-slate-300 rounded font-semibold bg-white"
                          >
                            {ptkpStatuses.map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                        ) : (
                          <span className="text-indigo-600">{emp.ptkpStatus}</span>
                        )}
                      </td>

                      <td className="py-3 px-3">
                        {isEditing ? (
                          <select
                            value={editForm?.jkkRiskClass}
                            onChange={(e) => setEditForm({ ...editForm!, jkkRiskClass: e.target.value as JKKRiskClass })}
                            className="text-xs p-1 border border-slate-300 rounded bg-white"
                          >
                            {jkkRiskClasses.map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                        ) : (
                          <span className="text-slate-500 text-[11px]">{emp.jkkRiskClass}</span>
                        )}
                      </td>

                      <td className="py-3 px-3 text-center">
                        {isEditing ? (
                          <input
                            type="checkbox"
                            checked={editForm?.bpjsActive || false}
                            onChange={(e) => setEditForm({ ...editForm!, bpjsActive: e.target.checked })}
                            className="w-4 h-4 rounded text-indigo-600 border-slate-300 focus:ring-indigo-500"
                          />
                        ) : (
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${emp.bpjsActive ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-slate-100 text-slate-400'}`}>
                            {emp.bpjsActive ? 'Aktif' : 'Bebas'}
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-center">
                        {isEditing ? (
                          <div className="flex justify-center items-center gap-1">
                            <button
                              onClick={handleSaveEdit}
                              className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"
                              title="Konfirmasi"
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
                          <div className="flex justify-center items-center gap-1">
                            <button
                              onClick={() => handleStartEdit(emp)}
                              className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-slate-50 rounded"
                              title="Ubah Data"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => onDeleteEmployee(emp.id)}
                              className="p-1 text-slate-400 hover:text-rose-600 hover:bg-slate-50 rounded"
                              title="Hapus Data"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
