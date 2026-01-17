import React, { useEffect, useState, useCallback, useRef } from "react";
import { db } from "../../db/firebaseConfig";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  increment,
  serverTimestamp,
  query,
  where,
  orderBy,
  getDoc,
  deleteDoc,
} from "firebase/firestore";
import Layout from "../../components/Layout";
import { useAuth } from "../../auth/authProvider";
import { toast } from "react-toastify";
import {
  FaSearch,
  FaBookReader,
  FaUserGraduate,
  FaBook,
  FaCalendarAlt,
  FaCheckCircle,
  FaSpinner,
  FaExclamationTriangle,
  FaTimes,
  FaUser,
  FaIdCard,
  FaUserTie
} from "react-icons/fa";

export default function LibraryTeacher() {
  const { user } = useAuth();

  const [books, setBooks] = useState([]);
  const [students, setStudents] = useState([]);
  const [issuedBooks, setIssuedBooks] = useState([]);
  const [teacher, setTeacher] = useState(null);
  const [search, setSearch] = useState("");
  const [selectedStudent, setSelectedStudent] = useState("");
  const [loading, setLoading] = useState({
    books: false,
    students: false,
    issuedBooks: false,
    issuing: false,
    teacher: false,
  });
  const [activeTab, setActiveTab] = useState("issue");

  const [studentSearch, setStudentSearch] = useState("");
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [selectedStudentObj, setSelectedStudentObj] = useState(null);
  const [showStudentDropdown, setShowStudentDropdown] = useState(false);
  const [issuedSearch, setIssuedSearch] = useState("");


  const studentDropdownRef = useRef(null);
  const studentInputRef = useRef(null);

  useEffect(() => {
    if (user) {
      fetchAllData();
      fetchTeacherData();
    }
  }, [user]);

  /* ================= FETCH TEACHER DATA ================= */
  const fetchTeacherData = useCallback(async () => {
    if (!user) return;

    setLoading(prev => ({ ...prev, teacher: true }));
    try {
      const teacherQuery = query(
        collection(db, "teachers"),
        where("uid", "==", user.uid)
      );
      const snap = await getDocs(teacherQuery);
      if (!snap.empty) {
        const teacherData = snap.docs[0].data();
        setTeacher({
          docId: snap.docs[0].id,
          ...teacherData
        });
      }
    } catch (error) {
      console.error("Fetch teacher error:", error);
    } finally {
      setLoading(prev => ({ ...prev, teacher: false }));
    }
  }, [user]);

  /* ================= DATA FETCHING ================= */
  const fetchAllData = useCallback(async () => {
    setLoading({ books: true, students: true, issuedBooks: true, issuing: false, teacher: false });
    try {
      await Promise.all([fetchBooks(), fetchStudents(), fetchIssuedBooks()]);
    } catch (error) {
      toast.error("Failed to load data");
      console.error("Fetch error:", error);
    } finally {
      setLoading({ books: false, students: false, issuedBooks: false, issuing: false, teacher: false });
    }
  }, [user]);

  const fetchBooks = async () => {
    try {
      const booksQuery = query(
        collection(db, "books"),
        orderBy("title", "asc")
      );
      const snap = await getDocs(booksQuery);
      setBooks(snap.docs.map(d => ({ docId: d.id, ...d.data() })));
    } catch (error) {
      throw error;
    }
  };

  const fetchStudents = async () => {
    try {
      const snap = await getDocs(collection(db, "students"));
      const studentsData = snap.docs.map(d => ({ docId: d.id, ...d.data() }));
      studentsData.sort((a, b) => a.name.localeCompare(b.name));
      setStudents(studentsData);
    } catch (error) {
      throw error;
    }
  };

  const fetchIssuedBooks = async () => {
    if (!teacher) return;

    try {
      // Using teacher.id as the key to filter issued books
      const issuedQuery = query(
        collection(db, "issued_books"),
        where("teacherId", "==", teacher.id),
        where("status", "==", "issued"),
      );
      const snap = await getDocs(issuedQuery);
      setIssuedBooks(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (error) {
      throw error;
    }
  };

  // Re-fetch issued books when teacher data is loaded
  useEffect(() => {
    if (teacher) {
      fetchIssuedBooks();
    }
  }, [teacher]);

  /* ================= STUDENT SEARCH ================= */
  useEffect(() => {
    if (!studentSearch.trim()) {
      setFilteredStudents([]);
      setShowStudentDropdown(false);
      return;
    }

    const term = studentSearch.toLowerCase();
    const matches = students.filter(s =>
      s.rollNo?.toLowerCase().includes(term) ||
      s.name?.toLowerCase().includes(term) ||
      s.email?.toLowerCase().includes(term)
    );

    setFilteredStudents(matches.slice(0, 8));
    setShowStudentDropdown(matches.length > 0);
  }, [studentSearch, students]);

  const handleSelectStudent = (student) => {
    setSelectedStudent(student.docId);
    setSelectedStudentObj(student);
    setIssuedSearch(student);
    setStudentSearch(`${student.name} (${student.rollNo})`);
    setShowStudentDropdown(false);
    toast.info(`Selected: ${student.name}`);
  };

  const clearSelectedStudent = () => {
    setSelectedStudent("");
    setSelectedStudentObj(null);
    setStudentSearch("");
    setShowStudentDropdown(false);
  };

  /* ================= BOOK ISSUANCE ================= */
  const issueBook = async (book) => {
    if (!selectedStudent) {
      toast.error("Please select a student first");
      return;
    }

    if (!teacher) {
      toast.error("Teacher information not available");
      return;
    }

    if (book.availableQuantity <= 0) {
      toast.error("No copies available for issue");
      return;
    }

    const student = selectedStudentObj || students.find(s => s.docId === selectedStudent);
    if (!student) {
      toast.error("Selected student not found");
      return;
    }

    // Check if student has already borrowed this book
    const alreadyIssued = issuedBooks.find(
      ib => ib.studentRollNo === student.rollNo && ib.bookId === book.docId && ib.status === "issued"
    );

    if (alreadyIssued) {
      toast.error(`${student.name} has already borrowed "${book.title}"`);
      return;
    }

    // Check if student has reached borrow limit
    const studentIssuedBooks = issuedBooks.filter(
      ib => ib.studentRollNo === student.rollNo && ib.status === "issued"
    );

    if (studentIssuedBooks.length >= 5) {
      toast.error(`${student.name} has reached the maximum limit of 5 books`);
      return;
    }

    setLoading(prev => ({ ...prev, issuing: true }));

    try {
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 30);

      // Create issued book record with new structure
      await addDoc(collection(db, "issued_books"), {
        bookId: book.docId,
        bookTitle: book.title,

        // ✅ STUDENT INFORMATION
        studentRollNo: student.rollNo,     // 🔥 MAIN KEY
        studentName: student.name,
        studentBranch: student.branch || student.course || "N/A",

        // ✅ TEACHER INFORMATION  
        teacherId: teacher.id,             // 🔥 MAIN KEY
        teacherName: teacher.name,
        teacherUid: user.uid,
        teacherEmail: user.email,

        // ✅ ISSUANCE DETAILS
        issueDate: new Date(),
        dueDate: dueDate,
        returnDate: null,
        status: "issued",
        fine: 0,
        renewalCount: 0,

        createdAt: serverTimestamp(),
      });

      // Update book quantities
      await updateDoc(doc(db, "books", book.docId), {
        issuedQuantity: increment(1),
        availableQuantity: increment(-1),
        lastIssuedAt: serverTimestamp(),
      });

      toast.success(
        <div className="space-y-1">
          <div className="font-semibold">✓ Book Issued Successfully!</div>
          <div className="text-sm">{book.title}</div>
          <div className="text-sm">→ Issued to: {student.name} ({student.rollNo})</div>
          <div className="text-sm">→ Issued by: {teacher.name}</div>
          <div className="text-xs text-gray-600">Due: {dueDate.toLocaleDateString()}</div>
        </div>
      );

      // Refresh data
      await Promise.all([fetchBooks(), fetchIssuedBooks()]);
      clearSelectedStudent();
    } catch (error) {
      toast.error("Failed to issue book");
      console.error("Issue book error:", error);
    } finally {
      setLoading(prev => ({ ...prev, issuing: false }));
    }
  };

  /* ================= BOOK RETURN ================= */
  const returnBook = async (issuedBook) => {
    if (!window.confirm(`Return "${issuedBook.bookTitle}" from ${issuedBook.studentName}?`)) {
      return;
    }

    try {
      // Update issued book record
      await deleteDoc(doc(db, "issued_books", issuedBook.id));

      // Update book quantities
      await updateDoc(doc(db, "books", issuedBook.bookId), {
        issuedQuantity: increment(-1),
        availableQuantity: increment(1),
      });

      toast.success(`"${issuedBook.bookTitle}" returned successfully`);
      fetchIssuedBooks();
      fetchBooks();
    } catch (error) {
      toast.error("Failed to return book");
      console.error("Return book error:", error);
    }
  };

  /* ================= BOOK RENEWAL ================= */
  const renewBook = async (issuedBook) => {
    if (!window.confirm(`Renew "${issuedBook.bookTitle}" for ${issuedBook.studentName}?`)) {
      return;
    }

    try {
      const newDueDate = new Date(issuedBook.dueDate?.toDate?.() || issuedBook.dueDate);
      newDueDate.setDate(newDueDate.getDate() + 30);

      await updateDoc(doc(db, "issued_books", issuedBook.id), {
        dueDate: newDueDate,
        renewalCount: increment(1),
        updatedAt: serverTimestamp(),
      });

      toast.success(`Book renewed until ${newDueDate.toLocaleDateString()}`);
      fetchIssuedBooks();
    } catch (error) {
      toast.error("Failed to renew book");
      console.error("Renew book error:", error);
    }
  };

  /* ================= FILTERING ================= */
  const filteredBooks = books.filter(b =>
    b.title.toLowerCase().includes(search.toLowerCase()) ||
    b.branch?.toLowerCase().includes(search.toLowerCase()) ||
    b.description?.toLowerCase().includes(search.toLowerCase())
  );

const filteredIssuedBooks = issuedBooks.filter(ib => {
  if (!issuedSearch.trim()) return true;
  
  const searchTerm = issuedSearch.toLowerCase().trim();
  
  return (
    (ib.bookTitle && ib.bookTitle.toLowerCase().includes(searchTerm)) ||
    (ib.studentName && ib.studentName.toLowerCase().includes(searchTerm)) ||
    (ib.studentRollNo && ib.studentRollNo.toLowerCase().includes(searchTerm)) ||
    (ib.studentBranch && ib.studentBranch.toLowerCase().includes(searchTerm))
  );
});




  /* ================= STATS ================= */
  const availableBooksCount = books.reduce((sum, book) => sum + (book.availableQuantity || 0), 0);
  const currentlyIssuedCount = issuedBooks.length;
  const overdueBooks = issuedBooks.filter(ib => {
    const dueDate = ib.dueDate?.toDate ? ib.dueDate.toDate() : new Date(ib.dueDate);
    return dueDate < new Date();
  }).length;

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4 md:p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* ================= HEADER ================= */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800 flex items-center gap-3">
                <FaBookReader className="text-blue-600" />
                Librarian Dashboard
              </h1>
              <p className="text-gray-600 text-sm mt-1">
                Welcome, {teacher?.name || user?.email}
                <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full">
                  ID: {teacher?.id || "N/A"}
                </span>
              </p>
            </div>

            <div className="relative">
              <FaSearch className="absolute left-3 top-3 text-gray-400" />
              <input
                placeholder="Search books or students..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full md:w-64 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>

          {/* ================= TEACHER CARD ================= */}
          {teacher && (
            <div className="bg-white rounded-xl shadow p-4 border-l-4 border-blue-500">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <FaUserTie className="text-blue-600 text-xl" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800">{teacher.name}</h3>
                    <div className="flex flex-wrap gap-2 mt-1">
                      <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        ID: {teacher.id}
                      </span>
                      <span className="text-sm bg-gray-100 text-gray-800 px-2 py-1 rounded">
                        {teacher.department || "No Department"}
                      </span>
                      <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded">
                        Books Issued: {currentlyIssuedCount}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Librarian Status</p>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${teacher.isLibrarian
                      ? "bg-green-100 text-green-800"
                      : "bg-yellow-100 text-yellow-800"
                    }`}>
                    {teacher.isLibrarian ? "Active Librarian" : "Teacher Only"}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* ================= STATS CARDS ================= */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl shadow p-4 border-l-4 border-green-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Available Books</p>
                  <p className="text-2xl font-bold">{availableBooksCount}</p>
                  <p className="text-xs text-gray-400 mt-1">Ready to issue</p>
                </div>
                <FaBook className="text-green-500 text-2xl" />
              </div>
            </div>
            <div className="bg-white rounded-xl shadow p-4 border-l-4 border-blue-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Currently Issued</p>
                  <p className="text-2xl font-bold">{currentlyIssuedCount}</p>
                  <p className="text-xs text-gray-400 mt-1">By you</p>
                </div>
                <FaBookReader className="text-blue-500 text-2xl" />
              </div>
            </div>
            <div className="bg-white rounded-xl shadow p-4 border-l-4 border-red-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Overdue Books</p>
                  <p className="text-2xl font-bold">{overdueBooks}</p>
                  <p className="text-xs text-gray-400 mt-1">Require attention</p>
                </div>
                <FaExclamationTriangle className="text-red-500 text-2xl" />
              </div>
            </div>
          </div>

          {/* ================= TABS ================= */}
          <div className="flex space-x-1 bg-white rounded-xl shadow p-1">
            <button
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${activeTab === "issue"
                ? "bg-blue-100 text-blue-700"
                : "text-gray-600 hover:text-gray-800"}`}
              onClick={() => setActiveTab("issue")}
            >
              <FaBook />
              Issue Books
            </button>
            <button
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${activeTab === "issued"
                ? "bg-blue-100 text-blue-700"
                : "text-gray-600 hover:text-gray-800"}`}
              onClick={() => setActiveTab("issued")}
            >
              <FaBookReader />
              Issued Books ({issuedBooks.length})
            </button>
          </div>

          {/* ================= QUICK ACTIONS ================= */}
          <div className="bg-white rounded-xl shadow p-4">
            <h3 className="font-semibold text-gray-800 mb-3">Quick Actions</h3>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={fetchAllData}
                disabled={loading.books || loading.students}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                <FaSpinner className={loading.books ? "animate-spin" : ""} />
                Refresh Data
              </button>
              <button
                onClick={() => setActiveTab("issue")}
                className="px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg font-medium transition-colors"
              >
                Issue New Book
              </button>
              <button
                onClick={() => {
                  setSearch("");
                  clearSelectedStudent();
                }}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg font-medium transition-colors"
              >
                Clear All
              </button>
            </div>
          </div>

          {/* ================= STUDENT SELECTION ================= */}
          {activeTab === "issue" && (
            <div className="bg-white rounded-xl shadow p-5 relative">
              <div className="flex items-center justify-between mb-4">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <FaUserGraduate />
                  Select Student
                </label>
                {students.length > 0 && (
                  <span className="text-xs text-gray-500">
                    {students.length} students registered
                  </span>
                )}
              </div>

              <div className="relative">
                <div className="flex items-center">
                  <FaSearch className="absolute left-3 text-gray-400" />
                  <input
                    ref={studentInputRef}
                    type="text"
                    placeholder="Search by roll number, name, or email..."
                    value={studentSearch}
                    onChange={e => {
                      setStudentSearch(e.target.value);
                      if (e.target.value.trim()) {
                        setShowStudentDropdown(true);
                      }
                    }}
                    onFocus={() => {
                      if (studentSearch.trim() && filteredStudents.length > 0) {
                        setShowStudentDropdown(true);
                      }
                    }}
                    className="w-full pl-10 pr-10 border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {studentSearch && (
                    <button
                      onClick={clearSelectedStudent}
                      className="absolute right-3 text-gray-400 hover:text-gray-600"
                    >
                      <FaTimes />
                    </button>
                  )}
                </div>

                {/* Student Search Results Dropdown */}
                {showStudentDropdown && filteredStudents.length > 0 && (
                  <div
                    ref={studentDropdownRef}
                    className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-64 overflow-y-auto"
                  >
                    {filteredStudents.map(student => (
                      <div
                        key={student.docId}
                        onClick={() => handleSelectStudent(student)}
                        className="px-4 py-3 cursor-pointer hover:bg-blue-50 border-b last:border-b-0 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-900">{student.name}</p>
                            <div className="flex items-center gap-4 mt-1">
                              <span className="text-sm text-gray-600 flex items-center gap-1">
                                <FaIdCard />
                                {student.rollNo}
                              </span>
                              <span className="text-sm text-gray-500">{student.branch || student.course}</span>
                            </div>
                          </div>
                          <div className="text-xs px-2 py-1 bg-gray-100 rounded">
                            {issuedBooks.filter(ib => ib.studentRollNo === student.rollNo).length}/5 books
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* No Results Message */}
                {showStudentDropdown && studentSearch.trim() && filteredStudents.length === 0 && (
                  <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg p-4">
                    <p className="text-gray-500 text-center">No students found</p>
                  </div>
                )}
              </div>

              {/* Selected Student Card */}
              {selectedStudentObj && (
                <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <FaUser className="text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-bold text-blue-900">{selectedStudentObj.name}</h3>
                          <div className="flex flex-wrap gap-3 mt-1">
                            <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                              Roll: {selectedStudentObj.rollNo}
                            </span>
                            <span className="text-sm bg-indigo-100 text-indigo-800 px-2 py-1 rounded">
                              {selectedStudentObj.branch || selectedStudentObj.course || "No Branch"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={clearSelectedStudent}
                      className="text-red-600 hover:text-red-800 p-2 hover:bg-red-50 rounded-lg"
                      title="Clear selection"
                    >
                      <FaTimes />
                    </button>
                  </div>

                  {/* Student Stats */}
                  <div className="mt-3 pt-3 border-t border-blue-200">
                    <div className="flex gap-4">
                      <div className="text-center">
                        <p className="text-xs text-gray-500">Currently Issued</p>
                        <p className="font-bold">
                          {issuedBooks.filter(ib => ib.studentRollNo === selectedStudentObj.rollNo).length}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-gray-500">Remaining Limit</p>
                        <p className="font-bold text-green-600">
                          {5 - issuedBooks.filter(ib => ib.studentRollNo === selectedStudentObj.rollNo).length}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ================= BOOKS LIST (ISSUE TAB) ================= */}
          {activeTab === "issue" && (
            <div className="bg-white rounded-xl shadow overflow-hidden">
              <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <h2 className="text-lg font-semibold text-gray-800">
                  Available Books for Issue
                  <span className="ml-2 text-sm font-normal text-gray-500">
                    ({filteredBooks.filter(b => b.availableQuantity > 0).length} available)
                  </span>
                </h2>
                <div className="flex items-center gap-2">
                  {loading.books && <FaSpinner className="animate-spin text-blue-500" />}
                  <span className="text-sm text-gray-500">
                    Showing {filteredBooks.length} of {books.length} books
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
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredBooks.map(book => (
                        <tr key={book.docId} className="hover:bg-gray-50 transition-colors">
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
                                <span className={`font-semibold ${book.availableQuantity === 0
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
                              {book.availableQuantity <= 2 && book.availableQuantity > 0 && (
                                <div className="text-xs text-yellow-600 bg-yellow-50 px-2 py-1 rounded">
                                  Low stock
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <button
                              onClick={() => issueBook(book)}
                              disabled={book.availableQuantity === 0 || !selectedStudent || loading.issuing || !teacher}
                              className={`px-4 py-2 rounded-lg text-white font-medium transition-colors flex items-center justify-center gap-2 w-full ${book.availableQuantity === 0 || !selectedStudent || !teacher
                                  ? "bg-gray-400 cursor-not-allowed"
                                  : "bg-blue-600 hover:bg-blue-700"
                                }`}
                            >
                              {loading.issuing ? (
                                <>
                                  <FaSpinner className="animate-spin" />
                                  Processing...
                                </>
                              ) : (
                                <>
                                  <FaBookReader />
                                  Issue Book
                                </>
                              )}
                            </button>
                            {!teacher && (
                              <p className="text-xs text-red-500 mt-1 text-center">
                                Teacher information loading...
                              </p>
                            )}
                            {!selectedStudent && (
                              <p className="text-xs text-gray-500 mt-1 text-center">
                                Select a student first
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

          {/* ================= ISSUED BOOKS LIST (ISSUED TAB) ================= */}
          {activeTab === "issued" && (
            <div className="bg-white rounded-xl shadow overflow-hidden">
              <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-gray-800">
                    Currently Issued Books
                    <span className="ml-2 text-sm font-normal text-gray-500">
                      ({filteredIssuedBooks.length} books)
                    </span>
                  </h2>
                </div>
                <div className="flex items-center gap-2">
                  {/* Search Input for Issued Books */}
                  <div className="relative">
                    <FaSearch className="absolute left-3 top-3 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search by book, student, or roll number..."
                      value={issuedSearch}
                      onChange={e => setIssuedSearch(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {issuedSearch && (
                      <button
                        onClick={() => setIssuedSearch("")}
                        className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                      >
                        <FaTimes />
                      </button>
                    )}
                  </div>

                  {loading.issuedBooks && <FaSpinner className="animate-spin text-blue-500" />}
                  {overdueBooks > 0 && (
                    <span className="text-sm text-red-600 bg-red-50 px-3 py-1 rounded-full">
                      {overdueBooks} overdue
                    </span>
                  )}
                </div>
              </div>

              {filteredIssuedBooks.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <FaBookReader className="text-4xl mx-auto mb-3 text-gray-300" />
                  <p className="text-lg">
                    {issuedSearch ? "No matching issued books found" : "No books currently issued"}
                  </p>
                  <p className="text-sm mt-1">
                    {issuedSearch ? "Try a different search term" : "Books issued by you will appear here"}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Book & Student
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Issue Details
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredIssuedBooks.map(issuedBook => {
                        const dueDate = issuedBook.dueDate?.toDate ?
                          issuedBook.dueDate.toDate() :
                          new Date(issuedBook.dueDate);
                        const isOverdue = dueDate < new Date();
                        const daysOverdue = isOverdue ?
                          Math.ceil((new Date() - dueDate) / (1000 * 60 * 60 * 24)) :
                          0;

                        return (
                          <tr key={issuedBook.id} className={isOverdue ? "bg-red-50" : "hover:bg-gray-50"}>
                            <td className="px-4 py-3">
                              <div>
                                <p className="font-medium text-gray-900">{issuedBook.bookTitle}</p>
                                <div className="mt-1 space-y-1">
                                  <p className="text-sm text-gray-600">
                                    <FaUser className="inline mr-1" />
                                    {issuedBook.studentName}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    Roll: {issuedBook.studentRollNo} • {issuedBook.studentBranch}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="space-y-2">
                                <div className="flex items-center gap-2 text-sm">
                                  <FaCalendarAlt className="text-gray-400" />
                                  <span>Issued: {new Date(issuedBook.issueDate).toLocaleDateString()}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                  <FaCalendarAlt className={isOverdue ? "text-red-400" : "text-gray-400"} />
                                  <span className={isOverdue ? "text-red-600 font-medium" : "text-gray-600"}>
                                    Due: {dueDate.toLocaleDateString()}
                                  </span>
                                </div>
                                {issuedBook.renewalCount > 0 && (
                                  <div className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                                    Renewed {issuedBook.renewalCount} time(s)
                                  </div>
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${isOverdue
                                  ? "bg-red-100 text-red-800"
                                  : "bg-green-100 text-green-800"
                                }`}>
                                {isOverdue ? (
                                  <>
                                    <FaExclamationTriangle className="mr-1" />
                                    Overdue ({daysOverdue} days)
                                  </>
                                ) : (
                                  "Issued"
                                )}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex flex-col gap-2">
                                <button
                                  onClick={() => returnBook(issuedBook)}
                                  className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2 text-sm"
                                >
                                  <FaCheckCircle />
                                  Return
                                </button>
                                <button
                                  onClick={() => renewBook(issuedBook)}
                                  className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2 text-sm"
                                >
                                  <FaCalendarAlt />
                                  Renew
                                </button>
                              </div>
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



        </div>
      </div>
    </Layout>
  );
}