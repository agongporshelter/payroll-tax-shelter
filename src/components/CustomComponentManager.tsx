import { useState, FormEvent } from 'react';
import { CustomComponent } from '../types';
import { Plus, Trash2, Edit2, Check, X, Settings2, Info } from 'lucide-react';

interface CustomComponentManagerProps {
  customComponents: CustomComponent[];
  onAddCustomComponent: (comp: CustomComponent) => void;
  onUpdateCustomComponent: (comp: CustomComponent) => void;
  onDeleteCustomComponent: (id: string) => void;
}

export default function CustomComponentManager({
  customComponents,
  onAddCustomComponent,
  onUpdateCustomComponent,
  onDeleteCustomComponent
}: CustomComponentManagerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState('');
  const [type, setType] = useState<'earning' | 'deduction'>('earning');
  const [description, setDescription] = useState('');
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editType, setEditType] = useState<'earning' | 'deduction'>('earning');
  const [editDescription, setEditDescription] = useState('');

  const handleAdd = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newComp: CustomComponent = {
      id: 'cc_' + Date.now().toString(),
      name: name.trim(),
      type,
      description: description.trim() || undefined
    };

    onAddCustomComponent(newComp);
    setName('');
    setDescription('');
  };

  const handleStartEdit = (comp: CustomComponent) => {
    setEditingId(comp.id);
    setEditName(comp.name);
    setEditType(comp.type);
    setEditDescription(comp.description || '');
  };

  const handleSaveEdit = (id: string) => {
    if (!editName.trim()) return;

    onUpdateCustomComponent({
      id,
      name: editName.trim(),
      type: editType,
      description: editDescription.trim() || undefined
    });
    setEditingId(null);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden" id="custom-component-manager-widget">
      <div className="bg-slate-50 px-5 py-4 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Settings2 className="w-4 h-4 text-indigo-600" />
          <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">
            Pengaturan Komponen Payroll Custom ({customComponents.length})
          </h3>
        </div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors cursor-pointer"
        >
          {isOpen ? 'Sembunyikan Panel' : 'Kelola Komponen Kustom'} &rarr;
        </button>
      </div>

      {isOpen && (
        <div className="p-5 space-y-6 animate-fadeIn">
          {/* Form to add new */}
          <form onSubmit={handleAdd} className="bg-indigo-50/40 p-4 rounded-xl border border-indigo-100/50 space-y-4">
            <h4 className="text-[11px] font-extrabold text-indigo-950 uppercase tracking-widest flex items-center gap-1.5">
              <Plus className="w-3.5 h-3.5 text-indigo-600" />
              Buat Komponen Baru (Pendapatan / Potongan)
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider">Nama Komponen</label>
                <input
                  type="text"
                  placeholder="Contoh: Tunjangan Proyek, Potongan Dana Sosial"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1.5 block w-full text-xs font-semibold rounded-lg border border-slate-200 px-3 py-2 text-slate-800 bg-white focus:outline-indigo-600"
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider">Tipe Komponen</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as 'earning' | 'deduction')}
                  className="mt-1.5 block w-full text-xs font-semibold rounded-lg border border-slate-200 px-3 py-2 text-slate-800 bg-white focus:outline-indigo-600"
                >
                  <option value="earning">Pendapatan (Earning)</option>
                  <option value="deduction">Potongan (Deduction)</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider">Keterangan / Deskripsi</label>
                <input
                  type="text"
                  placeholder="Keterangan singkat"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="mt-1.5 block w-full text-xs font-semibold rounded-lg border border-slate-200 px-3 py-2 text-slate-800 bg-white focus:outline-indigo-600"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="px-4 py-1.5 bg-indigo-600 text-white text-xs font-bold rounded-lg hover:bg-indigo-700 transition-colors cursor-pointer flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                Tambah Komponen
              </button>
            </div>
          </form>

          {/* List of Custom Components */}
          <div className="space-y-3">
            <h4 className="text-[11px] font-extrabold text-slate-500 uppercase tracking-widest">Daftar Komponen Aktif</h4>
            
            {customComponents.length === 0 ? (
              <div className="p-4 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-center text-xs text-slate-400 font-medium">
                Belum ada komponen payroll kustom yang dikonfigurasi. Buat komponen baru di atas.
              </div>
            ) : (
              <div className="overflow-hidden border border-slate-100 rounded-xl">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-100">
                      <th className="py-2.5 px-4 break-words whitespace-normal">Nama Komponen</th>
                      <th className="py-2.5 px-3 break-words whitespace-normal">Tipe</th>
                      <th className="py-2.5 px-3 break-words whitespace-normal">Keterangan</th>
                      <th className="py-2.5 px-4 text-center break-words whitespace-normal">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 text-slate-700">
                    {customComponents.map((comp) => {
                      const isEditing = editingId === comp.id;
                      return (
                        <tr key={comp.id} className="hover:bg-slate-50/50 font-medium">
                          <td className="py-2.5 px-4 break-words whitespace-normal max-w-[150px]">
                            {isEditing ? (
                              <input
                                type="text"
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                                className="px-2 py-1 text-xs border border-slate-200 rounded focus:outline-indigo-600 font-bold text-slate-800 w-full"
                              />
                            ) : (
                              <span className="font-bold text-slate-800 break-words block">{comp.name}</span>
                            )}
                          </td>
                          <td className="py-2.5 px-3 break-words whitespace-normal">
                            {isEditing ? (
                              <select
                                value={editType}
                                onChange={(e) => setEditType(e.target.value as 'earning' | 'deduction')}
                                className="px-2 py-1 text-xs border border-slate-200 rounded focus:outline-indigo-600 bg-white font-semibold"
                              >
                                <option value="earning">Pendapatan</option>
                                <option value="deduction">Potongan</option>
                              </select>
                            ) : (
                              <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                                comp.type === 'earning' 
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                                  : 'bg-rose-50 text-rose-700 border border-rose-100'
                              }`}>
                                {comp.type === 'earning' ? 'Pendapatan' : 'Potongan'}
                              </span>
                            )}
                          </td>
                          <td className="py-2.5 px-3 break-words whitespace-normal max-w-[250px]">
                            {isEditing ? (
                              <input
                                type="text"
                                value={editDescription}
                                onChange={(e) => setEditDescription(e.target.value)}
                                className="px-2 py-1 text-xs border border-slate-200 rounded focus:outline-indigo-600 w-full text-slate-600"
                              />
                            ) : (
                              <span className="text-slate-500 text-[11px] break-words block">{comp.description || '-'}</span>
                            )}
                          </td>
                          <td className="py-2.5 px-4 text-center">
                            {isEditing ? (
                              <div className="flex justify-center items-center gap-1.5">
                                <button
                                  onClick={() => handleSaveEdit(comp.id)}
                                  className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => setEditingId(null)}
                                  className="p-1 text-slate-400 hover:bg-slate-100 rounded"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ) : (
                              <div className="flex justify-center items-center gap-1.5">
                                <button
                                  onClick={() => handleStartEdit(comp)}
                                  className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => onDeleteCustomComponent(comp.id)}
                                  className="p-1 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
