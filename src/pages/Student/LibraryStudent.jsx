import React, { useEffect, useState, useCallback } from "react";
import { db } from "../../db/firebaseConfig";
import { 
  collection, 
  getDocs, 
  query, 
  where, 
  orderBy,
  Timestamp 
} from "firebase/firestore";
import { useAuth } from "../../auth/authProvider";
import Layout from "../../components/Layout";
import { 
  FaBook, 
  FaSearch, 
  FaExclamationCircle, 
  FaCalendarAlt,
  FaClock,
  FaCheckCircle,
  FaUserTie,
  FaHistory,
  FaSpinner,
  FaUserGraduate,
  FaBookOpen,
  FaRegCalendarCheck,
  FaMoneyBillWave
} from "react-icons/fa";

export default function LibraryStudent() {
  const { user } = useAuth();
  const [books, setBooks] = useState([]);
  const [issuedBooks, setIssuedBooks] = useState([]);
  const [returnedBooks, setReturnedBooks] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState({
    books: false,
    issued: false,
    returned: false,
  });
  const [student, setStudent] = useState(null);
  const [activeTab, setActiveTab] = useState("available"); // 'available', 'issued', 'history'

  useEffect(() => {
    if (user?.uid) {
      fetchStudentData();
      fetchAllData();
    }
  }, [user]);

  /* ================= FETCH STUDENT DATA ================= */
  const fetchStudentData = async () => {
    try {
      const q = query(
        collection(db, "students"),
        where("uid", "==", user.uid)
      );
      const snap = await getDocs(q);
      if (!snap.empty) {
        const studentData = snap.docs[0].data();
        setStudent({
          docId: snap.docs[0].id,
          ...studentData
        });
      }
    } catch (error) {
      console.error("Fetch student error:", error);
    }
  };

  /* ================= FETCH ALL DATA ================= */
  const fetchAllData = useCallback(async () => {
    setLoading({ books: true, issued: true, returned: true });
    try {
      await Promise.all([
        fetchBooks(),
        fetchIssuedBooks(),
        fetchReturnedBooks()
      ]);
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setLoading({ books: false, issued: false, returned: false });
    }
  }, [user]);

  /* ================= FETCH BOOKS ================= */
  const fetchBooks = async () => {
    try {
      const booksQuery = query(
        collection(db, "books"),
        orderBy("title", "asc")
      );
      const snap = await getDocs(booksQuery);
      setBooks(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (error) {
      throw error;
    }
  };

  /* ================= FETCH ISSUED BOOKS ================= */
  const fetchIssuedBooks = async () => {
    if (!user?.uid) return;
    
    try {
      // First get student roll number
      const studentQuery = query(
        collection(db, "students"),
        where("uid", "==", user.uid)
      );
      const studentSnap = await getDocs(studentQuery);
      
      if (studentSnap.empty) {
        setIssuedBooks([]);
        return;
      }
      
      const studentData = studentSnap.docs[0].data();
      const studentRollNo = studentData.rollNo;
      
      // Now query issued books using studentRollNo
      const q = query(
        collection(db, "issued_books"),
        where("studentRollNo", "==", studentRollNo),
        where("status", "==", "issued"),
      );
      
      const snap = await getDocs(q);
      const issuedData = snap.docs.map(d => ({ 
        id: d.id, 
        ...d.data(),
        // Ensure dates are properly handled
        issueDate: d.data().issueDate?.toDate ? d.data().issueDate.toDate() : new Date(d.data().issueDate),
        dueDate: d.data().dueDate?.toDate ? d.data().dueDate.toDate() : new Date(d.data().dueDate)
      }));
      
      setIssuedBooks(issuedData);
    } catch (error) {
      console.error("Fetch issued books error:", error);
      setIssuedBooks([]);
    }
  };

  /* ================= FETCH RETURNED BOOKS ================= */
  const fetchReturnedBooks = async () => {
    if (!user?.uid) return;
    
    try {
      // Get student roll number
      const studentQuery = query(
        collection(db, "students"),
        where("uid", "==", user.uid)
      );
      const studentSnap = await getDocs(studentQuery);
      
      if (studentSnap.empty) {
        setReturnedBooks([]);
        return;
      }
      
      const studentData = studentSnap.docs[0].data();
      const studentRollNo = studentData.rollNo;
      
      // Query returned books
      const q = query(
        collection(db, "issued_books"),
        where("studentRollNo", "==", studentRollNo),
        where("status", "==", "returned"),
        orderBy("returnDate", "desc")
      );
      
      const snap = await getDocs(q);
      const returnedData = snap.docs.map(d => ({ 
        id: d.id, 
        ...d.data(),
        issueDate: d.data().issueDate?.toDate ? d.data().issueDate.toDate() : new Date(d.data().issueDate),
        dueDate: d.data().dueDate?.toDate ? d.data().dueDate.toDate() : new Date(d.data().dueDate),
        returnDate: d.data().returnDate?.toDate ? d.data().returnDate.toDate() : new Date(d.data().returnDate)
      }));
      
      setReturnedBooks(returnedData);
    } catch (error) {
      console.error("Fetch returned books error:", error);
      setReturnedBooks([]);
    }
  };

  /* ================= FILTER BOOKS ================= */
  const filteredBooks = books.filter(b =>
    b.title?.toLowerCase().includes(search.toLowerCase()) ||
    b.branch?.toLowerCase().includes(search.toLowerCase()) ||
    b.description?.toLowerCase().includes(search.toLowerCase())
  );

  const filteredIssuedBooks = issuedBooks.filter(b =>
    b.bookTitle?.toLowerCase().includes(search.toLowerCase()) ||
    b.teacherName?.toLowerCase().includes(search.toLowerCase())
  );

  const filteredReturnedBooks = returnedBooks.filter(b =>
    b.bookTitle?.toLowerCase().includes(search.toLowerCase()) ||
    b.teacherName?.toLowerCase().includes(search.toLowerCase())
  );

  /* ================= STATS ================= */
  const currentIssuedCount = issuedBooks.length;
  const overdueBooks = issuedBooks.filter(b => {
    const dueDate = b.dueDate;
    return dueDate < new Date();
  }).length;
  const totalBooksRead = returnedBooks.length;

  /* ================= HELPER FUNCTIONS ================= */
  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const calculateDaysRemaining = (dueDate) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const calculateOverdueDays = (dueDate) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = today - due;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const calculateFine = (issuedBook) => {
    if (issuedBook.status === "returned" || issuedBook.fine === 0) {
      return 0;
    }
    
    const dueDate = new Date(issuedBook.dueDate);
    const today = new Date();
    
    if (today <= dueDate) return 0;
    
    const overdueDays = Math.ceil((today - dueDate) / (1000 * 60 * 60 * 24));
    const finePerDay = 5; // ₹5 per day
    return overdueDays * finePerDay;
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4 md:p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* ================= HEADER ================= */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800 flex items-center gap-3">
                <FaBook className="text-blue-600" />
                My Library
              </h1>
              <p className="text-gray-600 text-sm mt-1">
                Welcome back, {student?.name || user?.email}
                {student?.rollNo && (
                  <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full">
                    Roll No: {student.rollNo}
                  </span>
                )}
              </p>
            </div>

            <div className="relative">
              <FaSearch className="absolute left-3 top-3 text-gray-400" />
              <input
                placeholder="Search books..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full md:w-64 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>

          {/* ================= STATS CARDS ================= */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl shadow p-4 border-l-4 border-blue-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Currently Issued</p>
                  <p className="text-2xl font-bold">{currentIssuedCount}</p>
                  <p className="text-xs text-gray-400 mt-1">Books with you</p>
                </div>
                <FaBookOpen className="text-blue-500 text-2xl" />
              </div>
            </div>
            <div className="bg-white rounded-xl shadow p-4 border-l-4 border-red-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Overdue Books</p>
                  <p className="text-2xl font-bold">{overdueBooks}</p>
                  <p className="text-xs text-gray-400 mt-1">Require attention</p>
                </div>
                <FaExclamationCircle className="text-red-500 text-2xl" />
              </div>
            </div>
            <div className="bg-white rounded-xl shadow p-4 border-l-4 border-green-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Books Read</p>
                  <p className="text-2xl font-bold">{totalBooksRead}</p>
                  <p className="text-xs text-gray-400 mt-1">Successfully returned</p>
                </div>
                <FaHistory className="text-green-500 text-2xl" />
              </div>
            </div>
          </div>

          {/* ================= TABS ================= */}
          <div className="flex space-x-1 bg-white rounded-xl shadow p-1">
            <button
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${activeTab === "available" 
                ? "bg-blue-100 text-blue-700" 
                : "text-gray-600 hover:text-gray-800"}`}
              onClick={() => setActiveTab("available")}
            >
              <FaBook />
              Available Books
            </button>
            <button
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${activeTab === "issued" 
                ? "bg-blue-100 text-blue-700" 
                : "text-gray-600 hover:text-gray-800"}`}
              onClick={() => setActiveTab("issued")}
            >
              <FaClock />
              Issued Books ({issuedBooks.length})
            </button>
            <button
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${activeTab === "history" 
                ? "bg-blue-100 text-blue-700" 
                : "text-gray-600 hover:text-gray-800"}`}
              onClick={() => setActiveTab("history")}
            >
              <FaHistory />
              History
            </button>
          </div>

          {/* ================= ISSUED BOOKS TAB ================= */}
          {activeTab === "issued" && (
            <div className="bg-white rounded-xl shadow overflow-hidden">
              <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <FaClock className="text-blue-500" />
                  Currently Issued Books
                </h2>
                <div className="flex items-center gap-2">
                  {loading.issued && <FaSpinner className="animate-spin text-blue-500" />}
                  {overdueBooks > 0 && (
                    <span className="text-sm text-red-600 bg-red-50 px-3 py-1 rounded-full">
                      {overdueBooks} overdue
                    </span>
                  )}
                </div>
              </div>
              
              {filteredIssuedBooks.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <FaBook className="text-4xl mx-auto mb-3 text-gray-300" />
                  <p className="text-lg">No books currently issued</p>
                  <p className="text-sm mt-1">Visit the library to issue books</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Book Details
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Issue Info
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Fine
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredIssuedBooks.map((book) => {
                        const isOverdue = new Date(book.dueDate) < new Date();
                        const daysRemaining = calculateDaysRemaining(book.dueDate);
                        const overdueDays = calculateOverdueDays(book.dueDate);
                        const fineAmount = calculateFine(book);
                        
                        return (
                          <tr key={book.id} className={isOverdue ? "bg-red-50" : "hover:bg-gray-50"}>
                            <td className="px-4 py-3">
                              <div>
                                <p className="font-medium text-gray-900">{book.bookTitle}</p>
                                <div className="mt-1 flex items-center gap-2">
                                  <FaUserTie className="text-gray-400 text-xs" />
                                  <span className="text-sm text-gray-500">
                                    Issued by: {book.teacherName}
                                  </span>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="space-y-2">
                                <div className="flex items-center gap-2 text-sm">
                                  <FaCalendarAlt className="text-gray-400" />
                                  <span>Issued: {formatDate(book.issueDate)}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                  <FaCalendarAlt className={isOverdue ? "text-red-400" : "text-gray-400"} />
                                  <span className={isOverdue ? "text-red-600 font-medium" : "text-gray-600"}>
                                    Due: {formatDate(book.dueDate)}
                                  </span>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex flex-col gap-1">
                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                                  isOverdue
                                    ? "bg-red-100 text-red-800"
                                    : "bg-green-100 text-green-800"
                                }`}>
                                  {isOverdue ? (
                                    <>
                                      <FaExclamationCircle className="mr-1" />
                                      Overdue ({overdueDays} days)
                                    </>
                                  ) : (
                                    <>
                                      <FaClock className="mr-1" />
                                      {daysRemaining} days left
                                    </>
                                  )}
                                </span>
                                {book.renewalCount > 0 && (
                                  <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                                    Renewed {book.renewalCount} time(s)
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <FaMoneyBillWave className={fineAmount > 0 ? "text-red-500" : "text-green-500"} />
                                <span className={`font-bold ${fineAmount > 0 ? "text-red-600" : "text-green-600"}`}>
                                  ₹{fineAmount}
                                </span>
                              </div>
                              {fineAmount > 0 && (
                                <p className="text-xs text-red-500 mt-1">
                                  Pay at library desk
                                </p>
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
          )}

          {/* ================= AVAILABLE BOOKS TAB ================= */}
          {activeTab === "available" && (
            <div className="bg-white rounded-xl shadow overflow-hidden">
              <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <FaBook className="text-green-500" />
                  Available Books in Library
                </h2>
                <div className="flex items-center gap-2">
                  {loading.books && <FaSpinner className="animate-spin text-blue-500" />}
                  <span className="text-sm text-gray-500">
                    {filteredBooks.filter(b => b.availableQuantity > 0).length} available
                  </span>
                </div>
              </div>
              
              {filteredBooks.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <FaBook className="text-4xl mx-auto mb-3 text-gray-300" />
                  <p className="text-lg">No books found</p>
                  <p className="text-sm mt-1">Try a different search term</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Book Details
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Branch/Year
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Inventory
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredBooks.map(book => (
                        <tr key={book.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3">
                            <div>
                              <p className="font-medium text-gray-900">{book.title}</p>
                              {book.description && (
                                <p className="text-sm text-gray-500 truncate max-w-xs">
                                  {book.description}
                                </p>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="space-y-1">
                              {book.branch && (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                  {book.branch}
                                </span>
                              )}
                              {(book.year || book.semester) && (
                                <div className="text-xs text-gray-500">
                                  {book.year && `Year ${book.year}`}
                                  {book.year && book.semester && ' • '}
                                  {book.semester && `Sem ${book.semester}`}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex flex-col gap-2">
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-500">Available:</span>
                                <span className={`font-semibold ${
                                  book.availableQuantity === 0 
                                    ? "text-red-600" 
                                    : "text-green-600"
                                }`}>
                                  {book.availableQuantity || 0}
                                </span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-500">Total:</span>
                                <span>{book.totalQuantity || 0}</span>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                              book.availableQuantity === 0 
                                ? "bg-red-100 text-red-800"
                                : "bg-green-100 text-green-800"
                            }`}>
                              {book.availableQuantity === 0 ? "Not Available" : "Available"}
                            </span>
                            {book.availableQuantity <= 2 && book.availableQuantity > 0 && (
                              <p className="text-xs text-yellow-600 mt-1">Limited copies</p>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ================= HISTORY TAB ================= */}
          {activeTab === "history" && (
            <div className="bg-white rounded-xl shadow overflow-hidden">
              <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <FaHistory className="text-green-500" />
                  Returned Books History
                </h2>
                <div className="flex items-center gap-2">
                  {loading.returned && <FaSpinner className="animate-spin text-blue-500" />}
                  <span className="text-sm text-gray-500">
                    {filteredReturnedBooks.length} books returned
                  </span>
                </div>
              </div>
              
              {filteredReturnedBooks.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <FaHistory className="text-4xl mx-auto mb-3 text-gray-300" />
                  <p className="text-lg">No history yet</p>
                  <p className="text-sm mt-1">Returned books will appear here</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Book Details
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Issue & Return
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Issued By
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredReturnedBooks.map(book => (
                        <tr key={book.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3">
                            <div>
                              <p className="font-medium text-gray-900">{book.bookTitle}</p>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="space-y-2">
                              <div className="flex items-center gap-2 text-sm">
                                <FaCalendarAlt className="text-gray-400" />
                                <span>Issued: {formatDate(book.issueDate)}</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm">
                                <FaRegCalendarCheck className="text-green-400" />
                                <span className="text-gray-600">
                                  Returned: {formatDate(book.returnDate)}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <FaUserTie className="text-gray-400" />
                              <span className="text-sm text-gray-600">
                                {book.teacherName}
                              </span>
                            </div>
                            <p className="text-xs text-gray-400 mt-1">
                              ID: {book.teacherId}
                            </p>
                          </td>
                          <td className="px-4 py-3">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              <FaCheckCircle className="mr-1" />
                              Returned
                            </span>
                            {book.fine > 0 && (
                              <p className="text-xs text-gray-500 mt-1">
                                Fine paid: ₹{book.fine}
                              </p>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ================= QUICK ACTIONS ================= */}
          <div className="bg-white rounded-xl shadow p-4">
            <h3 className="font-semibold text-gray-800 mb-3">Library Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-600">Student Information</p>
                <div className="mt-1 space-y-1">
                  <p className="font-medium">{student?.name || user?.email}</p>
                  <div className="flex flex-wrap gap-2">
                    {student?.rollNo && (
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        Roll: {student.rollNo}
                      </span>
                    )}
                    {student?.branch && (
                      <span className="text-xs bg-indigo-100 text-indigo-800 px-2 py-1 rounded">
                        {student.branch}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <p className="text-sm text-gray-600">Library Rules</p>
                <ul className="text-xs text-gray-600 mt-1 space-y-1">
                  <li>• Maximum 5 books can be issued</li>
                  <li>• Book return period: 30 days</li>
                  <li>• Fine: ₹5 per day after due date</li>
                  <li>• Books can be renewed once</li>
                </ul>
              </div>
            </div>
          </div>

        </div>
      </div>
    </Layout>
  );
}