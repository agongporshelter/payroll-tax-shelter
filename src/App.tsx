import { useState, useEffect } from 'react';
import { 
  Employee, 
  SalaryMaster, 
  AttendanceOT, 
  VariableInput, 
  BPJSConfig, 
  TaxParameters,
  CustomComponent
} from './types';

// Cloud Database Services
import {
  fetchAllCloudData,
  saveEmployeeCloud,
  deleteEmployeeCloud,
  saveSalaryCloud,
  saveAttendanceCloud,
  saveVariableCloud,
  saveCustomComponentCloud,
  deleteCustomComponentCloud
} from './lib/dbService';

// Components
import DashboardRecon from './components/DashboardRecon';
import Parameters from './components/Parameters';
import EmployeeMaster from './components/EmployeeMaster';
import SalaryMasterComponent from './components/SalaryMaster';
import AttendanceOTComponent from './components/AttendanceOT';
import PayrollInput from './components/PayrollInput';
import BPJSDetails from './components/BPJSDetails';
import PPh21Details from './components/PPh21Details';
import TERTable from './components/TERTable';
import PayrollWorkbook from './components/PayrollWorkbook';
import ClientCosting from './components/ClientCosting';
import PayslipView from './components/PayslipView';

// Sample Seeds
import { 
  INITIAL_EMPLOYEES, 
  INITIAL_SALARY_MASTER, 
  generateAttendanceOTHistory, 
  generateVariableInputsHistory 
} from './utils/sampleData';

import { 
  Briefcase, 
  Settings, 
  Users, 
  DollarSign, 
  Watch, 
  PlusCircle, 
  ShieldCheck, 
  Landmark, 
  FileSpreadsheet, 
  Building, 
  FileText, 
  LayoutDashboard,
  Calendar,
  AlertTriangle,
  Table
} from 'lucide-react';

export default function App() {
  // State initialization
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [salaryMaster, setSalaryMaster] = useState<SalaryMaster[]>([]);
  const [attendanceOT, setAttendanceOT] = useState<AttendanceOT[]>([]);
  const [variables, setVariables] = useState<VariableInput[]>([]);
  const [customComponents, setCustomComponents] = useState<CustomComponent[]>([]);
  
  const [selectedMonth, setSelectedMonth] = useState<number>(11); // Defaults to November (Routine TER)
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isLoadingCloud, setIsLoadingCloud] = useState<boolean>(true);

  // BPJS configuration state (as of 2026)
  const [bpjsConfig, setBpjsConfig] = useState<BPJSConfig>({
    kesehatanEmployerRate: 0.04, // 4%
    kesehatanEmployeeRate: 0.01, // 1%
    kesehatanCeiling: 12000000,  // Max salary base Rp 12M
    kesehatanFloor: 2200000,    // Standard UMR
    jhtEmployerRate: 0.037,      // 3.7%
    jhtEmployeeRate: 0.02,       // 2%
    jpEmployerRate: 0.02,        // 2%
    jpEmployeeRate: 0.01,        // 1%
    jpCeiling: 10400000,         // Max salary base Rp 10.4M
    jkmEmployerRate: 0.003       // 0.3%
  });

  // Tax parameters state (as of 2026)
  const [taxParams, setTaxParams] = useState<TaxParameters>({
    biayaJabatanRate: 0.05,        // 5%
    biayaJabatanMaxMonthly: 500000, // Capped at Rp 500k/mo
    biayaJabatanMaxYearly: 6000000, // Capped at Rp 6.0M/yr
    ptkpRates: {
      'TK/0': 54000000,
      'TK/1': 58500000,
      'TK/2': 63000000,
      'TK/3': 67500000,
      'K/0': 58500000,
      'K/1': 63000000,
      'K/2': 67500000,
      'K/3': 72000000
    }
  });

  // Load state from Cloud Firestore
  useEffect(() => {
    async function loadCloudData() {
      try {
        setIsLoadingCloud(true);
        const data = await fetchAllCloudData();
        setEmployees(data.employees);
        setSalaryMaster(data.salaryMaster);
        setAttendanceOT(data.attendanceOT);
        setVariables(data.variables);

        // Dynamic auto-migration: check if core components exist. If not, write and add them.
        const coreComponents: CustomComponent[] = [
          { id: 'comp_bonus', name: 'Bonus / THR', type: 'earning', description: 'THR Bulan 4 / Tunjangan Hari Raya dan Kinerja' },
          { id: 'comp_incentive', name: 'Insentif / Komisi', type: 'earning', description: 'Insentif penjualan dan komisi proyek' },
          { id: 'comp_loan', name: 'Pinjaman Koperasi', type: 'deduction', description: 'Angsuran pinjaman koperasi karyawan' },
          { id: 'comp_other', name: 'Potongan Lain (SPSI/Kas)', type: 'deduction', description: 'Potongan sosial, iuran SPSI, atau kas' }
        ];

        const loadedComps = [...data.customComponents];
        for (const core of coreComponents) {
          if (!loadedComps.some(c => c.id === core.id)) {
            loadedComps.push(core);
            await saveCustomComponentCloud(core);
          }
        }
        setCustomComponents(loadedComps);
      } catch (err) {
        console.error("Gagal memuat data dari Cloud Firestore:", err);
      } finally {
        setIsLoadingCloud(false);
      }
    }
    loadCloudData();
  }, []);

  // State Handlers
  const handleAddEmployee = async (newEmp: Employee) => {
    const updatedEmp = [...employees, newEmp];
    
    // Add default salary master entry
    const defSal = { employeeId: newEmp.id, basicSalary: 5200000, fixedAllowance: 400000, variableAllowance: 200000 };
    const updatedSal = [...salaryMaster, defSal];

    // Add default attendance & variables for all 12 months for this employee
    const updatedAtt = [...attendanceOT];
    const updatedVar = [...variables];
    
    try {
      await saveEmployeeCloud(newEmp);
      await saveSalaryCloud(defSal);

      for (let m = 1; m <= 12; m++) {
        const attItem = {
          employeeId: newEmp.id,
          month: m,
          actualWorkDays: 22,
          unpaidLeaveDays: 0,
          otHours: 0
        };
        const varItem = {
          employeeId: newEmp.id,
          month: m,
          bonus: 0,
          incentive: 0,
          loanDeduction: 0,
          otherDeduction: 50000,
          customValues: {}
        };
        updatedAtt.push(attItem);
        updatedVar.push(varItem);

        await saveAttendanceCloud(attItem);
        await saveVariableCloud(varItem);
      }

      setEmployees(updatedEmp);
      setSalaryMaster(updatedSal);
      setAttendanceOT(updatedAtt);
      setVariables(updatedVar);
    } catch (e) {
      console.error("Gagal menyimpan karyawan baru ke cloud:", e);
    }
  };

  const handleUpdateEmployee = async (updatedEmp: Employee) => {
    try {
      await saveEmployeeCloud(updatedEmp);
      const updatedList = employees.map(e => e.id === updatedEmp.id ? updatedEmp : e);
      setEmployees(updatedList);
    } catch (e) {
      console.error("Gagal memperbarui karyawan di cloud:", e);
    }
  };

  const handleDeleteEmployee = async (id: string) => {
    try {
      await deleteEmployeeCloud(id);
      setEmployees(employees.filter(e => e.id !== id));
      setSalaryMaster(salaryMaster.filter(s => s.employeeId !== id));
      setAttendanceOT(attendanceOT.filter(a => a.employeeId !== id));
      setVariables(variables.filter(v => v.employeeId !== id));
    } catch (e) {
      console.error("Gagal menghapus karyawan dari cloud:", e);
    }
  };

  const handleUpdateSalary = async (newSalary: SalaryMaster) => {
    try {
      await saveSalaryCloud(newSalary);
      setSalaryMaster(salaryMaster.map(s => s.employeeId === newSalary.employeeId ? newSalary : s));
    } catch (e) {
      console.error("Gagal memperbarui gaji di cloud:", e);
    }
  };

  const handleUpdateAttendance = async (newAtt: AttendanceOT) => {
    try {
      await saveAttendanceCloud(newAtt);
      const exists = attendanceOT.some(a => a.employeeId === newAtt.employeeId && a.month === newAtt.month);
      if (exists) {
        setAttendanceOT(attendanceOT.map(a => (a.employeeId === newAtt.employeeId && a.month === newAtt.month) ? newAtt : a));
      } else {
        setAttendanceOT([...attendanceOT, newAtt]);
      }
    } catch (e) {
      console.error("Gagal memperbarui kehadiran di cloud:", e);
    }
  };

  const handleUpdateVariables = async (newVar: VariableInput) => {
    try {
      await saveVariableCloud(newVar);
      const exists = variables.some(v => v.employeeId === newVar.employeeId && v.month === newVar.month);
      if (exists) {
        setVariables(variables.map(v => (v.employeeId === newVar.employeeId && v.month === newVar.month) ? newVar : v));
      } else {
        setVariables([...variables, newVar]);
      }
    } catch (e) {
      console.error("Gagal memperbarui variabel payroll di cloud:", e);
    }
  };

  // CRUD Custom Components Handlers
  const handleAddCustomComponent = async (newComp: CustomComponent) => {
    try {
      await saveCustomComponentCloud(newComp);
      setCustomComponents([...customComponents, newComp]);
    } catch (e) {
      console.error("Gagal menambahkan komponen kustom ke cloud:", e);
    }
  };

  const handleUpdateCustomComponent = async (updatedComp: CustomComponent) => {
    try {
      await saveCustomComponentCloud(updatedComp);
      setCustomComponents(customComponents.map(c => c.id === updatedComp.id ? updatedComp : c));
    } catch (e) {
      console.error("Gagal memperbarui komponen kustom di cloud:", e);
    }
  };

  const handleDeleteCustomComponent = async (id: string) => {
    try {
      await deleteCustomComponentCloud(id);
      setCustomComponents(customComponents.filter(c => c.id !== id));

      // Clean up dynamic values associated with this component
      const updatedVars = variables.map(v => {
        if (v.customValues && id in v.customValues) {
          const { [id]: _, ...rest } = v.customValues;
          const updated = { ...v, customValues: rest };
          saveVariableCloud(updated);
          return updated;
        }
        return v;
      });
      setVariables(updatedVars);
    } catch (e) {
      console.error("Gagal menghapus komponen kustom dari cloud:", e);
    }
  };

  if (isLoadingCloud) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 text-slate-100" id="firestore-loading">
        <div className="flex flex-col items-center space-y-4 max-w-md text-center p-6 bg-slate-950 rounded-2xl border border-slate-800 shadow-xl">
          <div className="relative">
            <div className="w-12 h-12 border-4 border-indigo-600/30 border-t-indigo-500 rounded-full animate-spin"></div>
            <Briefcase className="w-5 h-5 text-indigo-500 absolute inset-0 m-auto animate-pulse" />
          </div>
          <div>
            <h1 className="text-sm font-black tracking-tight text-white uppercase">Menghubungkan ke Cloud Firestore...</h1>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Mohon tunggu sejenak sementara sistem Shelter Indonesia menyinkronkan database karyawan, penggajian, dan regulasi terbaru 2026.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const monthsList = [
    { num: 1, name: 'Januari' },
    { num: 2, name: 'Februari' },
    { num: 3, name: 'Maret' },
    { num: 4, name: 'April (Periode THR & Bonus)' },
    { num: 5, name: 'Mei' },
    { num: 6, name: 'Juni' },
    { num: 7, name: 'Juli' },
    { num: 8, name: 'Agustus' },
    { num: 9, name: 'September' },
    { num: 10, name: 'Oktober' },
    { num: 11, name: 'November' },
    { num: 12, name: 'Desember (Rekonsiliasi PPh 21 Tahunan)' }
  ];

  // Worksheet tabs config
  const tabs = [
    { id: 'dashboard', name: 'Dashboard & Reconciliation', icon: LayoutDashboard },
    { id: 'employees', name: 'Employee Master', icon: Users },
    { id: 'salary', name: 'Master Penggajian', icon: DollarSign },
    { id: 'attendance', name: 'Attendance & Overtime (OT)', icon: Watch },
    { id: 'variables', name: 'Variable Payroll Input', icon: PlusCircle },
    { id: 'bpjs', name: 'BPJS Contributions', icon: ShieldCheck },
    { id: 'pph21', name: 'PPh 21 Compliance', icon: Landmark },
    { id: 'tertable', name: 'TER Table (PMK 168)', icon: Table },
    { id: 'workbook', name: 'Payroll Workbook', icon: FileSpreadsheet },
    { id: 'costing', name: 'Client Costing', icon: Building },
    { id: 'payslips', name: 'Payslips', icon: FileText },
    { id: 'parameters', name: 'Regulatory Parameters', icon: Settings }
  ];

  return (
    <div className="flex h-screen w-full bg-slate-100 font-sans text-slate-800 antialiased overflow-hidden" id="app-root">
      
      {/* Sidebar Navigation */}
      <aside className="w-64 flex flex-col bg-slate-900 text-slate-100 shrink-0 border-r border-slate-800 z-20" id="sidebar-nav">
        
        {/* Sidebar Header / Brand */}
        <div className="p-5 border-b border-slate-800 flex items-center space-x-3 bg-slate-950">
          <div className="p-2 bg-blue-600 rounded-lg text-white shadow-md">
            <Briefcase className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-sm font-black tracking-tight flex flex-col">
              <span className="text-white leading-none">SHELTER</span>
              <span className="text-slate-400 text-[10px] uppercase font-bold tracking-widest mt-1">INDONESIA</span>
            </h1>
            <p className="text-[9px] text-blue-400 font-bold tracking-wider mt-0.5">SISTEM GAJI & PAJAK 2026</p>
          </div>
        </div>

        {/* Processing Month Navigator inside Sidebar */}
        <div className="p-4 bg-slate-900/50 border-b border-slate-800/80">
          <div className="flex flex-col space-y-1.5 bg-slate-950/60 p-3 rounded-lg border border-slate-800">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-blue-500" />
              Bulan Penggajian
            </label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
              className="text-xs font-black bg-slate-900 text-white rounded border border-slate-700 px-2.5 py-1.5 w-full focus:outline-none focus:border-blue-500 transition-colors"
            >
              {monthsList.map(m => (
                <option key={m.num} value={m.num}>{m.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Sidebar Vertical Tabs Navigation */}
        <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-1 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full px-3 py-2.5 rounded-lg text-xs font-bold flex items-center gap-2.5 transition-all cursor-pointer text-left ${
                  isActive 
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-950/50 font-black' 
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span className="break-words whitespace-normal leading-tight">{tab.name}</span>
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer Area */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex flex-col space-y-3">
          <div className="text-center text-[10px] text-slate-500 font-medium">
            <span>Sesuai BPJS & PPh 21 TER</span>
            <span className="block text-[8px] text-slate-600 font-mono mt-0.5">v2.1.26</span>
          </div>
        </div>

      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden bg-slate-100" id="main-content-panel">
        
        {/* Dynamic Panel Header Topbar */}
        <header className="bg-white border-b border-slate-200/80 px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between shrink-0 gap-4 shadow-sm z-10">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold uppercase tracking-widest bg-blue-100 text-blue-700 px-2 py-0.5 rounded-md">
                Modul {tabs.findIndex(t => t.id === activeTab) + 1}
              </span>
              <span className="text-xs text-slate-400 font-bold font-mono">/ {monthsList.find(m => m.num === selectedMonth)?.name}</span>
            </div>
            <h2 className="text-lg font-extrabold text-slate-900 tracking-tight mt-1">
              {tabs.find(t => t.id === activeTab)?.name}
            </h2>
          </div>

          {/* Quick Mini KPI Metrics inside topbar */}
          <div className="flex items-center gap-4 text-xs font-bold text-slate-600 bg-slate-50 px-4 py-2 rounded-xl border border-slate-200/60 shadow-inner shrink-0">
            <div className="flex items-center gap-1.5 border-r border-slate-200 pr-3">
              <Users className="w-4 h-4 text-slate-400" />
              <span>Jumlah Karyawan: <span className="text-slate-900 font-black">{employees.length}</span></span>
            </div>
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>BPJS Aktif: <span className="text-slate-900 font-black">{employees.filter(e => e.bpjsActive).length}</span></span>
            </div>
          </div>
        </header>

        {/* Scrollable Main Content Frame */}
        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* December warning banner if tab isn't dashboard or PPh 21 */}
          {selectedMonth === 12 && activeTab !== 'pph21' && activeTab !== 'dashboard' && (
            <div className="bg-amber-50 border border-amber-200 text-amber-950 p-4 rounded-xl flex items-center justify-between text-xs font-bold shadow-sm">
              <span className="flex items-center gap-2.5">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                <span>
                  Bulan penggajian saat ini adalah Desember. Sistem secara otomatis menjalankan rekonsiliasi tahunan (pemberlakuan tarif progresif Pasal 17 ayat (1) huruf a UU PPh) di tab PPh 21.
                </span>
              </span>
              <button 
                onClick={() => setActiveTab('pph21')}
                className="text-blue-600 hover:text-blue-800 underline ml-4 shrink-0 transition-colors cursor-pointer"
              >
                Tinjau Rekonsiliasi &rarr;
              </button>
            </div>
          )}

          {/* Active Tab Panel container */}
          <div className="bg-transparent" id="active-tab-container">
            {activeTab === 'dashboard' && (
              <DashboardRecon
                employees={employees}
                salaryMaster={salaryMaster}
                attendanceOT={attendanceOT}
                variables={variables}
                selectedMonth={selectedMonth}
                customComponents={customComponents}
              />
            )}

            {activeTab === 'employees' && (
              <EmployeeMaster
                employees={employees}
                onAddEmployee={handleAddEmployee}
                onUpdateEmployee={handleUpdateEmployee}
                onDeleteEmployee={handleDeleteEmployee}
              />
            )}

            {activeTab === 'salary' && (
              <SalaryMasterComponent
                employees={employees}
                salaryMaster={salaryMaster}
                selectedMonth={selectedMonth}
                onMonthChange={setSelectedMonth}
                onUpdateSalary={handleUpdateSalary}
              />
            )}

            {activeTab === 'attendance' && (
              <AttendanceOTComponent
                employees={employees}
                salaryMaster={salaryMaster}
                attendanceOT={attendanceOT}
                selectedMonth={selectedMonth}
                onUpdateAttendance={handleUpdateAttendance}
              />
            )}

            {activeTab === 'variables' && (
              <PayrollInput
                employees={employees}
                variables={variables}
                selectedMonth={selectedMonth}
                onUpdateVariables={handleUpdateVariables}
                customComponents={customComponents}
                onAddCustomComponent={handleAddCustomComponent}
                onUpdateCustomComponent={handleUpdateCustomComponent}
                onDeleteCustomComponent={handleDeleteCustomComponent}
              />
            )}

            {activeTab === 'bpjs' && (
              <BPJSDetails
                employees={employees}
                salaryMaster={salaryMaster}
                bpjsConfig={bpjsConfig}
              />
            )}

            {activeTab === 'pph21' && (
              <PPh21Details
                employees={employees}
                salaryMaster={salaryMaster}
                attendanceOT={attendanceOT}
                variables={variables}
                selectedMonth={selectedMonth}
                taxParams={taxParams}
                customComponents={customComponents}
              />
            )}

            {activeTab === 'tertable' && (
              <TERTable />
            )}

            {activeTab === 'workbook' && (
              <PayrollWorkbook
                employees={employees}
                salaryMaster={salaryMaster}
                attendanceOT={attendanceOT}
                variables={variables}
                selectedMonth={selectedMonth}
                customComponents={customComponents}
              />
            )}

            {activeTab === 'costing' && (
              <ClientCosting
                employees={employees}
                salaryMaster={salaryMaster}
                attendanceOT={attendanceOT}
                variables={variables}
                selectedMonth={selectedMonth}
                customComponents={customComponents}
              />
            )}

            {activeTab === 'payslips' && (
              <PayslipView
                employees={employees}
                salaryMaster={salaryMaster}
                attendanceOT={attendanceOT}
                variables={variables}
                selectedMonth={selectedMonth}
                customComponents={customComponents}
              />
            )}

            {activeTab === 'parameters' && (
              <Parameters
                bpjsConfig={bpjsConfig}
                taxParams={taxParams}
                onUpdateBPJS={setBpjsConfig}
                onUpdateTax={setTaxParams}
              />
            )}
          </div>

          {/* Clean inline footer inside main content scroll view */}
          <footer className="text-center text-[11px] text-slate-400 py-6 border-t border-slate-200/60 mt-12 space-y-1">
            <p className="font-semibold text-slate-500">
              SHELTER INDONESIA • Sistem Kertas Kerja Penggajian, BPJS, dan Pajak PPh 21
            </p>
            <p className="text-[10px]">
              Kertas kerja ini sepenuhnya mematuhi Peraturan Pemerintah Nomor 58 Tahun 2023, Peraturan Menteri Keuangan Nomor 168 Tahun 2023 (Penerapan Tarif Efektif Rata-rata / TER), serta batas atas (ceiling) iuran BPJS terbaru Tahun 2026.
            </p>
          </footer>

        </main>
      </div>

    </div>
  );
}
