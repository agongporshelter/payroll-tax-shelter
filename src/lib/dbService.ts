import { collection, doc, getDocs, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from './firebase';
import { Employee, SalaryMaster, AttendanceOT, VariableInput, CustomComponent } from '../types';
import { INITIAL_EMPLOYEES, INITIAL_SALARY_MASTER, generateAttendanceOTHistory, generateVariableInputsHistory } from '../utils/sampleData';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: null,
      email: null,
      emailVerified: null,
      isAnonymous: null,
      tenantId: null,
      providerInfo: []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

const EMP_COL = 'employees';
const SAL_COL = 'salaryMaster';
const ATT_COL = 'attendanceOT';
const VAR_COL = 'variables';
const COMP_COL = 'customComponents';

// Default Custom Components to seed
const DEFAULT_CUSTOM_COMPONENTS: CustomComponent[] = [
  { id: 'comp_transport', name: 'Tunjangan Transportasi', type: 'earning', description: 'Uang transport harian dinas / lapangan' },
  { id: 'comp_makan', name: 'Tunjangan Uang Makan', type: 'earning', description: 'Tunjangan konsumsi bulanan' },
  { id: 'comp_spsi', name: 'Potongan Iuran SPSI', type: 'deduction', description: 'Iuran Serikat Pekerja Seluruh Indonesia' }
];

export async function fetchAllCloudData() {
  try {
    // Check if seeded
    let empSnap;
    try {
      empSnap = await getDocs(collection(db, EMP_COL));
    } catch (e) {
      handleFirestoreError(e, OperationType.GET, EMP_COL);
      return { employees: [], salaryMaster: [], attendanceOT: [], variables: [], customComponents: [] };
    }
    
    if (empSnap.empty) {
      console.log('Cloud database is empty. Auto-seeding default payroll dataset...');
      await seedCloudDatabase();
      // Refetch
      return await fetchAllCloudData();
    }

    // Load employees
    const employees: Employee[] = [];
    empSnap.forEach(doc => {
      employees.push(doc.data() as Employee);
    });

    // Load salaries
    let salSnap;
    try {
      salSnap = await getDocs(collection(db, SAL_COL));
    } catch (e) {
      handleFirestoreError(e, OperationType.GET, SAL_COL);
      return { employees: [], salaryMaster: [], attendanceOT: [], variables: [], customComponents: [] };
    }
    const salaryMaster: SalaryMaster[] = [];
    salSnap.forEach(doc => {
      salaryMaster.push(doc.data() as SalaryMaster);
    });

    // Load attendance
    let attSnap;
    try {
      attSnap = await getDocs(collection(db, ATT_COL));
    } catch (e) {
      handleFirestoreError(e, OperationType.GET, ATT_COL);
      return { employees: [], salaryMaster: [], attendanceOT: [], variables: [], customComponents: [] };
    }
    const attendanceOT: AttendanceOT[] = [];
    attSnap.forEach(doc => {
      attendanceOT.push(doc.data() as AttendanceOT);
    });

    // Load variables
    let varSnap;
    try {
      varSnap = await getDocs(collection(db, VAR_COL));
    } catch (e) {
      handleFirestoreError(e, OperationType.GET, VAR_COL);
      return { employees: [], salaryMaster: [], attendanceOT: [], variables: [], customComponents: [] };
    }
    const variables: VariableInput[] = [];
    varSnap.forEach(doc => {
      variables.push(doc.data() as VariableInput);
    });

    // Load custom components
    let compSnap;
    try {
      compSnap = await getDocs(collection(db, COMP_COL));
    } catch (e) {
      handleFirestoreError(e, OperationType.GET, COMP_COL);
      return { employees: [], salaryMaster: [], attendanceOT: [], variables: [], customComponents: [] };
    }
    const customComponents: CustomComponent[] = [];
    compSnap.forEach(doc => {
      customComponents.push(doc.data() as CustomComponent);
    });

    return {
      employees,
      salaryMaster,
      attendanceOT,
      variables,
      customComponents
    };
  } catch (error) {
    console.error('Error fetching data from Firestore:', error);
    throw error;
  }
}

async function seedCloudDatabase() {
  try {
    // 1. Seed Custom Components
    for (const comp of DEFAULT_CUSTOM_COMPONENTS) {
      await setDoc(doc(db, COMP_COL, comp.id), comp);
    }

    // 2. Seed Employees
    for (const emp of INITIAL_EMPLOYEES) {
      await setDoc(doc(db, EMP_COL, emp.id), emp);
    }

    // 3. Seed Salaries
    for (const sal of INITIAL_SALARY_MASTER) {
      await setDoc(doc(db, SAL_COL, sal.employeeId), sal);
    }

    // 4. Seed Attendance
    const attendanceData = generateAttendanceOTHistory();
    for (const att of attendanceData) {
      const docId = `${att.employeeId}_${att.month}`;
      await setDoc(doc(db, ATT_COL, docId), att);
    }

    // 5. Seed Variables
    const variablesData = generateVariableInputsHistory();
    for (const v of variablesData) {
      const customValues: Record<string, number> = {
        'comp_transport': 220000,
        'comp_makan': 150000
      };
      if (v.employeeId === 'EMP-007') {
        customValues['comp_spsi'] = 0;
      } else {
        customValues['comp_spsi'] = 15000;
      }

      const docId = `${v.employeeId}_${v.month}`;
      await setDoc(doc(db, VAR_COL, docId), {
        ...v,
        customValues
      });
    }

    console.log('Database seeding successfully completed in Cloud Firestore!');
  } catch (e) {
    console.error('Failed to seed Cloud Firestore database:', e);
  }
}

// Write/Update Employee
export async function saveEmployeeCloud(emp: Employee) {
  try {
    await setDoc(doc(db, EMP_COL, emp.id), emp);
  } catch (e) {
    handleFirestoreError(e, OperationType.WRITE, `${EMP_COL}/${emp.id}`);
  }
}

// Delete Employee and related records
export async function deleteEmployeeCloud(id: string) {
  try {
    // Delete employee
    await deleteDoc(doc(db, EMP_COL, id));
    // Delete salary
    await deleteDoc(doc(db, SAL_COL, id));

    for (let m = 1; m <= 12; m++) {
      await deleteDoc(doc(db, ATT_COL, `${id}_${m}`));
      await deleteDoc(doc(db, VAR_COL, `${id}_${m}`));
    }
  } catch (e) {
    handleFirestoreError(e, OperationType.DELETE, `${EMP_COL}/${id}`);
  }
}

// Save/Update Salary
export async function saveSalaryCloud(sal: SalaryMaster) {
  try {
    await setDoc(doc(db, SAL_COL, sal.employeeId), sal);
  } catch (e) {
    handleFirestoreError(e, OperationType.WRITE, `${SAL_COL}/${sal.employeeId}`);
  }
}

// Save/Update Attendance
export async function saveAttendanceCloud(att: AttendanceOT) {
  const docId = `${att.employeeId}_${att.month}`;
  try {
    await setDoc(doc(db, ATT_COL, docId), att);
  } catch (e) {
    handleFirestoreError(e, OperationType.WRITE, `${ATT_COL}/${docId}`);
  }
}

// Save/Update Variables
export async function saveVariableCloud(v: VariableInput) {
  const docId = `${v.employeeId}_${v.month}`;
  try {
    await setDoc(doc(db, VAR_COL, docId), v);
  } catch (e) {
    handleFirestoreError(e, OperationType.WRITE, `${VAR_COL}/${docId}`);
  }
}

// Create/Update Custom Component
export async function saveCustomComponentCloud(comp: CustomComponent) {
  try {
    await setDoc(doc(db, COMP_COL, comp.id), comp);
  } catch (e) {
    handleFirestoreError(e, OperationType.WRITE, `${COMP_COL}/${comp.id}`);
  }
}

// Delete Custom Component
export async function deleteCustomComponentCloud(id: string) {
  try {
    await deleteDoc(doc(db, COMP_COL, id));
  } catch (e) {
    handleFirestoreError(e, OperationType.DELETE, `${COMP_COL}/${id}`);
  }
}
