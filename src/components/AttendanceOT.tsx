import { useState, useEffect, FormEvent } from 'react';
import { Employee, SalaryMaster, AttendanceOT } from '../types';
import { calculateOTPay } from '../utils/taxCalc';
import { Search, Edit2, Check, X, Watch, UserX, CalendarClock } from 'lucide-react';

interface AttendanceOTProps {
  employees: Employee[];
  salaryMaster: SalaryMaster[];
  attendanceOT: AttendanceOT[];
  selectedMonth: number;
  onUpdateAttendance: (att: AttendanceOT) => void;
}

export default function AttendanceOTComponent({
  employees,
  salaryMaster,
  attendanceOT,
  selectedMonth,
  onUpdateAttendance
}: AttendanceOTProps) {
  
  const [searchTerm, setSearchTerm] = useState('');
  
  // Selected employee for quick configuration card
  const [selectedEmpId, setSelectedEmpId] = useState<string>(employees[0]?.id || '');
  const [cardActualDays, setCardActualDays] = useState<number>(22);
  const [cardUnpaidLeave, setCardUnpaidLeave] = useState<number>(0);
  const [cardOtHours, setCardOtHours] = useState<number>(0);

  // Sync card inputs when selected employee or month changes
  useEffect(() => {
    if (selectedEmpId) {
      const attObj = attendanceOT.find(a => a.employeeId === selectedEmpId && a.month === selectedMonth);
      if (attObj) {
        setCardActualDays(attObj.actualWorkDays);
        setCardUnpaidLeave(attObj.unpaidLeaveDays);
        setCardOtHours(attObj.otHours);
      } else {
        setCardActualDays(22);
        setCardUnpaidLeave(0);
        setCardOtHours(0);
      }
    }
  }, [selectedEmpId, selectedMonth, attendanceOT]);

  // Set default employee if selectedEmpId is empty but employees are available
  useEffect(() => {
    if (!selectedEmpId && employees.length > 0) {
      setSelectedEmpId(employees[0].id);
    }
  }, [employees]);

  // Editing state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [actualDaysEdit, setActualDaysEdit] = useState(22);
  const [unpaidLeaveEdit, setUnpaidLeaveEdit] = useState(0);
  const [otHoursEdit, setOtHoursEdit] = useState(0);

  const formatIDR = (num: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(num);
  };

  const handleStartEdit = (empId: string, att: AttendanceOT) => {
    setEditingId(empId);
    setActualDaysEdit(att.actualWorkDays);
    setUnpaidLeaveEdit(att.unpaidLeaveDays);
    setOtHoursEdit(att.otHours);
  };

  const handleSaveEdit = (empId: string) => {
    onUpdateAttendance({
      employeeId: empId,
      month: selectedMonth,
      actualWorkDays: actualDaysEdit,
      unpaidLeaveDays: unpaidLeaveEdit,
      otHours: otHoursEdit
    });
    setEditingId(null);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
  };

  const handleCardSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!selectedEmpId) return;
    onUpdateAttendance({
      employeeId: selectedEmpId,
      month: selectedMonth,
      actualWorkDays: cardActualDays,
      unpaidLeaveDays: cardUnpaidLeave,
      otHours: cardOtHours
    });
  };

  const filteredEmployees = employees.filter(emp => 
    emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.clientName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6" id="attendance-ot-panel">
      
      {/* Quick Attendance & Overtime Input Card */}
      <div className="bg-white p-5 rounded-xl border border-slate-200/60 shadow-sm space-y-4">
        <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-3">
          <CalendarClock className="w-4 h-4 text-indigo-600" />
          Konfigurasi Kehadiran & Lembur Cepat
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
            <label className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider">Hari Kerja (Kehadiran)</label>
            <input
              type="number"
              value={cardActualDays}
              onChange={(e) => setCardActualDays(parseInt(e.target.value) || 0)}
              className="mt-1.5 block w-full text-xs font-semibold rounded-lg border border-slate-200 px-3 py-2 text-slate-800 focus:outline-indigo-600"
              placeholder="misal: 22"
            />
          </div>

          <div>
            <label className="block text-[10px] text-rose-600 font-bold uppercase tracking-wider">Hari Mangkir (Tanpa Upah)</label>
            <input
              type="number"
              value={cardUnpaidLeave}
              onChange={(e) => setCardUnpaidLeave(parseInt(e.target.value) || 0)}
              className="mt-1.5 block w-full text-xs font-semibold rounded-lg border border-slate-200 px-3 py-2 text-slate-800 focus:outline-indigo-600"
              placeholder="misal: 0"
            />
          </div>

          <div>
            <label className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider">Jam Lembur (Overtime)</label>
            <input
              type="number"
              step="0.5"
              value={cardOtHours}
              onChange={(e) => setCardOtHours(parseFloat(e.target.value) || 0)}
              className="mt-1.5 block w-full text-xs font-semibold rounded-lg border border-slate-200 px-3 py-2 text-slate-800 focus:outline-indigo-600"
              placeholder="misal: 10"
            />
          </div>

          <div className="md:col-span-4 flex justify-end">
            <button
              type="submit"
              className="px-5 py-2 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <Check className="w-4 h-4" />
              Simpan Catatan Kehadiran
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
            placeholder="Cari ID, nama, atau departemen..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 pr-4 py-2 w-full text-xs font-semibold rounded-lg border border-slate-200 text-slate-800 focus:outline-indigo-600"
          />
        </div>
        <div className="text-xs text-slate-500 font-semibold bg-slate-50 p-2 rounded-lg border border-slate-100 flex items-center gap-1.5">
          <Watch className="w-4 h-4 text-indigo-600" />
          <span>Skema Overtime Regulasi Indonesia: 1,5x untuk jam pertama, 2,0x untuk jam-jam berikutnya. Upah lembur per jam dasar = (Gaji Pokok + Tunjangan Tetap) / 173</span>
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
                <th className="py-3 px-3 break-words whitespace-normal">Mitra Klien</th>
                <th className="py-3 px-3 text-center break-words whitespace-normal">Hari Kerja (Kehadiran)</th>
                <th className="py-3 px-3 text-center text-rose-600 break-words whitespace-normal">Mangkir (Unpaid Leave)</th>
                <th className="py-3 px-3 text-center break-words whitespace-normal">Jam Lembur (Overtime)</th>
                <th className="py-3 px-3 text-right break-words whitespace-normal">Upah Dasar per Jam (GP+TT)/173</th>
                <th className="py-3 px-3 text-right text-indigo-700 break-words whitespace-normal">Uang Lembur Dihitung</th>
                <th className="py-3 px-4 text-center break-words whitespace-normal">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredEmployees.map((emp) => {
                const sal = salaryMaster.find(s => s.employeeId === emp.id && s.month === selectedMonth) || salaryMaster.find(s => s.employeeId === emp.id) || {
                  employeeId: emp.id,
                  basicSalary: 0,
                  fixedAllowance: 0,
                  variableAllowance: 0
                };
                
                const att = attendanceOT.find(a => a.employeeId === emp.id && a.month === selectedMonth) || {
                  employeeId: emp.id,
                  month: selectedMonth,
                  actualWorkDays: 22,
                  unpaidLeaveDays: 0,
                  otHours: 0
                };

                const isEditing = editingId === emp.id;
                
                const normalSalaryBase = sal.basicSalary + sal.fixedAllowance;
                const hourlyRate = normalSalaryBase / 173;
                
                const otHours = isEditing ? otHoursEdit : att.otHours;
                const otPay = calculateOTPay(normalSalaryBase, otHours);

                return (
                  <tr key={emp.id} className="hover:bg-slate-50/40 font-medium">
                    <td className="py-3.5 px-4 font-bold text-slate-800 font-mono break-all">{emp.id}</td>
                    <td className="py-3.5 px-3 break-words whitespace-normal">
                      <span className="font-bold text-slate-800 block">{emp.name}</span>
                    </td>
                    <td className="py-3.5 px-3 break-words whitespace-normal">
                      <span className="text-slate-500 block">{emp.clientName}</span>
                    </td>

                    {/* Actual Work Days */}
                    <td className="py-3.5 px-3 text-center font-bold">
                      {isEditing ? (
                        <input
                          type="number"
                          value={actualDaysEdit}
                          onChange={(e) => setActualDaysEdit(parseInt(e.target.value) || 0)}
                          className="text-xs font-bold px-2 py-1 border border-slate-300 rounded text-center w-16 focus:outline-indigo-600"
                        />
                      ) : (
                        <span>{att.actualWorkDays} hari</span>
                      )}
                    </td>

                    {/* Unpaid Leave Days (Mangkir) */}
                    <td className={`py-3.5 px-3 text-center font-bold ${att.unpaidLeaveDays > 0 ? 'text-rose-600 bg-rose-50/20' : ''}`}>
                      {isEditing ? (
                        <input
                          type="number"
                          value={unpaidLeaveEdit}
                          onChange={(e) => setUnpaidLeaveEdit(parseInt(e.target.value) || 0)}
                          className="text-xs font-bold px-2 py-1 border border-slate-300 rounded text-center w-16 text-rose-600 focus:outline-rose-600 font-mono"
                        />
                      ) : (
                        <span className="flex items-center justify-center gap-1">
                          {att.unpaidLeaveDays > 0 && <UserX className="w-3.5 h-3.5 text-rose-600" />}
                          {att.unpaidLeaveDays} hari
                        </span>
                      )}
                    </td>

                    {/* Overtime Hours */}
                    <td className="py-3.5 px-3 text-center font-bold">
                      {isEditing ? (
                        <input
                          type="number"
                          value={otHoursEdit}
                          onChange={(e) => setOtHoursEdit(parseFloat(e.target.value) || 0)}
                          className="text-xs font-bold px-2 py-1 border border-slate-300 rounded text-center w-20 focus:outline-indigo-600 font-mono"
                        />
                      ) : (
                        <span className="text-emerald-700 font-mono">{att.otHours} jam</span>
                      )}
                    </td>

                    {/* Hourly Base */}
                    <td className="py-3.5 px-3 text-right font-mono text-slate-500 font-semibold">
                      <span>{formatIDR(hourlyRate)}</span>
                    </td>

                    {/* Calculated Overtime Pay */}
                    <td className="py-3.5 px-3 text-right font-mono font-bold text-indigo-700">
                      <span>{formatIDR(otPay)}</span>
                    </td>

                    {/* Action Column */}
                    <td className="py-3.5 px-4 text-center">
                      {isEditing ? (
                        <div className="flex justify-center items-center gap-1">
                          <button
                            onClick={() => handleSaveEdit(emp.id)}
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
                        <button
                          onClick={() => handleStartEdit(emp.id, att)}
                          className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-slate-50 rounded"
                          title="Ubah Kehadiran & Lembur"
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
