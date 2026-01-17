// File: pages/admin/AccountAdmin.js
import React, { useEffect, useState, useCallback } from "react";
import { db } from "../../db/firebaseConfig";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import Layout from "../../components/Layout";
import { toast } from "react-toastify";
import {
  FaUserTie,
  FaMoneyBillWave,
  FaUniversity,
  FaCalendarAlt,
  FaCheckCircle,
  FaClock,
  FaExclamationTriangle,
  FaSearch,
  FaEdit,
  FaTrash,
  FaPlus,
  FaFileInvoice,
  FaCreditCard,
  FaCashRegister,
  FaUserGraduate,
  FaChartLine,
  FaSpinner,
  FaFilter,
  FaDownload,
  FaPrint,
  FaEye,
  FaBan,
  FaCheck,
  FaTimes,
  FaCalendarCheck,
  FaArrowLeft,
  FaArrowRight,
  FaInfoCircle,
  FaWallet,
  FaBook,
  FaFootballBall,
  FaHospital,
  FaBus,
  FaHome,
  FaBuilding,
} from "react-icons/fa";

export default function AccountAdmin() {
  const [activeTab, setActiveTab] = useState("teachers");
  const [loading, setLoading] = useState({
    teachers: false,
    students: false,
    feePayments: false,
    feeStructures: false,
  });

  // ==================== TEACHER MANAGEMENT ====================
  const [teachers, setTeachers] = useState([]);
  const [teacherForm, setTeacherForm] = useState({
    docId: null,
    name: "",
    id: "",
    department: "",
    salary: "",
    accountHandler: false,
    isEditing: false,
  });

  // ==================== STUDENT MANAGEMENT ====================
  const [students, setStudents] = useState([]);
  const [studentForm, setStudentForm] = useState({
    docId: null,
    name: "",
    rollNo: "",
    course: "",
    semester: "",
    email: "",
    phone: "",
    password: "123456",
    isEditing: false,
  });

  // ==================== FEE MANAGEMENT ====================
  const [feeStructures, setFeeStructures] = useState([]);
  const [feePayments, setFeePayments] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);

  // ==================== OPTIONAL FEES CONFIG ====================
  const [optionalFeesConfig, setOptionalFeesConfig] = useState({});
  const COMPULSORY_FEES = ["tuition", "exam"]; // Always applicable
  const OPTIONAL_FEES = ["hostel", "library", "sports", "development", "medical", "transport"];
  
  const FEE_TYPE_ICONS = {
    tuition: FaUniversity,
    exam: FaFileInvoice,
    hostel: FaHome,
    library: FaBook,
    sports: FaFootballBall,
    development: FaBuilding,
    medical: FaHospital,
    transport: FaBus,
  };

  const FEE_TYPE_LABELS = {
    tuition: "Tuition Fee",
    exam: "Exam Fee",
    hostel: "Hostel Fee",
    library: "Library Fee",
    sports: "Sports Fee",
    development: "Development Fee",
    medical: "Medical Fee",
    transport: "Transport Fee",
  };

  // ==================== FORMS ====================
  const [feeStructureForm, setFeeStructureForm] = useState({
    id: null,
    semester: "",
    feeType: "tuition",
    amount: "",
    dueDate: "",
    description: "",
    isEditing: false,
  });

  const [paymentForm, setPaymentForm] = useState({
    studentId: "",
    semester: "",
    feeType: "tuition",
    amount: "",
    paymentMethod: "cash",
    transactionId: "",
    remarks: "",
  });

  // ==================== SEARCH & FILTERS ====================
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [selectedSemesterFilter, setSelectedSemesterFilter] = useState("all");
  const [teacherSearch, setTeacherSearch] = useState("");

  // ==================== FETCH ALL DATA ====================
  const fetchAllData = useCallback(async () => {
    setLoading({
      teachers: true,
      students: true,
      feePayments: true,
      feeStructures: true,
    });

    try {
      await Promise.all([
        fetchTeachers(),
        fetchStudents(),
        fetchFeeStructures(),
        fetchFeePayments(),
      ]);
    } catch (error) {
      toast.error("Failed to fetch data");
      console.error(error);
    } finally {
      setLoading({
        teachers: false,
        students: false,
        feePayments: false,
        feeStructures: false,
      });
    }
  }, []);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // ==================== TEACHER FUNCTIONS ====================
  const fetchTeachers = async () => {
    try {
      const q = query(collection(db, "teachers"), orderBy("name"));
      const snapshot = await getDocs(q);
      const teachersData = snapshot.docs.map((doc) => ({
        docId: doc.id,
        ...doc.data(),
      }));
      setTeachers(teachersData);
    } catch (error) {
      throw error;
    }
  };

  const saveTeacher = async () => {
    if (!teacherForm.name || !teacherForm.id || !teacherForm.department) {
      toast.error("Please fill all required fields");
      return;
    }

    try {
      if (teacherForm.isEditing && teacherForm.docId) {
        // Update existing teacher
        await updateDoc(
          doc(db, "teachers", teacherForm.docId),
          {
            name: teacherForm.name,
            id: teacherForm.id,
            department: teacherForm.department,
            salary: Number(teacherForm.salary) || 0,
            accountHandler: teacherForm.accountHandler,
            updatedAt: serverTimestamp(),
          }
        );
        toast.success("Teacher updated successfully");
      } else {
        // Add new teacher
        await addDoc(collection(db, "teachers"), {
          name: teacherForm.name,
          id: teacherForm.id,
          department: teacherForm.department,
          salary: Number(teacherForm.salary) || 0,
          accountHandler: teacherForm.accountHandler,
          salaryPaid: false,
          lastSalaryPaid: null,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        toast.success("Teacher added successfully");
      }

      // Reset form
      setTeacherForm({
        docId: null,
        name: "",
        id: "",
        department: "",
        salary: "",
        accountHandler: false,
        isEditing: false,
      });

      fetchTeachers();
    } catch (error) {
      toast.error(`Failed to ${teacherForm.isEditing ? 'update' : 'add'} teacher`);
      console.error(error);
    }
  };

  const toggleAccountHandler = async (teacherId, value) => {
    try {
      await updateDoc(doc(db, "teachers", teacherId), {
        accountHandler: value,
        updatedAt: serverTimestamp(),
      });
      toast.success(`Teacher ${value ? "assigned as" : "removed from"} account handler`);
      fetchTeachers();
    } catch (error) {
      toast.error("Failed to update account handler");
    }
  };

  const markSalaryPaid = async (teacherId, teacherName) => {
    try {
      await updateDoc(doc(db, "teachers", teacherId), {
        salaryPaid: true,
        lastSalaryPaid: new Date(),
        updatedAt: serverTimestamp(),
      });
      toast.success(`Salary marked as paid for ${teacherName}`);
      fetchTeachers();
    } catch (error) {
      toast.error("Failed to mark salary as paid");
    }
  };

  const deleteTeacher = async (teacherId, teacherName) => {
    if (!window.confirm(`Are you sure you want to delete ${teacherName}?`)) {
      return;
    }

    try {
      await deleteDoc(doc(db, "teachers", teacherId));
      toast.success(`Teacher ${teacherName} deleted successfully`);
      fetchTeachers();
    } catch (error) {
      toast.error("Failed to delete teacher");
      console.error(error);
    }
  };

  // ==================== STUDENT FUNCTIONS ====================
  const fetchStudents = async () => {
    try {
      const q = query(collection(db, "students"), orderBy("rollNo"));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((doc) => ({
        docId: doc.id,
        ...doc.data(),
      }));
      setStudents(data);
      
      // Initialize optional fees config from student data
      const config = {};
      data.forEach(student => {
        config[student.docId] = student.optionalFees || {};
      });
      setOptionalFeesConfig(config);
    } catch (error) {
      throw error;
    }
  };

  const saveStudent = async () => {
    if (!studentForm.name || !studentForm.rollNo || !studentForm.course || !studentForm.semester) {
      toast.error("Please fill all required fields");
      return;
    }

    try {
      if (studentForm.isEditing && studentForm.docId) {
        // Update existing student
        await updateDoc(
          doc(db, "students", studentForm.docId),
          {
            name: studentForm.name,
            rollNo: studentForm.rollNo,
            course: studentForm.course,
            semester: Number(studentForm.semester),
            email: studentForm.email || "",
            phone: studentForm.phone || "",
            updatedAt: serverTimestamp(),
          }
        );
        toast.success("Student updated successfully");
      } else {
        // Check if roll number already exists
        const existingStudent = students.find(s => s.rollNo === studentForm.rollNo);
        if (existingStudent) {
          toast.error("Student with this roll number already exists");
          return;
        }

        // Add new student
        await addDoc(collection(db, "students"), {
          name: studentForm.name,
          rollNo: studentForm.rollNo,
          course: studentForm.course,
          semester: Number(studentForm.semester),
          email: studentForm.email || "",
          phone: studentForm.phone || "",
          feeStatus: {},
          optionalFees: {},
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        toast.success("Student added successfully");
      }

      // Reset form
      setStudentForm({
        docId: null,
        name: "",
        rollNo: "",
        course: "",
        semester: "",
        email: "",
        phone: "",
        password: "123456",
        isEditing: false,
      });

      fetchStudents();
    } catch (error) {
      toast.error(`Failed to ${studentForm.isEditing ? 'update' : 'add'} student`);
      console.error(error);
    }
  };

  const deleteStudent = async (studentId, studentName) => {
    if (!window.confirm(`Are you sure you want to delete ${studentName}?`)) {
      return;
    }

    try {
      await deleteDoc(doc(db, "students", studentId));
      toast.success(`Student ${studentName} deleted successfully`);
      fetchStudents();
    } catch (error) {
      toast.error("Failed to delete student");
      console.error(error);
    }
  };

  // ==================== OPTIONAL FEES MANAGEMENT ====================
  const toggleOptionalFee = async (studentId, feeType, semester) => {
    try {
      const student = students.find(s => s.docId === studentId);
      if (!student) return;

      const currentConfig = optionalFeesConfig[studentId] || {};
      const semesterConfig = currentConfig[semester] || {};
      const newValue = !semesterConfig[feeType];
      
      const updatedConfig = {
        ...currentConfig,
        [semester]: {
          ...semesterConfig,
          [feeType]: newValue
        }
      };

      // Update local state
      setOptionalFeesConfig(prev => ({
        ...prev,
        [studentId]: updatedConfig
      }));

      // Update in database
      await updateDoc(doc(db, "students", studentId), {
        optionalFees: updatedConfig,
        updatedAt: serverTimestamp(),
      });

      toast.success(`${FEE_TYPE_LABELS[feeType]} ${newValue ? 'enabled' : 'disabled'} for Semester ${semester}`);
      
      // Refresh student data
      fetchStudents();
    } catch (error) {
      toast.error("Failed to update optional fee");
      console.error(error);
    }
  };

  const isFeeApplicable = (student, feeType, semester) => {
    // Compulsory fees are always applicable
    if (COMPULSORY_FEES.includes(feeType)) return true;
    
    // Check if optional fee is enabled for this student and semester
    const studentConfig = optionalFeesConfig[student.docId] || {};
    const semesterConfig = studentConfig[semester] || {};
    
    return semesterConfig[feeType] === true;
  };

  // ==================== FEE STRUCTURE FUNCTIONS ====================
  const fetchFeeStructures = async () => {
    try {
      const q = query(collection(db, "feeStructures"), orderBy("semester"));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setFeeStructures(data);
    } catch (error) {
      throw error;
    }
  };

  const saveFeeStructure = async () => {
    if (!feeStructureForm.semester || !feeStructureForm.amount || !feeStructureForm.dueDate) {
      toast.error("Please fill all required fields");
      return;
    }

    try {
      if (feeStructureForm.isEditing && feeStructureForm.id) {
        // Update existing fee structure
        await updateDoc(doc(db, "feeStructures", feeStructureForm.id), {
          semester: feeStructureForm.semester,
          feeType: feeStructureForm.feeType,
          amount: Number(feeStructureForm.amount),
          dueDate: new Date(feeStructureForm.dueDate),
          description: feeStructureForm.description || "",
          updatedAt: serverTimestamp(),
        });
        toast.success("Fee structure updated successfully");
      } else {
        // Add new fee structure
        const feeData = {
          semester: feeStructureForm.semester,
          feeType: feeStructureForm.feeType,
          amount: Number(feeStructureForm.amount),
          dueDate: new Date(feeStructureForm.dueDate),
          description: feeStructureForm.description || "",
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        };

        await addDoc(collection(db, "feeStructures"), feeData);
        toast.success("Fee structure added successfully");
      }

      // Reset form
      setFeeStructureForm({
        id: null,
        semester: "",
        feeType: "tuition",
        amount: "",
        dueDate: "",
        description: "",
        isEditing: false,
      });

      fetchFeeStructures();
    } catch (error) {
      toast.error(`Failed to ${feeStructureForm.isEditing ? 'update' : 'add'} fee structure`);
      console.error(error);
    }
  };

  // ==================== FEE PAYMENT FUNCTIONS ====================
  const fetchFeePayments = async () => {
    try {
      const q = query(collection(db, "feePayments"), orderBy("paymentDate", "desc"));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        paymentDate: doc.data().paymentDate?.toDate(),
      }));
      setFeePayments(data);
    } catch (error) {
      throw error;
    }
  };

  const getFeeAmount = (semester, feeType) => {
    const fee = feeStructures.find(
      f => parseInt(f.semester) === parseInt(semester) && f.feeType === feeType
    );
    return fee ? fee.amount : 0;
  };

  const processPayment = async () => {
    if (!paymentForm.studentId || !paymentForm.amount || !paymentForm.semester || !paymentForm.feeType) {
      toast.error("Please fill all required fields");
      return;
    }

    try {
      const student = students.find(s => s.docId === paymentForm.studentId);
      if (!student) {
        toast.error("Student not found");
        return;
      }

      // Check if optional fee is applicable
      if (!COMPULSORY_FEES.includes(paymentForm.feeType)) {
        if (!isFeeApplicable(student, paymentForm.feeType, paymentForm.semester)) {
          toast.error(`${FEE_TYPE_LABELS[paymentForm.feeType]} is not applicable for this student`);
          return;
        }
      }

      const paymentAmount = Number(paymentForm.amount);
      if (paymentAmount <= 0) {
        toast.error("Amount must be greater than 0");
        return;
      }

      const paymentData = {
        studentId: student.docId,
        studentName: student.name,
        studentRollNo: student.rollNo,
        studentCourse: student.course,
        semester: Number(paymentForm.semester),
        feeType: paymentForm.feeType,
        amount: paymentAmount,
        paymentMethod: paymentForm.paymentMethod,
        transactionId: paymentForm.paymentMethod === "online" 
          ? paymentForm.transactionId 
          : `CASH-${Date.now()}`,
        status: "paid",
        remarks: paymentForm.remarks || "",
        paymentDate: new Date(),
        processedBy: "Admin",
        createdAt: serverTimestamp(),
      };

      await addDoc(collection(db, "feePayments"), paymentData);
      
      // Update student's fee status
      const semesterKey = paymentForm.semester;
      const feeTypeKey = paymentForm.feeType;
      const currentFeeStatus = student.feeStatus || {};
      
      if (!currentFeeStatus[semesterKey]) {
        currentFeeStatus[semesterKey] = {};
      }
      
      const existingAmount = currentFeeStatus[semesterKey][feeTypeKey]?.amount || 0;
      const feeTotal = getFeeAmount(semesterKey, feeTypeKey);
      const newAmount = existingAmount + paymentAmount;
      
      currentFeeStatus[semesterKey][feeTypeKey] = {
        amount: newAmount,
        status: newAmount >= feeTotal ? "paid" : "partial",
        lastUpdated: new Date(),
      };

      await updateDoc(doc(db, "students", student.docId), {
        feeStatus: currentFeeStatus,
        updatedAt: serverTimestamp(),
      });

      toast.success(
        <div className="space-y-1">
          <div className="font-semibold">Payment Successful!</div>
          <div className="text-sm">₹{paymentForm.amount} received from {student.name}</div>
          <div className="text-xs text-gray-600">
            {FEE_TYPE_LABELS[paymentForm.feeType]} | Sem: {paymentForm.semester}
          </div>
        </div>
      );

      // Reset form
      setPaymentForm({
        studentId: "",
        semester: "",
        feeType: "tuition",
        amount: "",
        paymentMethod: "cash",
        transactionId: "",
        remarks: "",
      });
      
      fetchFeePayments();
      fetchStudents();
    } catch (error) {
      toast.error("Failed to process payment");
      console.error(error);
    }
  };

  // ==================== HELPER FUNCTIONS ====================
  const getStudentFeeSummary = (student) => {
    if (!student) return { total: 0, paid: 0, pending: 0, semesters: {} };
    
    let totalAll = 0;
    let paidAll = 0;
    const semesters = {};
    
    // Get current semester
    const currentSem = parseInt(student.semester) || 1;
    
    // Calculate for each semester up to current
    for (let sem = 1; sem <= currentSem; sem++) {
      let semesterTotal = 0;
      let semesterPaid = 0;
      
      // Get fee structures for this semester
      const semesterFees = feeStructures.filter(fee => parseInt(fee.semester) === sem);
      
      semesterFees.forEach(fee => {
        // Only include applicable fees
        if (isFeeApplicable(student, fee.feeType, sem.toString())) {
          semesterTotal += fee.amount;
          const status = student.feeStatus?.[sem]?.[fee.feeType];
          semesterPaid += status?.amount || 0;
        }
      });
      
      totalAll += semesterTotal;
      paidAll += semesterPaid;
      
      semesters[sem] = {
        total: semesterTotal,
        paid: semesterPaid,
        pending: semesterTotal - semesterPaid,
        percentage: semesterTotal > 0 ? Math.round((semesterPaid / semesterTotal) * 100) : 0,
      };
    }
    
    return {
      total: totalAll,
      paid: paidAll,
      pending: totalAll - paidAll,
      percentage: totalAll > 0 ? Math.round((paidAll / totalAll) * 100) : 0,
      semesters,
      currentSemester: currentSem,
    };
  };

  // ==================== STATS & CALCULATIONS ====================
  const totalSalaryPaid = teachers.reduce((sum, t) => 
    t.salaryPaid ? sum + (t.salary || 0) : sum, 0
  );
  
  const totalSalaryPending = teachers.reduce((sum, t) => 
    !t.salaryPaid ? sum + (t.salary || 0) : sum, 0
  );

  const totalFeeCollection = feePayments.reduce((sum, p) => sum + (p.amount || 0), 0);
  
  const accountHandlers = teachers.filter(t => t.accountHandler).length;

  // ==================== FILTERED DATA ====================
  const filteredTeachers = teachers.filter(teacher => {
    if (teacherSearch && !teacher.name.toLowerCase().includes(teacherSearch.toLowerCase()) && 
        !teacher.id.toLowerCase().includes(teacherSearch.toLowerCase())) {
      return false;
    }
    return true;
  });

  const filteredStudents = students.filter(student => {
    if (searchTerm && !student.name.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !student.rollNo.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    if (selectedDepartment !== "all" && student.course !== selectedDepartment) {
      return false;
    }
    if (selectedSemesterFilter !== "all" && student.semester !== selectedSemesterFilter) {
      return false;
    }
    return true;
  });

  // Get unique departments from students and teachers
  const studentDepartments = [...new Set(students.map(s => s.course).filter(Boolean))];
  const teacherDepartments = [...new Set(teachers.map(t => t.department).filter(Boolean))];
  const departments = [...new Set([...studentDepartments, ...teacherDepartments])];
  const semesters = [...new Set(students.map(s => s.semester).filter(Boolean))];

  // ==================== PAYMENT FORM HANDLERS ====================
  const handleStudentChange = (e) => {
    const studentId = e.target.value;
    const student = students.find(s => s.docId === studentId);
    setSelectedStudent(student);
    setPaymentForm({
      ...paymentForm,
      studentId: studentId,
      semester: student?.semester || "",
    });
  };

  const handleSemesterChange = (e) => {
    const semester = e.target.value;
    const student = students.find(s => s.docId === paymentForm.studentId);
    
    // Filter fee types to only show applicable ones
    let feeType = paymentForm.feeType;
    if (student && !isFeeApplicable(student, feeType, semester)) {
      feeType = "tuition"; // Default to tuition if current fee type not applicable
    }
    
    setPaymentForm({
      ...paymentForm,
      semester: semester,
      feeType: feeType,
      amount: getFeeAmount(semester, feeType).toString(),
    });
  };

  const handleFeeTypeChange = (e) => {
    const feeType = e.target.value;
    setPaymentForm({
      ...paymentForm,
      feeType: feeType,
      amount: getFeeAmount(paymentForm.semester, feeType).toString(),
    });
  };

  // Get applicable fees for a student in a semester
  const getApplicableFees = (student, semester) => {
    return feeStructures.filter(fee => 
      parseInt(fee.semester) === parseInt(semester) && 
      isFeeApplicable(student, fee.feeType, semester.toString())
    );
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4 md:p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* ================= HEADER ================= */}
          <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-200">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                  <FaUniversity className="text-blue-600" />
                  Account Management System
                </h1>
                <p className="text-gray-600 mt-2">
                  Manage teacher salaries, student fees, and account handling permissions
                </p>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-sm text-gray-500">Total Collection</p>
                  <p className="text-2xl font-bold text-green-600">
                    ₹{totalFeeCollection.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* ================= STATS CARDS ================= */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl shadow-lg p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">Salary Paid</p>
                  <p className="text-2xl font-bold">₹{totalSalaryPaid.toLocaleString()}</p>
                </div>
                <FaCheckCircle className="text-2xl opacity-80" />
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl shadow-lg p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">Salary Pending</p>
                  <p className="text-2xl font-bold">₹{totalSalaryPending.toLocaleString()}</p>
                </div>
                <FaClock className="text-2xl opacity-80" />
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl shadow-lg p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">Account Handlers</p>
                  <p className="text-2xl font-bold">{accountHandlers}</p>
                </div>
                <FaUserTie className="text-2xl opacity-80" />
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl shadow-lg p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">Total Students</p>
                  <p className="text-2xl font-bold">{students.length}</p>
                </div>
                <FaUserGraduate className="text-2xl opacity-80" />
              </div>
            </div>
          </div>

          {/* ================= TABS NAVIGATION ================= */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="flex border-b border-gray-200 overflow-x-auto">
              <button
                className={`py-4 px-6 text-center font-medium transition-all whitespace-nowrap ${
                  activeTab === "teachers"
                    ? "bg-blue-50 text-blue-700 border-b-2 border-blue-600"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
                onClick={() => setActiveTab("teachers")}
              >
                <FaUserTie className="inline mr-2" />
                Teacher Management
              </button>
              
              <button
                className={`py-4 px-6 text-center font-medium transition-all whitespace-nowrap ${
                  activeTab === "students"
                    ? "bg-blue-50 text-blue-700 border-b-2 border-blue-600"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
                onClick={() => setActiveTab("students")}
              >
                <FaUserGraduate className="inline mr-2" />
                Student Management
              </button>
              
              <button
                className={`py-4 px-6 text-center font-medium transition-all whitespace-nowrap ${
                  activeTab === "fees"
                    ? "bg-blue-50 text-blue-700 border-b-2 border-blue-600"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
                onClick={() => setActiveTab("fees")}
              >
                <FaMoneyBillWave className="inline mr-2" />
                Fee Management
              </button>
              
              <button
                className={`py-4 px-6 text-center font-medium transition-all whitespace-nowrap ${
                  activeTab === "structure"
                    ? "bg-blue-50 text-blue-700 border-b-2 border-blue-600"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
                onClick={() => setActiveTab("structure")}
              >
                <FaFileInvoice className="inline mr-2" />
                Fee Structure
              </button>
              
              <button
                className={`py-4 px-6 text-center font-medium transition-all whitespace-nowrap ${
                  activeTab === "reports"
                    ? "bg-blue-50 text-blue-700 border-b-2 border-blue-600"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
                onClick={() => setActiveTab("reports")}
              >
                <FaChartLine className="inline mr-2" />
                Reports
              </button>
            </div>

            {/* ================= TEACHER MANAGEMENT TAB ================= */}
            {activeTab === "teachers" && (
              <div className="p-6 space-y-6">
                {/* Add/Edit Teacher Form */}
                <div className="bg-gray-50 rounded-xl p-5 border border-gray-300">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <FaPlus />
                    {teacherForm.isEditing ? "Edit Teacher" : "Add New Teacher"}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <input
                      type="text"
                      placeholder="Full Name *"
                      className="border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={teacherForm.name}
                      onChange={(e) => setTeacherForm({...teacherForm, name: e.target.value})}
                    />
                    <input
                      type="text"
                      placeholder="Teacher ID *"
                      className="border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={teacherForm.id}
                      onChange={(e) => setTeacherForm({...teacherForm, id: e.target.value})}
                    />
                    <input
                      type="text"
                      placeholder="Department *"
                      className="border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={teacherForm.department}
                      onChange={(e) => setTeacherForm({...teacherForm, department: e.target.value})}
                    />
                    <input
                      type="number"
                      placeholder="Monthly Salary (₹)"
                      className="border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={teacherForm.salary}
                      onChange={(e) => setTeacherForm({...teacherForm, salary: e.target.value})}
                    />
                  </div>
                  <div className="flex items-center gap-3 mt-4">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="w-4 h-4 mr-2"
                        checked={teacherForm.accountHandler}
                        onChange={(e) => setTeacherForm({...teacherForm, accountHandler: e.target.checked})}
                      />
                      <span className="text-gray-700">Account Handler</span>
                    </label>
                    <div className="ml-auto flex gap-2">
                      {teacherForm.isEditing && (
                        <button
                          onClick={() => setTeacherForm({
                            docId: null,
                            name: "",
                            id: "",
                            department: "",
                            salary: "",
                            accountHandler: false,
                            isEditing: false,
                          })}
                          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                        >
                          Cancel
                        </button>
                      )}
                      <button
                        onClick={saveTeacher}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2"
                      >
                        <FaPlus />
                        {teacherForm.isEditing ? "Update Teacher" : "Add Teacher"}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Teachers List */}
                <div className="bg-white rounded-xl border border-gray-300 overflow-hidden">
                  <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-gray-800">
                      Teachers List ({teachers.length})
                    </h3>
                    <div className="flex gap-3">
                      <div className="relative">
                        <FaSearch className="absolute left-3 top-3 text-gray-400" />
                        <input
                          placeholder="Search teachers..."
                          className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-64 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          value={teacherSearch}
                          onChange={(e) => setTeacherSearch(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="p-4 text-left text-sm font-medium text-gray-700">Teacher</th>
                          <th className="p-4 text-left text-sm font-medium text-gray-700">Department</th>
                          <th className="p-4 text-left text-sm font-medium text-gray-700">Salary</th>
                          <th className="p-4 text-left text-sm font-medium text-gray-700">Salary Status</th>
                          <th className="p-4 text-left text-sm font-medium text-gray-700">Account Handler</th>
                          <th className="p-4 text-left text-sm font-medium text-gray-700">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {filteredTeachers.map((teacher) => (
                          <tr key={teacher.docId} className="hover:bg-gray-50 transition-colors">
                            <td className="p-4">
                              <div>
                                <p className="font-medium text-gray-900">{teacher.name}</p>
                                <p className="text-sm text-gray-500">ID: {teacher.id}</p>
                              </div>
                            </td>
                            <td className="p-4">
                              <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                                {teacher.department}
                              </span>
                            </td>
                            <td className="p-4">
                              <p className="font-semibold">₹{(teacher.salary || 0).toLocaleString()}</p>
                            </td>
                            <td className="p-4">
                              <div className="flex items-center gap-2">
                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                                  teacher.salaryPaid
                                    ? "bg-green-100 text-green-800"
                                    : "bg-red-100 text-red-800"
                                }`}>
                                  {teacher.salaryPaid ? (
                                    <>
                                      <FaCheckCircle className="mr-1" />
                                      Paid
                                    </>
                                  ) : (
                                    <>
                                      <FaClock className="mr-1" />
                                      Pending
                                    </>
                                  )}
                                </span>
                                {!teacher.salaryPaid && (
                                  <button
                                    onClick={() => markSalaryPaid(teacher.docId, teacher.name)}
                                    className="text-green-600 hover:text-green-800 text-sm font-medium"
                                  >
                                    Mark Paid
                                  </button>
                                )}
                              </div>
                            </td>
                            <td className="p-4">
                              <label className="flex items-center cursor-pointer">
                                <div className="relative">
                                  <input
                                    type="checkbox"
                                    className="sr-only"
                                    checked={teacher.accountHandler || false}
                                    onChange={(e) => toggleAccountHandler(teacher.docId, e.target.checked)}
                                  />
                                  <div className={`block w-12 h-6 rounded-full transition-colors ${
                                    teacher.accountHandler ? "bg-blue-500" : "bg-gray-300"
                                  }`}></div>
                                  <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${
                                    teacher.accountHandler ? "transform translate-x-6" : ""
                                  }`}></div>
                                </div>
                                <span className="ml-3 text-sm text-gray-700">
                                  {teacher.accountHandler ? "Yes" : "No"}
                                </span>
                              </label>
                            </td>
                            <td className="p-4">
                              <div className="flex gap-2">
                                <button
                                  onClick={() =>
                                    setTeacherForm({
                                      docId: teacher.docId,
                                      name: teacher.name,
                                      id: teacher.id,
                                      department: teacher.department,
                                      salary: teacher.salary || "",
                                      accountHandler: teacher.accountHandler || false,
                                      isEditing: true,
                                    })
                                  }
                                  className="text-blue-600 hover:text-blue-800 p-2"
                                >
                                  <FaEdit />
                                </button>
                                <button
                                  onClick={() => deleteTeacher(teacher.docId, teacher.name)}
                                  className="text-red-600 hover:text-red-800 p-2"
                                >
                                  <FaTrash />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ================= STUDENT MANAGEMENT TAB ================= */}
            {activeTab === "students" && (
              <div className="p-6 space-y-6">
                {/* Add/Edit Student Form */}
                <div className="bg-gray-50 rounded-xl p-5 border border-gray-300">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <FaPlus />
                    {studentForm.isEditing ? "Edit Student" : "Add New Student"}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <input
                      type="text"
                      placeholder="Full Name *"
                      className="border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={studentForm.name}
                      onChange={(e) => setStudentForm({...studentForm, name: e.target.value})}
                    />
                    <input
                      type="text"
                      placeholder="Roll Number *"
                      className="border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={studentForm.rollNo}
                      onChange={(e) => setStudentForm({...studentForm, rollNo: e.target.value})}
                    />
                    <input
                      type="text"
                      placeholder="Course/Department *"
                      className="border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={studentForm.course}
                      onChange={(e) => setStudentForm({...studentForm, course: e.target.value})}
                    />
                    <select
                      className="border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={studentForm.semester}
                      onChange={(e) => setStudentForm({...studentForm, semester: e.target.value})}
                    >
                      <option value="">Select Semester</option>
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                        <option key={sem} value={sem}>Semester {sem}</option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <input
                      type="email"
                      placeholder="Email (optional)"
                      className="border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={studentForm.email}
                      onChange={(e) => setStudentForm({...studentForm, email: e.target.value})}
                    />
                    <input
                      type="text"
                      placeholder="Phone (optional)"
                      className="border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={studentForm.phone}
                      onChange={(e) => setStudentForm({...studentForm, phone: e.target.value})}
                    />
                  </div>
                  <div className="flex items-center gap-3 mt-4">
                    <div className="text-sm text-gray-600">
                      Default password: <span className="font-mono">123456</span>
                    </div>
                    <div className="ml-auto flex gap-2">
                      {studentForm.isEditing && (
                        <button
                          onClick={() => setStudentForm({
                            docId: null,
                            name: "",
                            rollNo: "",
                            course: "",
                            semester: "",
                            email: "",
                            phone: "",
                            password: "123456",
                            isEditing: false,
                          })}
                          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                        >
                          Cancel
                        </button>
                      )}
                      <button
                        onClick={saveStudent}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2"
                      >
                        <FaPlus />
                        {studentForm.isEditing ? "Update Student" : "Add Student"}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Search and Filters */}
                <div className="bg-white rounded-xl border border-gray-300 p-4">
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                      <div className="relative">
                        <FaSearch className="absolute left-3 top-3 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Search by name or roll number..."
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <select
                        className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
                        value={selectedDepartment}
                        onChange={(e) => setSelectedDepartment(e.target.value)}
                      >
                        <option value="all">All Departments</option>
                        {departments.map((dept) => (
                          <option key={dept} value={dept}>{dept}</option>
                        ))}
                      </select>
                      <select
                        className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
                        value={selectedSemesterFilter}
                        onChange={(e) => setSelectedSemesterFilter(e.target.value)}
                      >
                        <option value="all">All Semesters</option>
                        {semesters.sort().map((sem) => (
                          <option key={sem} value={sem}>Sem {sem}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Students List */}
                <div className="bg-white rounded-xl border border-gray-300 overflow-hidden">
                  <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-gray-800">
                      Students List ({filteredStudents.length})
                    </h3>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="p-4 text-left text-sm font-medium text-gray-700">Student Details</th>
                          <th className="p-4 text-left text-sm font-medium text-gray-700">Course & Semester</th>
                          <th className="p-4 text-left text-sm font-medium text-gray-700">Fee Status</th>
                          <th className="p-4 text-left text-sm font-medium text-gray-700">Optional Fees</th>
                          <th className="p-4 text-left text-sm font-medium text-gray-700">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {filteredStudents.map((student) => {
                          const summary = getStudentFeeSummary(student);
                          const studentConfig = optionalFeesConfig[student.docId] || {};
                          
                          // Count enabled optional fees for current semester
                          const currentSemConfig = studentConfig[student.semester] || {};
                          const enabledOptionalFees = Object.values(currentSemConfig).filter(v => v).length;
                          
                          return (
                            <tr key={student.docId} className="hover:bg-gray-50">
                              <td className="p-4">
                                <div>
                                  <p className="font-medium text-gray-900">{student.name}</p>
                                  <p className="text-sm text-gray-500">Roll: {student.rollNo}</p>
                                  {student.email && (
                                    <p className="text-sm text-gray-500">{student.email}</p>
                                  )}
                                </div>
                              </td>
                              <td className="p-4">
                                <div className="space-y-2">
                                  <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                                    {student.course}
                                  </span>
                                  <p className="text-sm">
                                    Current: Semester {student.semester}
                                  </p>
                                </div>
                              </td>
                              <td className="p-4">
                                <div className="space-y-2">
                                  <div className="flex items-center gap-2">
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                      summary.percentage === 100
                                        ? "bg-green-100 text-green-800"
                                        : summary.percentage > 50
                                        ? "bg-yellow-100 text-yellow-800"
                                        : "bg-red-100 text-red-800"
                                    }`}>
                                      {summary.percentage}% Paid
                                    </span>
                                    <span className="text-sm">
                                      ₹{summary.paid.toLocaleString()}/₹{summary.total.toLocaleString()}
                                    </span>
                                  </div>
                                  <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                      className="bg-green-600 h-2 rounded-full transition-all duration-500"
                                      style={{ width: `${summary.percentage}%` }}
                                    ></div>
                                  </div>
                                </div>
                              </td>
                              <td className="p-4">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm text-gray-600">
                                    {enabledOptionalFees} enabled
                                  </span>
                                  <button
                                    onClick={() => {
                                      setSelectedStudent(student);
                                      setActiveTab("fees");
                                    }}
                                    className="text-blue-600 hover:text-blue-800 text-sm"
                                    title="Manage optional fees"
                                  >
                                    Manage
                                  </button>
                                </div>
                              </td>
                              <td className="p-4">
                                <div className="flex gap-2">
                                  <button
                                    onClick={() =>
                                      setStudentForm({
                                        docId: student.docId,
                                        name: student.name,
                                        rollNo: student.rollNo,
                                        course: student.course,
                                        semester: student.semester,
                                        email: student.email || "",
                                        phone: student.phone || "",
                                        password: "123456",
                                        isEditing: true,
                                      })
                                    }
                                    className="text-blue-600 hover:text-blue-800 p-2"
                                    title="Edit student"
                                  >
                                    <FaEdit />
                                  </button>
                                  <button
                                    onClick={() => {
                                      setSelectedStudent(student);
                                      setActiveTab("fees");
                                    }}
                                    className="text-green-600 hover:text-green-800 p-2"
                                    title="Manage fees"
                                  >
                                    <FaMoneyBillWave />
                                  </button>
                                  <button
                                    onClick={() => deleteStudent(student.docId, student.name)}
                                    className="text-red-600 hover:text-red-800 p-2"
                                    title="Delete student"
                                  >
                                    <FaTrash />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ================= FEE MANAGEMENT TAB ================= */}
            {activeTab === "fees" && (
              <div className="p-6 space-y-6">
                {/* Process Payment Form */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-200">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                      <FaCashRegister />
                      Process Fee Payment
                    </h3>
                    {selectedStudent && (
                      <button
                        onClick={() => {
                          setSelectedStudent(null);
                          setPaymentForm({
                            studentId: "",
                            semester: "",
                            feeType: "tuition",
                            amount: "",
                            paymentMethod: "cash",
                            transactionId: "",
                            remarks: "",
                          });
                        }}
                        className="text-sm text-gray-600 hover:text-gray-800 flex items-center gap-2"
                      >
                        <FaTimes />
                        Clear Selection
                      </button>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="relative">
                      <select
                        className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500"
                        value={paymentForm.studentId}
                        onChange={handleStudentChange}
                      >
                        <option value="">Select Student</option>
                        {students.map((student) => (
                          <option key={student.docId} value={student.docId}>
                            {student.name} ({student.rollNo}) - Sem {student.semester}
                          </option>
                        ))}
                      </select>
                    </div>

                    <select
                      className="border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500"
                      value={paymentForm.semester}
                      onChange={handleSemesterChange}
                      disabled={!paymentForm.studentId}
                    >
                      <option value="">Select Semester</option>
                      {selectedStudent && [...Array(parseInt(selectedStudent.semester) || 8)].map((_, i) => (
                        <option key={i + 1} value={i + 1}>
                          Semester {i + 1}
                        </option>
                      ))}
                    </select>

                    <select
                      className="border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500"
                      value={paymentForm.feeType}
                      onChange={handleFeeTypeChange}
                      disabled={!paymentForm.semester || !selectedStudent}
                    >
                      <option value="">Select Fee Type</option>
                      {/* Compulsory fees always shown */}
                      <option value="tuition">Tuition Fee</option>
                      <option value="exam">Exam Fee</option>
                      
                      {/* Optional fees only if applicable */}
                      {OPTIONAL_FEES.map(feeType => {
                        if (selectedStudent && isFeeApplicable(selectedStudent, feeType, paymentForm.semester)) {
                          return (
                            <option key={feeType} value={feeType}>
                              {FEE_TYPE_LABELS[feeType]}
                            </option>
                          );
                        }
                        return null;
                      }).filter(Boolean)}
                    </select>

                    <input
                      type="number"
                      placeholder="Amount (₹)"
                      className="border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500"
                      value={paymentForm.amount}
                      onChange={(e) => setPaymentForm({...paymentForm, amount: e.target.value})}
                      disabled={!paymentForm.feeType}
                    />

                    <select
                      className="border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500"
                      value={paymentForm.paymentMethod}
                      onChange={(e) => setPaymentForm({...paymentForm, paymentMethod: e.target.value})}
                    >
                      <option value="cash">Cash</option>
                      <option value="online">Online Payment</option>
                      <option value="cheque">Cheque</option>
                      <option value="bank_transfer">Bank Transfer</option>
                    </select>

                    {paymentForm.paymentMethod === "online" && (
                      <input
                        type="text"
                        placeholder="Transaction ID"
                        className="border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500"
                        value={paymentForm.transactionId}
                        onChange={(e) => setPaymentForm({...paymentForm, transactionId: e.target.value})}
                      />
                    )}
                  </div>
                  
                  <textarea
                    placeholder="Remarks (optional)"
                    className="w-full mt-4 border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500"
                    rows="2"
                    value={paymentForm.remarks}
                    onChange={(e) => setPaymentForm({...paymentForm, remarks: e.target.value})}
                  />

                  <div className="flex items-center gap-3 mt-4">
                    {paymentForm.semester && paymentForm.feeType && (
                      <div className="text-sm text-gray-600">
                        Fee amount: ₹{getFeeAmount(paymentForm.semester, paymentForm.feeType).toLocaleString()}
                      </div>
                    )}
                    <div className="ml-auto flex gap-2">
                      <button
                        onClick={() => setPaymentForm({
                          studentId: "",
                          semester: "",
                          feeType: "tuition",
                          amount: "",
                          paymentMethod: "cash",
                          transactionId: "",
                          remarks: "",
                        })}
                        className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50"
                      >
                        Clear
                      </button>
                      <button
                        onClick={processPayment}
                        disabled={!paymentForm.studentId || !paymentForm.amount || !paymentForm.feeType}
                        className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <FaCheck />
                        Process Payment
                      </button>
                    </div>
                  </div>
                </div>

                {/* Student Fee Details */}
                {selectedStudent && (
                  <div className="bg-white rounded-xl border border-gray-300 p-5">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                          <FaUserGraduate className="text-blue-600 text-2xl" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-900">{selectedStudent.name}</h3>
                          <div className="flex flex-wrap gap-2 mt-1">
                            <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                              Roll: {selectedStudent.rollNo}
                            </span>
                            <span className="px-3 py-1 bg-indigo-100 text-indigo-800 text-sm rounded-full">
                              {selectedStudent.course}
                            </span>
                            <span className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">
                              Semester {selectedStudent.semester}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Overall Summary */}
                    <div className="mb-6">
                      <h4 className="text-lg font-semibold text-gray-800 mb-4">Overall Fee Summary</h4>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="bg-gray-50 p-4 rounded-xl">
                          <p className="text-sm text-gray-600">Total Fee (All Semesters)</p>
                          <p className="text-2xl font-bold">₹{getStudentFeeSummary(selectedStudent).total.toLocaleString()}</p>
                        </div>
                        <div className="bg-green-50 p-4 rounded-xl">
                          <p className="text-sm text-green-600">Paid Amount</p>
                          <p className="text-2xl font-bold text-green-600">
                            ₹{getStudentFeeSummary(selectedStudent).paid.toLocaleString()}
                          </p>
                        </div>
                        <div className="bg-red-50 p-4 rounded-xl">
                          <p className="text-sm text-red-600">Pending Amount</p>
                          <p className="text-2xl font-bold text-red-600">
                            ₹{getStudentFeeSummary(selectedStudent).pending.toLocaleString()}
                          </p>
                        </div>
                        <div className="bg-blue-50 p-4 rounded-xl">
                          <p className="text-sm text-blue-600">Completion</p>
                          <p className="text-2xl font-bold text-blue-600">
                            {getStudentFeeSummary(selectedStudent).percentage}%
                          </p>
                        </div>
                      </div>
                      
                      {/* Progress Bar */}
                      <div className="mt-4">
                        <div className="flex justify-between mb-2">
                          <span className="text-sm font-medium text-gray-700">Payment Progress</span>
                          <span className="text-sm font-bold">{getStudentFeeSummary(selectedStudent).percentage}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div
                            className="bg-gradient-to-r from-green-500 to-green-600 h-3 rounded-full transition-all duration-1000"
                            style={{ width: `${getStudentFeeSummary(selectedStudent).percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>

                    {/* Optional Fees Configuration */}
                    <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-xl p-5">
                      <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <FaInfoCircle className="text-yellow-600" />
                        Optional Fees Configuration
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {[1, 2, 3, 4, 5, 6, 7, 8].slice(0, selectedStudent.semester).map((sem) => (
                          <div key={sem} className="border border-gray-200 rounded-lg p-4">
                            <h5 className="font-bold text-gray-800 mb-3 flex items-center justify-between">
                              <span>Semester {sem}</span>
                              <span className="text-sm font-normal text-gray-600">
                                {sem === parseInt(selectedStudent.semester) ? "(Current)" : ""}
                              </span>
                            </h5>
                            <div className="space-y-3">
                              {OPTIONAL_FEES.map((feeType) => {
                                const Icon = FEE_TYPE_ICONS[feeType];
                                const isApplicable = isFeeApplicable(selectedStudent, feeType, sem.toString());
                                
                                return (
                                  <div key={feeType} className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      <Icon className="text-gray-500" />
                                      <span className="text-sm">{FEE_TYPE_LABELS[feeType]}</span>
                                    </div>
                                    <label className="flex items-center cursor-pointer">
                                      <div className="relative">
                                        <input
                                          type="checkbox"
                                          className="sr-only"
                                          checked={isApplicable}
                                          onChange={() => toggleOptionalFee(selectedStudent.docId, feeType, sem.toString())}
                                        />
                                        <div className={`block w-12 h-6 rounded-full transition-colors ${
                                          isApplicable ? "bg-green-500" : "bg-gray-300"
                                        }`}></div>
                                        <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${
                                          isApplicable ? "transform translate-x-6" : ""
                                        }`}></div>
                                      </div>
                                      <span className="ml-2 text-sm">
                                        {isApplicable ? 'Applicable' : 'Not Applicable'}
                                      </span>
                                    </label>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Semester-wise Breakdown */}
                    <div>
                      <h4 className="text-lg font-semibold text-gray-800 mb-4">Semester-wise Fee Breakdown</h4>
                      <div className="space-y-4">
                        {Object.entries(getStudentFeeSummary(selectedStudent).semesters).map(([semester, data]) => {
                          const applicableFees = getApplicableFees(selectedStudent, semester);
                          
                          return (
                            <div key={semester} className="border border-gray-200 rounded-xl p-4">
                              <div className="flex justify-between items-center mb-3">
                                <h5 className="font-bold text-gray-800 flex items-center gap-2">
                                  <FaCalendarAlt className="text-blue-500" />
                                  Semester {semester}
                                  {parseInt(semester) === parseInt(selectedStudent.semester) && (
                                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                      Current
                                    </span>
                                  )}
                                </h5>
                                <div className="text-right">
                                  <p className="text-sm text-gray-600">Status</p>
                                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                    data.percentage === 100
                                      ? "bg-green-100 text-green-800"
                                      : data.percentage > 50
                                      ? "bg-yellow-100 text-yellow-800"
                                      : "bg-red-100 text-red-800"
                                  }`}>
                                    {data.percentage}% Complete
                                  </span>
                                </div>
                              </div>
                              
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                                <div className="text-center">
                                  <p className="text-sm text-gray-600">Total Fee</p>
                                  <p className="text-lg font-bold">₹{data.total.toLocaleString()}</p>
                                </div>
                                <div className="text-center">
                                  <p className="text-sm text-green-600">Paid</p>
                                  <p className="text-lg font-bold text-green-600">₹{data.paid.toLocaleString()}</p>
                                </div>
                                <div className="text-center">
                                  <p className="text-sm text-red-600">Pending</p>
                                  <p className="text-lg font-bold text-red-600">₹{data.pending.toLocaleString()}</p>
                                </div>
                              </div>
                              
                              {/* Fee Types Breakdown */}
                              <div className="mt-4">
                                <p className="text-sm font-medium text-gray-700 mb-2">Applicable Fees:</p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                  {applicableFees.map((fee) => {
                                    const Icon = FEE_TYPE_ICONS[fee.feeType] || FaMoneyBillWave;
                                    const status = selectedStudent.feeStatus?.[semester]?.[fee.feeType];
                                    const paidAmount = status?.amount || 0;
                                    const balance = fee.amount - paidAmount;
                                    const isPaid = balance <= 0;
                                    const isPartial = paidAmount > 0 && balance > 0;
                                    const isCompulsory = COMPULSORY_FEES.includes(fee.feeType);
                                    
                                    return (
                                      <div
                                        key={fee.id}
                                        className={`p-3 rounded-lg border ${
                                          isPaid
                                            ? "border-green-200 bg-green-50"
                                            : isPartial
                                            ? "border-yellow-200 bg-yellow-50"
                                            : "border-red-200 bg-red-50"
                                        }`}
                                      >
                                        <div className="flex justify-between items-start">
                                          <div className="flex items-start gap-2">
                                            <Icon className={`mt-1 ${isCompulsory ? 'text-blue-500' : 'text-purple-500'}`} />
                                            <div>
                                              <p className="font-medium capitalize">{FEE_TYPE_LABELS[fee.feeType]}</p>
                                              <div className="flex items-center gap-2 mt-1">
                                                <FaCalendarAlt className="text-gray-400 text-xs" />
                                                <span className="text-xs text-gray-500">
                                                  Due: {new Date(fee.dueDate).toLocaleDateString()}
                                                </span>
                                                {!isCompulsory && (
                                                  <span className="text-xs text-purple-600 bg-purple-100 px-2 py-0.5 rounded">
                                                    Optional
                                                  </span>
                                                )}
                                              </div>
                                            </div>
                                          </div>
                                          <div className="text-right">
                                            <p className="font-bold">₹{fee.amount.toLocaleString()}</p>
                                            <div className="flex flex-col items-end gap-1">
                                              <span className={`text-xs px-2 py-1 rounded ${
                                                isPaid
                                                  ? "bg-green-100 text-green-800"
                                                  : isPartial
                                                  ? "bg-yellow-100 text-yellow-800"
                                                  : "bg-red-100 text-red-800"
                                              }`}>
                                                {isPaid ? 'Paid' : isPartial ? `Partial (₹${paidAmount})` : 'Pending'}
                                              </span>
                                              {!isPaid && (
                                                <span className="text-xs text-gray-600">
                                                  Balance: ₹{balance.toLocaleString()}
                                                </span>
                                              )}
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {/* Recent Payments */}
                <div className="bg-white rounded-xl border border-gray-300 overflow-hidden">
                  <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-gray-800">
                      Recent Payments
                    </h3>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => {
                          const csvContent = "data:text/csv;charset=utf-8," +
                            "Date,Student,Student ID,Semester,Fee Type,Amount,Method,Transaction ID,Processed By\n" +
                            feePayments.map(p =>
                              `"${new Date(p.paymentDate).toLocaleDateString()}","${p.studentName}","${p.studentRollNo}","${p.semester}","${FEE_TYPE_LABELS[p.feeType] || p.feeType}","${p.amount}","${p.paymentMethod}","${p.transactionId || ''}","${p.processedBy}"`
                            ).join("\n");

                          const encodedUri = encodeURI(csvContent);
                          const link = document.createElement("a");
                          link.setAttribute("href", encodedUri);
                          link.setAttribute("download", `payments-${new Date().toISOString().split('T')[0]}.csv`);
                          document.body.appendChild(link);
                          link.click();
                          document.body.removeChild(link);
                        }}
                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-50 flex items-center gap-2"
                      >
                        <FaDownload />
                        Export CSV
                      </button>
                    </div>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="p-3 text-left text-sm font-medium text-gray-700">Date</th>
                          <th className="p-3 text-left text-sm font-medium text-gray-700">Student</th>
                          <th className="p-3 text-left text-sm font-medium text-gray-700">Semester</th>
                          <th className="p-3 text-left text-sm font-medium text-gray-700">Fee Type</th>
                          <th className="p-3 text-left text-sm font-medium text-gray-700">Amount</th>
                          <th className="p-3 text-left text-sm font-medium text-gray-700">Method</th>
                          <th className="p-3 text-left text-sm font-medium text-gray-700">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {feePayments.slice(0, 10).map((payment) => {
                          const Icon = FEE_TYPE_ICONS[payment.feeType] || FaMoneyBillWave;
                          return (
                            <tr key={payment.id} className="hover:bg-gray-50">
                              <td className="p-3">
                                {payment.paymentDate?.toLocaleDateString()}
                              </td>
                              <td className="p-3">
                                <div>
                                  <p className="font-medium">{payment.studentName}</p>
                                  <p className="text-sm text-gray-500">{payment.studentRollNo}</p>
                                </div>
                              </td>
                              <td className="p-3">
                                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                                  Sem {payment.semester}
                                </span>
                              </td>
                              <td className="p-3">
                                <div className="flex items-center gap-2">
                                  <Icon className="text-gray-500 text-sm" />
                                  <span className="capitalize">{FEE_TYPE_LABELS[payment.feeType] || payment.feeType}</span>
                                </div>
                              </td>
                              <td className="p-3 font-bold">
                                ₹{(payment.amount || 0).toLocaleString()}
                              </td>
                              <td className="p-3">
                                <span className={`px-2 py-1 text-xs rounded ${
                                  payment.paymentMethod === 'online'
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-yellow-100 text-yellow-800'
                                }`}>
                                  {payment.paymentMethod}
                                </span>
                              </td>
                              <td className="p-3">
                                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                                  {payment.status}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ================= FEE STRUCTURE TAB ================= */}
            {activeTab === "structure" && (
              <div className="p-6 space-y-6">
                {/* Add/Edit Fee Structure Form */}
                <div className="bg-white rounded-xl border border-gray-300 p-5">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <FaFileInvoice />
                    {feeStructureForm.isEditing ? "Edit Fee Structure" : "Add Fee Structure"}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <select
                      className="border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={feeStructureForm.semester}
                      onChange={(e) => setFeeStructureForm({...feeStructureForm, semester: e.target.value})}
                    >
                      <option value="">Select Semester</option>
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                        <option key={sem} value={sem}>Semester {sem}</option>
                      ))}
                    </select>

                    <select
                      className="border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={feeStructureForm.feeType}
                      onChange={(e) => setFeeStructureForm({...feeStructureForm, feeType: e.target.value})}
                    >
                      {Object.entries(FEE_TYPE_LABELS).map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                    </select>

                    <input
                      type="number"
                      placeholder="Amount (₹)"
                      className="border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={feeStructureForm.amount}
                      onChange={(e) => setFeeStructureForm({...feeStructureForm, amount: e.target.value})}
                    />

                    <input
                      type="date"
                      className="border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={feeStructureForm.dueDate}
                      onChange={(e) => setFeeStructureForm({...feeStructureForm, dueDate: e.target.value})}
                    />
                  </div>

                  <input
                    type="text"
                    placeholder="Description (optional)"
                    className="w-full mt-4 border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={feeStructureForm.description}
                    onChange={(e) => setFeeStructureForm({...feeStructureForm, description: e.target.value})}
                  />

                  <div className="flex justify-end gap-3 mt-4">
                    {feeStructureForm.isEditing && (
                      <button
                        onClick={() => setFeeStructureForm({
                          id: null,
                          semester: "",
                          feeType: "tuition",
                          amount: "",
                          dueDate: "",
                          description: "",
                          isEditing: false,
                        })}
                        className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                    )}
                    <button
                      onClick={saveFeeStructure}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2"
                    >
                      <FaPlus />
                      {feeStructureForm.isEditing ? "Update Fee Structure" : "Add Fee Structure"}
                    </button>
                  </div>
                </div>

                {/* Fee Structures List */}
                <div className="bg-white rounded-xl border border-gray-300 overflow-hidden">
                  <div className="p-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-800">
                      Fee Structures ({feeStructures.length})
                    </h3>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="p-3 text-left text-sm font-medium text-gray-700">Semester</th>
                          <th className="p-3 text-left text-sm font-medium text-gray-700">Fee Type</th>
                          <th className="p-3 text-left text-sm font-medium text-gray-700">Amount</th>
                          <th className="p-3 text-left text-sm font-medium text-gray-700">Due Date</th>
                          <th className="p-3 text-left text-sm font-medium text-gray-700">Description</th>
                          <th className="p-3 text-left text-sm font-medium text-gray-700">Category</th>
                          <th className="p-3 text-left text-sm font-medium text-gray-700">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {feeStructures.map((fee) => {
                          const Icon = FEE_TYPE_ICONS[fee.feeType] || FaMoneyBillWave;
                          const isCompulsory = COMPULSORY_FEES.includes(fee.feeType);
                          
                          return (
                            <tr key={fee.id} className="hover:bg-gray-50">
                              <td className="p-3">
                                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                                  Semester {fee.semester}
                                </span>
                              </td>
                              <td className="p-3">
                                <div className="flex items-center gap-2">
                                  <Icon className={isCompulsory ? "text-blue-500" : "text-purple-500"} />
                                  <span className="font-medium">{FEE_TYPE_LABELS[fee.feeType] || fee.feeType}</span>
                                </div>
                              </td>
                              <td className="p-3 font-bold">
                                ₹{(fee.amount || 0).toLocaleString()}
                              </td>
                              <td className="p-3">
                                <div className="flex items-center gap-2">
                                  <FaCalendarAlt className="text-gray-400" />
                                  <span>{new Date(fee.dueDate).toLocaleDateString()}</span>
                                </div>
                              </td>
                              <td className="p-3 text-gray-600">
                                {fee.description || "-"}
                              </td>
                              <td className="p-3">
                                <span className={`px-2 py-1 text-xs rounded ${
                                  isCompulsory 
                                    ? "bg-blue-100 text-blue-800" 
                                    : "bg-purple-100 text-purple-800"
                                }`}>
                                  {isCompulsory ? "Compulsory" : "Optional"}
                                </span>
                              </td>
                              <td className="p-3">
                                <div className="flex gap-2">
                                  <button 
                                    onClick={() => {
                                      setFeeStructureForm({
                                        id: fee.id,
                                        semester: fee.semester,
                                        feeType: fee.feeType,
                                        amount: fee.amount,
                                        dueDate: new Date(fee.dueDate).toISOString().split('T')[0],
                                        description: fee.description || "",
                                        isEditing: true,
                                      });
                                    }}
                                    className="text-blue-600 hover:text-blue-800 p-2"
                                  >
                                    <FaEdit />
                                  </button>
                                  <button 
                                    onClick={() => {
                                      if (window.confirm("Delete this fee structure?")) {
                                        deleteDoc(doc(db, "feeStructures", fee.id)).then(() => {
                                          toast.success("Fee structure deleted");
                                          fetchFeeStructures();
                                        });
                                      }
                                    }}
                                    className="text-red-600 hover:text-red-800 p-2"
                                  >
                                    <FaTrash />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ================= REPORTS TAB ================= */}
            {activeTab === "reports" && (
              <div className="p-6 space-y-6">
                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white rounded-xl border border-gray-300 p-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500">Today's Collection</p>
                        <p className="text-2xl font-bold text-green-600">
                          ₹{feePayments
                            .filter(p => {
                              const today = new Date();
                              const paymentDate = p.paymentDate;
                              return paymentDate &&
                                paymentDate.getDate() === today.getDate() &&
                                paymentDate.getMonth() === today.getMonth() &&
                                paymentDate.getFullYear() === today.getFullYear();
                            })
                            .reduce((sum, p) => sum + (p.amount || 0), 0)
                            .toLocaleString()}
                        </p>
                      </div>
                      <FaCalendarCheck className="text-2xl text-green-500" />
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-xl border border-gray-300 p-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500">Monthly Collection</p>
                        <p className="text-2xl font-bold text-blue-600">
                          ₹{feePayments
                            .filter(p => {
                              const today = new Date();
                              const paymentDate = p.paymentDate;
                              return paymentDate &&
                                paymentDate.getMonth() === today.getMonth() &&
                                paymentDate.getFullYear() === today.getFullYear();
                            })
                            .reduce((sum, p) => sum + (p.amount || 0), 0)
                            .toLocaleString()}
                        </p>
                      </div>
                      <FaChartLine className="text-2xl text-blue-500" />
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-xl border border-gray-300 p-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500">Pending Fees</p>
                        <p className="text-2xl font-bold text-red-600">
                          ₹{students.reduce((total, student) => {
                            const summary = getStudentFeeSummary(student);
                            return total + summary.pending;
                          }, 0).toLocaleString()}
                        </p>
                      </div>
                      <FaExclamationTriangle className="text-2xl text-red-500" />
                    </div>
                  </div>
                </div>

                {/* Department-wise Report */}
                <div className="bg-white rounded-xl border border-gray-300 p-5">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    Department-wise Fee Collection
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="p-3 text-left text-sm font-medium text-gray-700">Department</th>
                          <th className="p-3 text-left text-sm font-medium text-gray-700">Total Students</th>
                          <th className="p-3 text-left text-sm font-medium text-gray-700">Total Fee</th>
                          <th className="p-3 text-left text-sm font-medium text-gray-700">Collected</th>
                          <th className="p-3 text-left text-sm font-medium text-gray-700">Pending</th>
                          <th className="p-3 text-left text-sm font-medium text-gray-700">% Collected</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {(() => {
                          const deptData = {};
                          students.forEach(student => {
                            const dept = student.course || "Unknown";
                            if (!deptData[dept]) {
                              deptData[dept] = {
                                students: 0,
                                total: 0,
                                collected: 0,
                              };
                            }
                            deptData[dept].students++;
                            
                            const summary = getStudentFeeSummary(student);
                            deptData[dept].total += summary.total;
                            deptData[dept].collected += summary.paid;
                          });

                          return Object.entries(deptData).map(([dept, data]) => {
                            const pending = data.total - data.collected;
                            const percentage = data.total > 0 ? Math.round((data.collected / data.total) * 100) : 0;
                            
                            return (
                              <tr key={dept} className="hover:bg-gray-50">
                                <td className="p-3 font-medium">{dept}</td>
                                <td className="p-3">{data.students}</td>
                                <td className="p-3 font-bold">₹{data.total.toLocaleString()}</td>
                                <td className="p-3 text-green-600 font-bold">
                                  ₹{data.collected.toLocaleString()}
                                </td>
                                <td className="p-3 text-red-600 font-bold">
                                  ₹{pending.toLocaleString()}
                                </td>
                                <td className="p-3">
                                  <div className="flex items-center gap-2">
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                      <div
                                        className="bg-green-600 h-2 rounded-full"
                                        style={{ width: `${percentage}%` }}
                                      ></div>
                                    </div>
                                    <span className="text-sm font-medium">{percentage}%</span>
                                  </div>
                                </td>
                              </tr>
                            );
                          });
                        })()}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Fee Type Distribution */}
                <div className="bg-white rounded-xl border border-gray-300 p-5">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    Fee Type Distribution
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      {(() => {
                        const feeTypeData = {};
                        feePayments.forEach(payment => {
                          const feeType = payment.feeType;
                          feeTypeData[feeType] = (feeTypeData[feeType] || 0) + (payment.amount || 0);
                        });

                        const total = Object.values(feeTypeData).reduce((a, b) => a + b, 0);
                        
                        return Object.entries(feeTypeData).map(([feeType, amount], index) => {
                          const percentage = total > 0 ? Math.round((amount / total) * 100) : 0;
                          const colors = [
                            'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-purple-500',
                            'bg-pink-500', 'bg-indigo-500', 'bg-red-500', 'bg-teal-500'
                          ];
                          const color = colors[index] || 'bg-gray-500';
                          const Icon = FEE_TYPE_ICONS[feeType] || FaMoneyBillWave;
                          
                          return (
                            <div key={feeType} className="space-y-2">
                              <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                  <Icon className={`${color.replace('bg-', 'text-')}`} />
                                  <span className="font-medium">{FEE_TYPE_LABELS[feeType] || feeType}</span>
                                </div>
                                <div className="text-right">
                                  <span className="font-bold">₹{amount.toLocaleString()}</span>
                                  <span className="text-gray-500 text-sm ml-2">({percentage}%)</span>
                                </div>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                  className={`h-2 rounded-full ${color}`}
                                  style={{ width: `${percentage}%` }}
                                ></div>
                              </div>
                            </div>
                          );
                        });
                      })()}
                    </div>
                    
                    <div className="flex flex-col items-center justify-center">
                      <div className="text-center mb-4">
                        <p className="text-3xl font-bold">₹{totalFeeCollection.toLocaleString()}</p>
                        <p className="text-gray-500">Total Collection</p>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                          <span>Compulsory Fees</span>
                        </div>
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                          <span>Optional Fees</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}