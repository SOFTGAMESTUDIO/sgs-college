// File: pages/student/StudentFees.js
import React, { useEffect, useState, useCallback } from "react";
import { db } from "../../db/firebaseConfig";
import {
  collection,
  getDocs,
  query,
  where,
  addDoc,
  updateDoc,
  doc,
  serverTimestamp,
  orderBy,
} from "firebase/firestore";
import { useAuth } from "../../auth/authProvider";
import Layout from "../../components/Layout";
import { toast } from "react-toastify";
import {
  FaMoneyBillWave,
  FaCalendarAlt,
  FaCheckCircle,
  FaClock,
  FaExclamationTriangle,
  FaCreditCard,
  FaPrint,
  FaDownload,
  FaHistory,
  FaSpinner,
  FaReceipt,
  FaChartPie,
  FaCalendarCheck,
  FaFileInvoice,
  FaUserGraduate,
  FaUniversity,
  FaFilePdf,
  FaEye,
  FaInfoCircle,
  FaCalendarDay,
  FaWallet,
  FaChartLine,
  FaSync,
  FaExpand,
  FaCompress,
  FaRegCalendarCheck,
  FaArrowRight,
  FaHome,
  FaBook,
  FaFootballBall,
  FaBuilding,
  FaHospital,
  FaBus,
  FaCheck,
} from "react-icons/fa";
import { FaRegCreditCard } from "react-icons/fa6";
import html2pdf from "html2pdf.js";

export default function StudentFees() {
  const { user } = useAuth();
  const [student, setStudent] = useState(null);
  const [feePayments, setFeePayments] = useState([]);
  const [allFeeStructures, setAllFeeStructures] = useState([]);
  const [loading, setLoading] = useState({
    student: true,
    payments: true,
    feeStructures: true,
  });
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedSemester, setSelectedSemester] = useState("");
  const [expandedView, setExpandedView] = useState(false);
  const [feeSearch, setFeeSearch] = useState("");
  const [payingAll, setPayingAll] = useState(false);

  // Constants from teacher page
  const COMPULSORY_FEES = ["tuition", "exam"];
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

  const [paymentMethods] = useState([
    { id: "online", name: "Online Payment", icon: FaCreditCard, color: "bg-green-500" },
    { id: "cash", name: "Cash", icon: FaMoneyBillWave, color: "bg-yellow-500" },
    { id: "cheque", name: "Cheque", icon: FaRegCreditCard, color: "bg-blue-500" },
    { id: "bank_transfer", name: "Bank Transfer", icon: FaWallet, color: "bg-purple-500" },
  ]);

  const isFeeApplicable = (feeType) => {
    if (!student || !student.optionalFees) return COMPULSORY_FEES.includes(feeType);
    
    // Compulsory fees are always applicable
    if (COMPULSORY_FEES.includes(feeType)) return true;
    
    // Check if optional fee is enabled for this student and semester
    const semesterConfig = student.optionalFees[selectedSemester] || {};
    return semesterConfig[feeType] === true;
  };

  useEffect(() => {
    if (user) {
      fetchAllData();
    }
  }, [user]);

  const fetchAllData = useCallback(async () => {
    try {
      await Promise.all([
        fetchStudentData(),
        fetchFeeStructures(),
        fetchFeePayments(),
      ]);
    } catch (error) {
      toast.error("Failed to fetch data");
      console.error(error);
    }
  }, []);

  const getFeePaymentInfo = (fee) => {
    const statusObj = student?.feeStatus?.[fee.semester]?.[fee.feeType];
    const paidAmount = statusObj?.amount || 0;
    const isFullyPaid = paidAmount >= fee.amount;
    const isPartiallyPaid = paidAmount > 0 && paidAmount < fee.amount;
    const isUnpaid = paidAmount === 0;

    return {
      paidAmount,
      balance: Math.max(fee.amount - paidAmount, 0),
      isFullyPaid,
      isPartiallyPaid,
      isUnpaid,
    };
  };

  const filterFees = (fees) => {
    return fees.filter(fee => {
      // Filter by semester
      if (Number(fee.semester) !== Number(selectedSemester)) return false;
      
      // Filter by search term
      if (feeSearch) {
        const search = feeSearch.toLowerCase();
        const { isFullyPaid, isPartiallyPaid } = getFeePaymentInfo(fee);
        
        if (
          !fee.feeType.toLowerCase().includes(search) &&
          !(search === "paid" && isFullyPaid) &&
          !(search === "partial" && isPartiallyPaid) &&
          !(search === "pending" && !isFullyPaid)
        ) {
          return false;
        }
      }
      
      // Filter by applicability (optional fees)
      if (!isFeeApplicable(fee.feeType)) return false;
      
      return true;
    });
  };

  const fetchStudentData = async () => {
    setLoading(prev => ({ ...prev, student: true }));
    try {
      const studentQuery = query(
        collection(db, "students"),
        where("uid", "==", user.uid)
      );
      const studentSnapshot = await getDocs(studentQuery);

      if (!studentSnapshot.empty) {
        const docSnap = studentSnapshot.docs[0];
        const studentData = docSnap.data();

        const processedStudentData = {
          docId: docSnap.id,
          id: docSnap.id,
          name: studentData.name || "Unknown",
          rollNo: studentData.rollNo || "N/A",
          branch: studentData.branch || studentData.course || "Unknown",
          course: studentData.course || studentData.branch || "Unknown",
          semester: studentData.semester || 1,
          email: studentData.email || "",
          phone: studentData.phone || "",
          admissionDate: studentData.admissionDate?.toDate(),
          dob: studentData.dob?.toDate(),
          feeStatus: studentData.feeStatus || {},
          optionalFees: studentData.optionalFees || {},
          uid: studentData.uid || user.uid,
        };

        setStudent(processedStudentData);
        setSelectedSemester(processedStudentData.semester);
      } else {
        toast.error("Student record not found");
      }
    } catch (error) {
      toast.error("Failed to load student data");
      console.error("Error fetching student:", error);
    } finally {
      setLoading(prev => ({ ...prev, student: false }));
    }
  };

  const fetchFeePayments = async () => {
    setLoading(prev => ({ ...prev, payments: true }));
    try {
      if (!student?.id) return;
      
      const q = query(
        collection(db, "feePayments"),
        where("studentId", "==", student.id),
        orderBy("paymentDate", "desc")
      );
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        paymentDate: doc.data().paymentDate?.toDate(),
      }));
      setFeePayments(data);
    } catch (error) {
      console.error("Error fetching payments:", error);
      toast.error("Failed to load payment history");
    } finally {
      setLoading(prev => ({ ...prev, payments: false }));
    }
  };

  const fetchFeeStructures = async () => {
    setLoading(prev => ({ ...prev, feeStructures: true }));
    try {
      const q = query(collection(db, "feeStructures"), orderBy("semester"));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        dueDate: doc.data().dueDate?.toDate(),
      }));
      setAllFeeStructures(data);
    } catch (error) {
      console.error("Error fetching fee structures:", error);
      toast.error("Failed to load fee structures");
    } finally {
      setLoading(prev => ({ ...prev, feeStructures: false }));
    }
  };

  const getFeeSummary = (semester = null) => {
    if (!student || !allFeeStructures.length) {
      return { total: 0, paid: 0, pending: 0, percentage: 0 };
    }

    const targetSemester = semester || student.semester;
    const semesterFees = allFeeStructures.filter(fee => 
      parseInt(fee.semester) === parseInt(targetSemester) && 
      isFeeApplicable(fee.feeType)
    );

    if (semesterFees.length === 0) {
      return { total: 0, paid: 0, pending: 0, percentage: 0 };
    }

    const total = semesterFees.reduce((sum, fee) => sum + (fee.amount || 0), 0);
    const paid = semesterFees.reduce((sum, fee) => {
      const { paidAmount } = getFeePaymentInfo(fee);
      return sum + paidAmount;
    }, 0);

    return {
      total,
      paid,
      pending: total - paid,
      percentage: total > 0 ? Math.round((paid / total) * 100) : 0,
      semester: targetSemester,
    };
  };

  const getStudentAllSemesterSummary = () => {
    if (!student || !allFeeStructures.length) return [];

    const currentSemester = parseInt(student.semester);
    const summaries = [];

    for (let sem = 1; sem <= currentSemester; sem++) {
      const summary = getFeeSummary(sem);
      summaries.push({
        semester: sem,
        ...summary,
        isCurrent: sem === currentSemester
      });
    }

    return summaries;
  };

  const getUpcomingFees = () => {
    if (!allFeeStructures.length || !student) return [];
    const today = new Date();
    const currentSemester = student.semester;

    return allFeeStructures
      .filter(fee => {
        const semester = parseInt(fee.semester);
        const isCurrentOrPast = semester <= parseInt(currentSemester);
        if (!isCurrentOrPast) return false;
        if (!isFeeApplicable(fee.feeType)) return false;
        
        const { isFullyPaid } = getFeePaymentInfo(fee);
        return !isFullyPaid && new Date(fee.dueDate) > today;
      })
      .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
  };

  const getOverdueFees = () => {
    if (!allFeeStructures.length || !student) return [];
    const today = new Date();
    const currentSemester = student.semester;

    return allFeeStructures.filter(fee => {
      const semester = parseInt(fee.semester);
      const isCurrentOrPast = semester <= parseInt(currentSemester);
      if (!isCurrentOrPast) return false;
      if (!isFeeApplicable(fee.feeType)) return false;
      
      const { isFullyPaid } = getFeePaymentInfo(fee);
      return !isFullyPaid && new Date(fee.dueDate) < today;
    });
  };

  const getPendingFeesCurrentSemester = () => {
    if (!student || !allFeeStructures.length) return [];

    return allFeeStructures.filter(fee => {
      if (Number(fee.semester) !== Number(student.semester)) return false;
      if (!isFeeApplicable(fee.feeType)) return false;
      const { isFullyPaid } = getFeePaymentInfo(fee);
      return !isFullyPaid;
    });
  };

  const generateReceipt = (payment) => {
    const receiptContent = `
      <div id="receipt-content" style="font-family: Arial, sans-serif; padding: 20px; max-width: 400px; margin: 0 auto;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h2 style="font-size: 24px; font-weight: bold; color: #1e40af;">STUDENT FEE RECEIPT</h2>
          <p style="color: #666; font-size: 12px;">Official Payment Receipt</p>
        </div>
        
        <div style="border: 2px solid #1e40af; border-radius: 10px; padding: 20px;">
          <div style="margin-bottom: 20px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
              <span style="font-weight: bold;">Receipt No:</span>
              <span>${payment.transactionId || `REC-${Date.now()}`}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
              <span style="font-weight: bold;">Date:</span>
              <span>${new Date(payment.paymentDate || new Date()).toLocaleDateString()}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
              <span style="font-weight: bold;">Time:</span>
              <span>${new Date(payment.paymentDate || new Date()).toLocaleTimeString()}</span>
            </div>
          </div>
          
          <div style="border-top: 1px dashed #ccc; border-bottom: 1px dashed #ccc; padding: 15px 0; margin: 20px 0;">
            <div style="margin-bottom: 15px;">
              <div style="font-weight: bold; color: #1e40af; margin-bottom: 5px;">STUDENT DETAILS</div>
              <div>Name: ${student?.name || 'N/A'}</div>
              <div>Roll No: ${student?.rollNo || 'N/A'}</div>
              <div>Course: ${student?.branch || 'N/A'}</div>
              <div>Semester: ${payment.semester || student?.semester || 'N/A'}</div>
            </div>
            
            <div>
              <div style="font-weight: bold; color: #1e40af; margin-bottom: 5px;">PAYMENT DETAILS</div>
              <div>Fee Type: ${FEE_TYPE_LABELS[payment.feeType] || payment.feeType.toUpperCase()} FEE</div>
              <div>Payment Method: ${(payment.paymentMethod || 'online').toUpperCase()}</div>
              <div>Processed By: ${payment.processedBy || 'University Accounts'}</div>
            </div>
          </div>
          
          <div style="text-align: center; margin: 20px 0;">
            <div style="font-size: 32px; font-weight: bold; color: #059669;">₹${(payment.amount || 0).toFixed(2)}</div>
            <div style="font-size: 14px; color: #666;">Amount Received</div>
          </div>
          
          <div style="border-top: 2px solid #1e40af; padding-top: 15px;">
            <div style="font-size: 12px; color: #666; text-align: center;">
              <div>Status: PAID</div>
              <div>Department: ${student?.branch || 'University'}</div>
              <div style="margin-top: 10px;">This is a computer-generated receipt. No signature required.</div>
              <div>Valid only with official stamp and signature</div>
            </div>
          </div>
        </div>
        
        <div style="text-align: center; margin-top: 20px; font-size: 11px; color: #999;">
          <div>University Fee Management System</div>
          <div>Thank you for your payment</div>
        </div>
      </div>
    `;

    const receiptWindow = window.open("", "_blank");
    receiptWindow.document.write(`
      <html>
        <head>
          <title>Payment Receipt - ${payment.transactionId || `REC-${Date.now()}`}</title>
          <style>
            @media print {
              body { margin: 0; }
              .no-print { display: none !important; }
            }
          </style>
        </head>
        <body>
          ${receiptContent}
          <div class="no-print" style="text-align: center; margin-top: 20px; padding: 20px;">
            <button onclick="window.print()" style="background: #1e40af; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; margin-right: 10px;">
              Print Receipt
            </button>
            <button onclick="downloadPDF()" style="background: #059669; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer;">
              Download PDF
            </button>
          </div>
          <script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"></script>
          <script>
            function downloadPDF() {
              const element = document.getElementById('receipt-content');
              const opt = {
                margin: 10,
                filename: 'receipt-${payment.transactionId || `REC-${Date.now()}`}.pdf',
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { scale: 2 },
                jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
              };
              html2pdf().set(opt).from(element).save();
            }
          </script>
        </body>
      </html>
    `);
    receiptWindow.document.close();
  };

  const downloadFeeStatement = () => {
    const allSummaries = getStudentAllSemesterSummary();
    const totalAll = allSummaries.reduce((sum, s) => sum + s.total, 0);
    const paidAll = allSummaries.reduce((sum, s) => sum + s.paid, 0);
    const pendingAll = allSummaries.reduce((sum, s) => sum + s.pending, 0);

    const element = document.createElement('div');
    element.innerHTML = `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2 style="color: #1e40af; text-align: center;">STUDENT FEE STATEMENT</h2>
        <h3 style="text-align: center;">${student?.name || 'Student'}</h3>
        <p style="text-align: center;">
          Roll No: ${student?.rollNo || 'N/A'} | Course: ${student?.branch || 'N/A'} | 
          Current Semester: ${student?.semester || 'N/A'}
        </p>
        
        <div style="margin: 20px 0; border: 1px solid #ccc; padding: 15px; border-radius: 5px;">
          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; text-align: center;">
            <div>
              <div style="font-size: 12px; color: #666;">Total Fee (All Semesters)</div>
              <div style="font-size: 18px; font-weight: bold;">₹${totalAll.toFixed(2)}</div>
            </div>
            <div>
              <div style="font-size: 12px; color: #666;">Paid Amount</div>
              <div style="font-size: 18px; font-weight: bold; color: #059669;">₹${paidAll.toFixed(2)}</div>
            </div>
            <div>
              <div style="font-size: 12px; color: #666;">Pending Amount</div>
              <div style="font-size: 18px; font-weight: bold; color: #dc2626;">₹${pendingAll.toFixed(2)}</div>
            </div>
          </div>
        </div>
        
        <div style="margin: 20px 0;">
          <h4 style="color: #1e40af; margin-bottom: 15px;">Semester-wise Summary</h4>
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="background: #f3f4f6;">
                <th style="border: 1px solid #ccc; padding: 8px; text-align: left;">Semester</th>
                <th style="border: 1px solid #ccc; padding: 8px; text-align: left;">Total Fee</th>
                <th style="border: 1px solid #ccc; padding: 8px; text-align: left;">Paid Amount</th>
                <th style="border: 1px solid #ccc; padding: 8px; text-align: left;">Pending Amount</th>
                <th style="border: 1px solid #ccc; padding: 8px; text-align: left;">% Paid</th>
                <th style="border: 1px solid #ccc; padding: 8px; text-align: left;">Status</th>
              </tr>
            </thead>
            <tbody>
              ${allSummaries.map(summary => `
                <tr>
                  <td style="border: 1px solid #ccc; padding: 8px;">
                    Semester ${summary.semester}
                    ${summary.isCurrent ? '<span style="font-size: 11px; color: #1e40af; margin-left: 5px;">(Current)</span>' : ''}
                  </td>
                  <td style="border: 1px solid #ccc; padding: 8px;">₹${summary.total.toFixed(2)}</td>
                  <td style="border: 1px solid #ccc; padding: 8px; color: #059669;">₹${summary.paid.toFixed(2)}</td>
                  <td style="border: 1px solid #ccc; padding: 8px; color: #dc2626;">₹${summary.pending.toFixed(2)}</td>
                  <td style="border: 1px solid #ccc; padding: 8px;">
                    <div style="display: flex; align-items: center; gap: 8px;">
                      <div style="width: 50px; background: #e5e7eb; border-radius: 10px; height: 8px;">
                        <div style="width: ${summary.percentage}%; background: #059669; height: 8px; border-radius: 10px;"></div>
                      </div>
                      <span>${summary.percentage}%</span>
                    </div>
                  </td>
                  <td style="border: 1px solid #ccc; padding: 8px;">
                    <span style="padding: 3px 8px; border-radius: 12px; font-size: 11px; font-weight: bold; 
                      background: ${summary.percentage === 100 ? '#d1fae5' : summary.percentage > 50 ? '#fef3c7' : '#fecaca'};
                      color: ${summary.percentage === 100 ? '#065f46' : summary.percentage > 50 ? '#92400e' : '#991b1b'};">
                      ${summary.percentage === 100 ? 'COMPLETED' : summary.percentage > 50 ? 'PARTIAL' : 'PENDING'}
                    </span>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
        
        <div style="margin: 20px 0;">
          <h4 style="color: #1e40af; margin-bottom: 15px;">Current Semester Fee Breakdown</h4>
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="background: #f3f4f6;">
                <th style="border: 1px solid #ccc; padding: 8px; text-align: left;">Fee Type</th>
                <th style="border: 1px solid #ccc; padding: 8px; text-align: left;">Amount</th>
                <th style="border: 1px solid #ccc; padding: 8px; text-align: left;">Due Date</th>
                <th style="border: 1px solid #ccc; padding: 8px; text-align: left;">Status</th>
                <th style="border: 1px solid #ccc; padding: 8px; text-align: left;">Amount Paid</th>
                <th style="border: 1px solid #ccc; padding: 8px; text-align: left;">Balance</th>
              </tr>
            </thead>
            <tbody>
              ${filterFees(allFeeStructures).map(fee => {
                const { paidAmount, balance } = getFeePaymentInfo(fee);
                const isOverdue = fee.dueDate && new Date(fee.dueDate) < new Date() && balance > 0;

                return `
                  <tr>
                    <td style="border: 1px solid #ccc; padding: 8px;">${FEE_TYPE_LABELS[fee.feeType] || fee.feeType.toUpperCase()}</td>
                    <td style="border: 1px solid #ccc; padding: 8px;">₹${fee.amount.toFixed(2)}</td>
                    <td style="border: 1px solid #ccc; padding: 8px;">${new Date(fee.dueDate).toLocaleDateString()}</td>
                    <td style="border: 1px solid #ccc; padding: 8px;">
                      <span style="padding: 3px 8px; border-radius: 12px; font-size: 11px; font-weight: bold; 
                        background: ${balance === 0 ? '#d1fae5' : isOverdue ? '#fecaca' : '#fef3c7'};
                        color: ${balance === 0 ? '#065f46' : isOverdue ? '#991b1b' : '#92400e'};">
                        ${balance === 0 ? 'PAID' : isOverdue ? 'OVERDUE' : 'PENDING'}
                      </span>
                    </td>
                    <td style="border: 1px solid #ccc; padding: 8px; color: #059669; font-weight: bold;">₹${paidAmount.toFixed(2)}</td>
                    <td style="border: 1px solid #ccc; padding: 8px; color: #dc2626; font-weight: bold;">₹${balance.toFixed(2)}</td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
        
        ${feePayments.length > 0 ? `
          <div style="margin: 20px 0;">
            <h4 style="color: #1e40af; margin-bottom: 15px;">Payment History (Last 10 Payments)</h4>
            <table style="width: 100%; border-collapse: collapse;">
              <thead>
                <tr style="background: #f3f4f6;">
                  <th style="border: 1px solid #ccc; padding: 8px; text-align: left;">Date</th>
                  <th style="border: 1px solid #ccc; padding: 8px; text-align: left;">Fee Type</th>
                  <th style="border: 1px solid #ccc; padding: 8px; text-align: left;">Semester</th>
                  <th style="border: 1px solid #ccc; padding: 8px; text-align: left;">Amount</th>
                  <th style="border: 1px solid #ccc; padding: 8px; text-align: left;">Method</th>
                  <th style="border: 1px solid #ccc; padding: 8px; text-align: left;">Transaction ID</th>
                </tr>
              </thead>
              <tbody>
                ${feePayments.slice(0, 10).map(payment => `
                  <tr>
                    <td style="border: 1px solid #ccc; padding: 8px;">${new Date(payment.paymentDate).toLocaleDateString()}</td>
                    <td style="border: 1px solid #ccc; padding: 8px;">${FEE_TYPE_LABELS[payment.feeType] || payment.feeType.toUpperCase()}</td>
                    <td style="border: 1px solid #ccc; padding: 8px;">Sem ${payment.semester}</td>
                    <td style="border: 1px solid #ccc; padding: 8px; color: #059669; font-weight: bold;">₹${payment.amount.toFixed(2)}</td>
                    <td style="border: 1px solid #ccc; padding: 8px;">${payment.paymentMethod.toUpperCase()}</td>
                    <td style="border: 1px solid #ccc; padding: 8px; font-size: 10px;">${payment.transactionId || 'N/A'}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        ` : ''}
        
        <div style="margin-top: 30px; text-align: center; font-size: 12px; color: #666;">
          <div>Generated on: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}</div>
          <div>Student: ${student?.name} (${student?.rollNo})</div>
          <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #ccc;">
            This is a computer-generated statement. Official records are maintained in the university database.
          </div>
        </div>
      </div>
    `;

    const opt = {
      margin: 10,
      filename: `fee-statement-${student?.rollNo}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    html2pdf().set(opt).from(element).save();
  };

  const simulateOnlinePayment = async (fee) => {
    if (!student || !student.docId) {
      toast.error("Student information not loaded. Please refresh the page.");
      return;
    }

    const { balance } = getFeePaymentInfo(fee);
    const paymentAmount = balance;

    if (!student.name || !student.rollNo || !student.branch) {
      toast.error("Student information incomplete. Please contact administrator.");
      return;
    }

    toast.info(
      <div className="space-y-2">
        <div className="font-semibold">Processing Online Payment...</div>
        <div className="text-sm">Amount: ₹{paymentAmount.toLocaleString()}</div>
        <div className="text-xs text-gray-600">(This is a prototype - no real payment)</div>
      </div>
    );

    try {
      const paymentData = {
        studentId: student.docId,
        studentName: student.name,
        studentRollNo: student.rollNo,
        studentCourse: student.branch,
        semester: Number(student.semester),
        feeType: fee.feeType,
        amount: paymentAmount,
        paymentMethod: 'online',
        transactionId: `ONLINE-${Date.now()}`,
        status: 'paid',
        remarks: `Student self-payment for ${FEE_TYPE_LABELS[fee.feeType] || fee.feeType} fee`,
        paymentDate: new Date(),
        processedBy: 'Student Self-Payment',
        createdAt: serverTimestamp(),
      };

      const paymentRef = await addDoc(collection(db, "feePayments"), paymentData);

      const prev = student.feeStatus?.[student.semester]?.[fee.feeType]?.amount || 0;
      const newAmount = prev + paymentAmount;

      const currentFeeStatus = { ...(student.feeStatus || {}) };
      currentFeeStatus[student.semester] ||= {};
      currentFeeStatus[student.semester][fee.feeType] = {
        amount: newAmount,
        status: newAmount >= fee.amount ? "paid" : "partial",
      };

      await updateDoc(doc(db, "students", student.docId), {
        feeStatus: currentFeeStatus,
        updatedAt: serverTimestamp(),
      });

      toast.success(
        <div className="space-y-2">
          <div className="font-semibold">Payment Successful!</div>
          <div className="text-sm">₹{paymentAmount.toLocaleString()} paid for {FEE_TYPE_LABELS[fee.feeType] || fee.feeType} fee</div>
          <div className="text-xs text-gray-600">Transaction ID: {paymentData.transactionId}</div>
        </div>
      );

      await fetchAllData();

      const simulatedPayment = {
        id: paymentRef.id,
        ...paymentData
      };

      setTimeout(() => {
        generateReceipt(simulatedPayment);
      }, 1000);

    } catch (error) {
      console.error("Payment error:", error);
      toast.error(`Failed to process payment: ${error.message}`);
    }
  };

  const payAllFeesCurrentSemester = async () => {
    if (payingAll) return;
    setPayingAll(true);

    const pendingFees = getPendingFeesCurrentSemester();

    if (pendingFees.length === 0) {
      toast.info("No pending fees for current semester 🎉");
      setPayingAll(false);
      return;
    }

    try {
      const updatedFeeStatus = { ...(student.feeStatus || {}) };
      updatedFeeStatus[student.semester] ||= {};

      for (const fee of pendingFees) {
        const prev = updatedFeeStatus[student.semester]?.[fee.feeType]?.amount || 0;
        const balance = Math.max(fee.amount - prev, 0);

        if (balance <= 0) continue;

        await addDoc(collection(db, "feePayments"), {
          studentId: student.docId,
          studentName: student.name,
          studentRollNo: student.rollNo,
          studentCourse: student.branch,
          semester: Number(student.semester),
          feeType: fee.feeType,
          amount: balance,
          paymentMethod: "online",
          transactionId: `ONLINE-${fee.feeType}-${Date.now()}`,
          status: "paid",
          paymentDate: new Date(),
          processedBy: "Student Self-Payment",
          createdAt: serverTimestamp(),
        });

        updatedFeeStatus[student.semester][fee.feeType] = {
          amount: prev + balance,
          status: "paid",
        };
      }

      await updateDoc(doc(db, "students", student.docId), {
        feeStatus: updatedFeeStatus,
        updatedAt: serverTimestamp(),
      });

      toast.success("All current semester fees paid successfully 🎉");
      await fetchAllData();

    } catch (error) {
      console.error(error);
      toast.error("Payment failed");
    } finally {
      setPayingAll(false);
    }
  };

  const getPaymentMethodStats = () => {
    const stats = {};
    feePayments.forEach(payment => {
      const method = payment.paymentMethod || 'online';
      stats[method] = (stats[method] || 0) + 1;
    });
    return stats;
  };

  const getRecentActivity = () => {
    const activities = [];

    feePayments.slice(0, 5).forEach(payment => {
      activities.push({
        id: `payment-${payment.id}`,
        type: 'payment',
        title: 'Payment Received',
        description: `₹${payment.amount.toLocaleString()} for ${FEE_TYPE_LABELS[payment.feeType] || payment.feeType} fee`,
        date: payment.paymentDate,
        icon: FaCheckCircle,
        color: 'text-green-500',
      });
    });

    getUpcomingFees().slice(0, 3).forEach(fee => {
      const daysUntilDue = Math.ceil(
        (new Date(fee.dueDate) - new Date()) / (1000 * 60 * 60 * 24)
      );

      activities.push({
        id: `reminder-${fee.id}`,
        type: 'reminder',
        title: 'Upcoming Fee',
        description: `${FEE_TYPE_LABELS[fee.feeType] || fee.feeType} fee due in ${daysUntilDue} days`,
        date: fee.dueDate,
        icon: FaCalendarDay,
        color: 'text-blue-500',
      });
    });

    return activities.sort((a, b) => new Date(b.date) - new Date(a.date));
  };

  const getApplicableFeesForSemester = (semester) => {
    return allFeeStructures.filter(fee => 
      parseInt(fee.semester) === parseInt(semester) && 
      isFeeApplicable(fee.feeType)
    );
  };

  if (loading.student) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
          <div className="text-center">
            <FaSpinner className="animate-spin text-4xl text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading your fee information...</p>
            <p className="text-sm text-gray-500 mt-2">Please wait while we fetch your data</p>
          </div>
        </div>
      </Layout>
    );
  }

  const currentSummary = getFeeSummary();
  const allSummaries = getStudentAllSemesterSummary();
  const upcomingFees = getUpcomingFees();
  const overdueFees = getOverdueFees();
  const recentActivity = getRecentActivity();
  const paymentStats = getPaymentMethodStats();
  const pendingFeesCurrent = getPendingFeesCurrentSemester();

  return (
    <Layout>
      <div className={`min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4 md:p-6 ${expandedView ? 'p-2 md:p-4' : ''}`}>
        <div className={`mx-auto space-y-6 ${expandedView ? 'max-w-full' : 'max-w-7xl'}`}>
          {/* HEADER */}
          <div className="bg-white rounded-2xl shadow-xl p-6 border border-blue-200">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                      <FaMoneyBillWave className="text-blue-600" />
                      My Fee Portal
                    </h1>
                    <p className="text-gray-600 mt-1">
                      Welcome, <span className="font-semibold text-blue-700">{student?.name}</span> •
                      <span className="ml-2 px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                        Roll: {student?.rollNo}
                      </span>
                      <span className="ml-2 px-3 py-1 bg-indigo-100 text-indigo-800 text-sm rounded-full">
                        {student?.branch}
                      </span>
                      <span className="ml-2 px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">
                        Semester {student?.semester}
                      </span>
                    </p>
                  </div>
                  <button
                    onClick={() => setExpandedView(!expandedView)}
                    className="p-2 text-gray-600 hover:text-gray-800"
                    title={expandedView ? "Compact View" : "Expanded View"}
                  >
                    {expandedView ? <FaCompress /> : <FaExpand />}
                  </button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
                  <div className="bg-gradient-to-r from-green-50 to-green-100 p-3 rounded-xl border border-green-200">
                    <p className="text-xs text-green-600">Total Paid (Current Sem)</p>
                    <p className="text-lg font-bold text-green-700">₹{currentSummary.paid.toLocaleString()}</p>
                  </div>
                  <div className="bg-gradient-to-r from-red-50 to-red-100 p-3 rounded-xl border border-red-200">
                    <p className="text-xs text-red-600">Pending (Current Sem)</p>
                    <p className="text-lg font-bold text-red-700">₹{currentSummary.pending.toLocaleString()}</p>
                  </div>
                  <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 p-3 rounded-xl border border-yellow-200">
                    <p className="text-xs text-yellow-600">Overdue Fees</p>
                    <p className="text-lg font-bold text-yellow-700">{overdueFees.length}</p>
                  </div>
                  <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-3 rounded-xl border border-blue-200">
                    <p className="text-xs text-blue-600">Payment Status</p>
                    <p className="text-lg font-bold text-blue-700">{currentSummary.percentage}%</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ACTION BUTTONS */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <button
              onClick={downloadFeeStatement}
              className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl p-4 shadow-lg hover:shadow-xl transition-all hover:scale-[1.02]"
            >
              <div className="flex items-center justify-between">
                <div>
                  <FaFilePdf className="text-2xl mb-2" />
                  <p className="font-semibold">Download Statement</p>
                </div>
                <FaDownload className="text-xl opacity-80" />
              </div>
            </button>

            <button
              disabled={payingAll || pendingFeesCurrent.length === 0}
              onClick={payAllFeesCurrentSemester}
              className={`bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl p-4 shadow-lg hover:shadow-xl transition-all ${
                pendingFeesCurrent.length === 0 ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <FaCreditCard className="text-2xl mb-2" />
                  <p className="font-semibold">Pay All Fees (Current Sem)</p>
                  <p className="text-xs opacity-90 text-left">
                    ₹{pendingFeesCurrent
                      .reduce((sum, f) => sum + getFeePaymentInfo(f).balance, 0)
                      .toLocaleString()}
                  </p>
                </div>
                {payingAll ? (
                  <FaSpinner className="text-xl animate-spin opacity-80" />
                ) : (
                  <FaArrowRight className="text-xl opacity-80" />
                )}
              </div>
            </button>

            <button
              onClick={() => setActiveTab('payments')}
              className="bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl p-4 shadow-lg hover:shadow-xl transition-all hover:scale-[1.02]"
            >
              <div className="flex items-center justify-between">
                <div>
                  <FaHistory className="text-2xl mb-2" />
                  <p className="font-semibold">Payment History</p>
                  <p className="text-xs opacity-90">{feePayments.length} transactions</p>
                </div>
                <FaReceipt className="text-xl opacity-80" />
              </div>
            </button>

            <button
              onClick={fetchAllData}
              disabled={loading.student || loading.payments || loading.feeStructures}
              className="bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-xl p-4 shadow-lg hover:shadow-xl transition-all hover:scale-[1.02]"
            >
              <div className="flex items-center justify-between">
                <div>
                  <FaSync className={`text-2xl mb-2 ${
                    loading.student || loading.payments || loading.feeStructures ? 'animate-spin' : ''
                  }`} />
                  <p className="font-semibold">Refresh Data</p>
                </div>
                <FaSpinner className={`text-xl opacity-80 ${
                  loading.student || loading.payments || loading.feeStructures ? 'animate-spin' : ''
                }`} />
              </div>
            </button>
          </div>

          {/* MAIN CONTENT */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Overview & Progress */}
            <div className="lg:col-span-2 space-y-6">
              {/* Progress Section */}
              <div className="bg-white rounded-xl shadow-lg p-5">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                    <FaChartPie className="text-blue-600" />
                    Fee Payment Progress - Semester {student?.semester}
                  </h3>
                  <span className="text-2xl font-bold text-blue-600">{currentSummary.percentage}%</span>
                </div>
                <div className="space-y-4">
                  <div className="w-full bg-gray-200 rounded-full h-4">
                    <div
                      className="bg-gradient-to-r from-green-500 to-green-600 h-4 rounded-full transition-all duration-1000"
                      style={{ width: `${currentSummary.percentage}%` }}
                    ></div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600">Total Fee</p>
                      <p className="text-lg font-bold">₹{currentSummary.total.toLocaleString()}</p>
                    </div>
                    <div className="p-3 bg-green-50 rounded-lg">
                      <p className="text-sm text-green-600">Paid Amount</p>
                      <p className="text-lg font-bold text-green-600">₹{currentSummary.paid.toLocaleString()}</p>
                    </div>
                    <div className="p-3 bg-red-50 rounded-lg">
                      <p className="text-sm text-red-600">Pending Amount</p>
                      <p className="text-lg font-bold text-red-600">₹{currentSummary.pending.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tabs Navigation */}
              <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="flex border-b border-gray-200 overflow-x-auto">
                  <button
                    className={`px-6 py-4 font-medium whitespace-nowrap ${activeTab === "overview"
                      ? "border-b-2 border-blue-600 text-blue-700 bg-blue-50"
                      : "text-gray-600 hover:bg-gray-50"
                      }`}
                    onClick={() => setActiveTab("overview")}
                  >
                    <FaFileInvoice className="inline mr-2" />
                    Fee Overview
                  </button>
                  <button
                    className={`px-6 py-4 font-medium whitespace-nowrap ${activeTab === "breakdown"
                      ? "border-b-2 border-blue-600 text-blue-700 bg-blue-50"
                      : "text-gray-600 hover:bg-gray-50"
                      }`}
                    onClick={() => setActiveTab("breakdown")}
                  >
                    <FaChartLine className="inline mr-2" />
                    Fee Breakdown
                  </button>
                  <button
                    className={`px-6 py-4 font-medium whitespace-nowrap ${activeTab === "payments"
                      ? "border-b-2 border-blue-600 text-blue-700 bg-blue-50"
                      : "text-gray-600 hover:bg-gray-50"
                      }`}
                    onClick={() => setActiveTab("payments")}
                  >
                    <FaHistory className="inline mr-2" />
                    Payment History
                  </button>
                  <button
                    className={`px-6 py-4 font-medium whitespace-nowrap ${activeTab === "semesters"
                      ? "border-b-2 border-blue-600 text-blue-700 bg-blue-50"
                      : "text-gray-600 hover:bg-gray-50"
                      }`}
                    onClick={() => setActiveTab("semesters")}
                  >
                    <FaRegCalendarCheck className="inline mr-2" />
                    All Semesters
                  </button>
                </div>

                {/* Tab Content */}
                <div className="p-6">
                  {/* Overview Tab */}
                  {activeTab === "overview" && (
                    <div className="space-y-6">
                      {/* Quick Stats */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-xl">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-100 rounded-lg">
                              <FaCheckCircle className="text-green-600" />
                            </div>
                            <div>
                              <p className="text-sm text-green-600">Fully Paid Fees</p>
                              <p className="text-lg font-bold">
                                {getApplicableFeesForSemester(selectedSemester).filter(fee => {
                                  const { isFullyPaid } = getFeePaymentInfo(fee);
                                  return isFullyPaid;
                                }).length}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 p-4 rounded-xl">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-yellow-100 rounded-lg">
                              <FaClock className="text-yellow-600" />
                            </div>
                            <div>
                              <p className="text-sm text-yellow-600">Partially Paid</p>
                              <p className="text-lg font-bold">
                                {getApplicableFeesForSemester(selectedSemester).filter(fee => {
                                  const { isPartiallyPaid } = getFeePaymentInfo(fee);
                                  return isPartiallyPaid;
                                }).length}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="bg-gradient-to-r from-red-50 to-red-100 p-4 rounded-xl">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-red-100 rounded-lg">
                              <FaExclamationTriangle className="text-red-600" />
                            </div>
                            <div>
                              <p className="text-sm text-red-600">Unpaid Fees</p>
                              <p className="text-lg font-bold">
                                {getApplicableFeesForSemester(selectedSemester).filter(fee => {
                                  const { isUnpaid } = getFeePaymentInfo(fee);
                                  return isUnpaid;
                                }).length}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-xl">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 rounded-lg">
                              <FaCalendarDay className="text-blue-600" />
                            </div>
                            <div>
                              <p className="text-sm text-blue-600">Upcoming Dues</p>
                              <p className="text-lg font-bold">{upcomingFees.length}</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Payment Methods Used */}
                      <div>
                        <h4 className="font-semibold text-gray-800 mb-3">Payment Methods Used</h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          {paymentMethods.map(method => {
                            const Icon = method.icon;
                            const count = paymentStats[method.id] || 0;
                            const percentage = feePayments.length > 0 ? Math.round((count / feePayments.length) * 100) : 0;

                            return (
                              <div key={method.id} className="bg-white border border-gray-200 p-4 rounded-xl">
                                <div className="flex items-center gap-3">
                                  <div className={`p-2 ${method.color} rounded-lg`}>
                                    <Icon className="text-white" />
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium">{method.name}</p>
                                    <p className="text-lg font-bold">{count} payments</p>
                                    <p className="text-xs text-gray-500">{percentage}% of total</p>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Fee Breakdown Tab */}
                  {activeTab === "breakdown" && (
                    <div className="space-y-6">
                      <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold text-gray-800">
                          Detailed Fee Breakdown - Semester {student?.semester}
                        </h3>
                        <div className="text-sm text-gray-600">
                          Showing applicable fees only
                        </div>
                      </div>
                      
                      <div className="mb-4">
                        <input
                          type="text"
                          value={feeSearch}
                          onChange={(e) => setFeeSearch(e.target.value)}
                          placeholder="Search fee type or status (tuition, paid, partial, pending)"
                          className="w-full md:w-1/2 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div className="space-y-4">
                        {filterFees(allFeeStructures).map((fee) => {
                          const {
                            paidAmount,
                            balance,
                            isFullyPaid,
                            isPartiallyPaid
                          } = getFeePaymentInfo(fee);
                          const isOverdue = fee.dueDate && new Date(fee.dueDate) < new Date() && balance > 0;
                          const FeeIcon = FEE_TYPE_ICONS[fee.feeType] || FaMoneyBillWave;
                          const feeLabel = FEE_TYPE_LABELS[fee.feeType] || fee.feeType.toUpperCase();

                          return (
                            <div
                              key={`${fee.semester}-${fee.feeType}`}
                              className={`p-4 border rounded-xl ${isFullyPaid
                                ? 'border-green-200 bg-green-50'
                                : isOverdue
                                  ? 'border-red-200 bg-red-50'
                                  : isPartiallyPaid
                                    ? 'border-yellow-200 bg-yellow-50'
                                    : 'border-gray-200 bg-gray-50'
                                }`}
                            >
                              <div className="flex justify-between items-start">
                                <div className="flex-1">
                                  <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-lg ${isFullyPaid ? 'bg-green-100' :
                                      isOverdue ? 'bg-red-100' :
                                        isPartiallyPaid ? 'bg-yellow-100' : 'bg-gray-100'
                                      }`}>
                                      <FeeIcon className={
                                        isFullyPaid ? 'text-green-600' :
                                          isOverdue ? 'text-red-600' :
                                            isPartiallyPaid ? 'text-yellow-600' : 'text-gray-600'
                                      } />
                                    </div>
                                    <div>
                                      <p className="font-bold">{feeLabel}</p>
                                      <div className="flex items-center gap-2 mt-1">
                                        <FaCalendarAlt className="text-gray-400 text-sm" />
                                        <span className="text-sm text-gray-600">
                                          Due: {new Date(fee.dueDate).toLocaleDateString()}
                                        </span>
                                        {isOverdue && (
                                          <span className="text-xs text-red-600 bg-red-100 px-2 py-1 rounded">
                                            Overdue
                                          </span>
                                        )}
                                        {isPartiallyPaid && (
                                          <span className="text-xs text-yellow-600 bg-yellow-100 px-2 py-1 rounded">
                                            Partial
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  </div>

                                  {/* Progress bar for partial payments */}
                                  {isPartiallyPaid && (
                                    <div className="mt-3">
                                      <div className="flex justify-between text-sm mb-1">
                                        <span>Paid: ₹{paidAmount.toLocaleString()}</span>
                                        <span>Total: ₹{fee.amount.toLocaleString()}</span>
                                      </div>
                                      <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div
                                          className="bg-yellow-500 h-2 rounded-full"
                                          style={{ width: `${(paidAmount / fee.amount) * 100}%` }}
                                        ></div>
                                      </div>
                                    </div>
                                  )}
                                </div>

                                <div className="text-right ml-4">
                                  <p className="font-bold text-lg">₹{fee.amount.toLocaleString()}</p>
                                  <span className={`text-sm px-3 py-1 rounded-full font-medium ${isFullyPaid
                                    ? "bg-green-100 text-green-800"
                                    : isOverdue
                                      ? "bg-red-100 text-red-800"
                                      : isPartiallyPaid
                                        ? "bg-yellow-100 text-yellow-800"
                                        : "bg-gray-100 text-gray-800"
                                    }`}>
                                    {isFullyPaid ? 'PAID' :
                                      isOverdue ? 'OVERDUE' :
                                        isPartiallyPaid ? 'PARTIAL' : 'PENDING'}
                                  </span>
                                  {!isFullyPaid && (
                                    <p className="text-sm text-gray-600 mt-1">
                                      Balance: ₹{balance.toLocaleString()}
                                    </p>
                                  )}
                                </div>
                              </div>

                              {!isFullyPaid && (
                                <div className="mt-4 pt-4 border-t border-gray-200">
                                  <button
                                    onClick={() => simulateOnlinePayment(fee)}
                                    className="w-full py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 font-medium flex items-center justify-center gap-2"
                                  >
                                    <FaCreditCard />
                                    Pay ₹{balance.toLocaleString()} Now
                                  </button>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Payment History Tab */}
                  {activeTab === "payments" && (
                    <div className="space-y-6">
                      <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold text-gray-800">Payment History</h3>
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              const csvContent = "data:text/csv;charset=utf-8," +
                                "Date,Time,Fee Type,Semester,Amount,Method,Transaction ID,Processed By\n" +
                                feePayments.map(p =>
                                  `"${new Date(p.paymentDate).toLocaleDateString()}","${new Date(p.paymentDate).toLocaleTimeString()}","${FEE_TYPE_LABELS[p.feeType] || p.feeType}","${p.semester}","${p.amount}","${p.paymentMethod}","${p.transactionId}","${p.processedBy || 'System'}"`
                                ).join("\n");

                              const encodedUri = encodeURI(csvContent);
                              const link = document.createElement("a");
                              link.setAttribute("href", encodedUri);
                              link.setAttribute("download", `payment-history-${student?.rollNo}.csv`);
                              document.body.appendChild(link);
                              link.click();
                              document.body.removeChild(link);
                            }}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                          >
                            <FaDownload />
                            Export CSV
                          </button>
                        </div>
                      </div>

                      <div className="overflow-x-auto rounded-lg border border-gray-200">
                        <table className="w-full">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="p-4 text-left text-sm font-semibold text-gray-700">Date & Time</th>
                              <th className="p-4 text-left text-sm font-semibold text-gray-700">Fee Type</th>
                              <th className="p-4 text-left text-sm font-semibold text-gray-700">Semester</th>
                              <th className="p-4 text-left text-sm font-semibold text-gray-700">Amount</th>
                              <th className="p-4 text-left text-sm font-semibold text-gray-700">Method</th>
                              <th className="p-4 text-left text-sm font-semibold text-gray-700">Transaction ID</th>
                              <th className="p-4 text-left text-sm font-semibold text-gray-700">Receipt</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {feePayments.length === 0 ? (
                              <tr>
                                <td colSpan="7" className="p-8 text-center text-gray-500">
                                  No payment history found
                                </td>
                              </tr>
                            ) : (
                              feePayments.map((payment) => {
                                const FeeIcon = FEE_TYPE_ICONS[payment.feeType] || FaMoneyBillWave;
                                return (
                                  <tr key={payment.id} className="hover:bg-gray-50">
                                    <td className="p-4">
                                      <div>
                                        <p className="font-medium">
                                          {new Date(payment.paymentDate).toLocaleDateString()}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                          {new Date(payment.paymentDate).toLocaleTimeString()}
                                        </p>
                                      </div>
                                    </td>
                                    <td className="p-4">
                                      <div className="flex items-center gap-2">
                                        <FeeIcon className="text-blue-600 text-sm" />
                                        <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                                          {FEE_TYPE_LABELS[payment.feeType] || payment.feeType}
                                        </span>
                                      </div>
                                    </td>
                                    <td className="p-4">
                                      <span className="px-3 py-1 bg-indigo-100 text-indigo-800 text-xs rounded-full">
                                        Sem {payment.semester}
                                      </span>
                                    </td>
                                    <td className="p-4">
                                      <div className="font-bold text-green-600">
                                        ₹{(payment.amount || 0).toLocaleString()}
                                      </div>
                                    </td>
                                    <td className="p-4">
                                      <span className={`px-3 py-1 text-xs rounded-full font-medium ${payment.paymentMethod === 'cash'
                                        ? 'bg-yellow-100 text-yellow-800'
                                        : payment.paymentMethod === 'online'
                                          ? 'bg-green-100 text-green-800'
                                          : 'bg-blue-100 text-blue-800'
                                        }`}>
                                        {payment.paymentMethod}
                                      </span>
                                    </td>
                                    <td className="p-4">
                                      <p className="text-xs text-gray-500 font-mono truncate max-w-[120px]">
                                        {payment.transactionId}
                                      </p>
                                    </td>
                                    <td className="p-4">
                                      <button
                                        onClick={() => generateReceipt(payment)}
                                        className="text-blue-600 hover:text-blue-800 p-2"
                                        title="View/Print Receipt"
                                      >
                                        <FaPrint />
                                      </button>
                                    </td>
                                  </tr>
                                );
                              })
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* All Semesters Tab */}
                  {activeTab === "semesters" && (
                    <div className="space-y-6">
                      <h3 className="text-lg font-semibold text-gray-800">All Semester Fee Summary</h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {allSummaries.map((summary) => (
                          <div
                            key={summary.semester}
                            className={`p-4 border rounded-xl ${summary.isCurrent
                              ? 'border-blue-200 bg-blue-50'
                              : 'border-gray-200 bg-gray-50'
                              }`}
                          >
                            <div className="flex justify-between items-start mb-3">
                              <div>
                                <h4 className="font-bold text-gray-800">
                                  Semester {summary.semester}
                                  {summary.isCurrent && (
                                    <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                      Current
                                    </span>
                                  )}
                                </h4>
                                <p className="text-sm text-gray-600">
                                  Total Fee: ₹{summary.total.toLocaleString()}
                                </p>
                              </div>
                              <span className={`text-2xl font-bold ${summary.percentage === 100 ? 'text-green-600' :
                                summary.percentage > 50 ? 'text-yellow-600' : 'text-red-600'
                                }`}>
                                {summary.percentage}%
                              </span>
                            </div>

                            <div className="space-y-2">
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                  className={`h-2 rounded-full ${summary.percentage === 100 ? 'bg-green-600' :
                                    summary.percentage > 50 ? 'bg-yellow-500' : 'bg-red-500'
                                    }`}
                                  style={{ width: `${summary.percentage}%` }}
                                ></div>
                              </div>

                              <div className="grid grid-cols-2 gap-2 text-sm">
                                <div className="text-center">
                                  <p className="text-green-600">Paid</p>
                                  <p className="font-bold">₹{summary.paid.toLocaleString()}</p>
                                </div>
                                <div className="text-center">
                                  <p className="text-red-600">Pending</p>
                                  <p className="font-bold">₹{summary.pending.toLocaleString()}</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

             
             
            </div>

            {/* Right Column - Student Info & Quick Actions */}
            <div className="space-y-6">
              {/* Student Information Card */}
              <div className="bg-white rounded-xl shadow-lg p-5">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <FaUserGraduate className="text-blue-600" />
                  Student Information
                </h3>

                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <FaUserGraduate className="text-blue-600 text-xl" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">{student?.name}</p>
                      <p className="text-sm text-gray-600">Roll No: {student?.rollNo}</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Course</span>
                      <span className="font-medium">{student?.branch}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Current Semester</span>
                      <span className="font-bold text-blue-600">Sem {student?.semester}</span>
                    </div>
                    {student?.admissionDate && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Admission Date</span>
                        <span className="font-medium">
                          {new Date(student.admissionDate).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                    {student?.email && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Email</span>
                        <span className="font-medium truncate max-w-[150px]">{student.email}</span>
                      </div>
                    )}
                    {student?.phone && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Phone</span>
                        <span className="font-medium">{student.phone}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Quick Payment Actions */}
              <div className="bg-white rounded-xl shadow-lg p-5">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Payment</h3>

                <div className="space-y-3">
                  <button
                    onClick={payAllFeesCurrentSemester}
                    disabled={pendingFeesCurrent.length === 0 || payingAll}
                    className={`w-full py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-medium flex items-center justify-center gap-2 ${
                      pendingFeesCurrent.length === 0 || payingAll ? 'opacity-50 cursor-not-allowed' : 'hover:from-green-600 hover:to-green-700'
                    }`}
                  >
                    <FaCreditCard />
                    {payingAll ? 'Processing...' : 'Pay All Pending Fees'}
                  </button>

                  <div className="grid grid-cols-2 gap-2">
                    {pendingFeesCurrent.map(fee => {
                      const { balance } = getFeePaymentInfo(fee);
                      const FeeIcon = FEE_TYPE_ICONS[fee.feeType] || FaMoneyBillWave;
                      
                      return (
                        <button
                          key={`${fee.semester}-${fee.feeType}`}
                          onClick={() => simulateOnlinePayment(fee)}
                          className="py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm flex items-center justify-center gap-2"
                        >
                          <FeeIcon />
                          {FEE_TYPE_LABELS[fee.feeType]?.split(' ')[0]} ₹{balance}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white rounded-xl shadow-lg p-5">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Activity</h3>

                <div className="space-y-3">
                  {recentActivity.length === 0 ? (
                    <div className="text-center py-4 text-gray-500">
                      <p>No recent activity</p>
                    </div>
                  ) : (
                    recentActivity.map(activity => {
                      const Icon = activity.icon;
                      return (
                        <div key={activity.id} className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-lg">
                          <div className={`p-2 ${activity.color} bg-opacity-20 rounded-lg`}>
                            <Icon className={activity.color} />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium">{activity.title}</p>
                            <p className="text-sm text-gray-600">{activity.description}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              {new Date(activity.date).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Important Notes */}
              <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-xl p-5 border border-yellow-200">
                <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <FaInfoCircle className="text-yellow-600" />
                  Important Notes
                </h3>

                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start gap-2">
                    <div className="p-1 bg-green-100 rounded mt-1">
                      <FaCheck className="text-green-600 text-xs" />
                      
                    </div>
                    <span>All online payments are secured with SSL encryption</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="p-1 bg-blue-100 rounded mt-1">
                      <FaCreditCard className="text-blue-600 text-xs" />
                    </div>
                    <span>You can pay via UPI, Net Banking, or Credit/Debit cards</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="p-1 bg-red-100 rounded mt-1">
                      <FaCalendarAlt className="text-red-600 text-xs" />
                    </div>
                    <span>Late fee penalty: ₹50 per day after due date</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="p-1 bg-purple-100 rounded mt-1">
                      <FaPrint className="text-purple-600 text-xs" />
                    </div>
                    <span>Always download and save payment receipts</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* FOOTER NOTES */}
          <div className="bg-white rounded-xl shadow-lg p-5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="font-medium text-blue-800">Need Help?</p>
                <p className="text-sm text-blue-600 mt-1">
                  Contact Accounts Department: accounts@university.edu
                </p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <p className="font-medium text-green-800">Payment Deadline</p>
                <p className="text-sm text-green-600 mt-1">
                  Current semester fees due by: {new Date(new Date().setMonth(new Date().getMonth() + 2)).toLocaleDateString()}
                </p>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg">
                <p className="font-medium text-purple-800">Receipts & Records</p>
                <p className="text-sm text-purple-600 mt-1">
                  All payments are recorded. Download receipts from Payment History.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}