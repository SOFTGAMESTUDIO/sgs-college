import React, { useEffect, useState, useCallback } from "react";
import { db } from "../../db/firebaseConfig";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  query,
  orderBy,
} from "firebase/firestore";
import Layout from "../../components/Layout";
import { toast } from "react-toastify";
import { FaEdit, FaTrash, FaSearch, FaSpinner, FaUserTie, FaBook, FaHistory } from "react-icons/fa";

export default function LibraryAdmin() {
  const [teachers, setTeachers] = useState([]);
  const [books, setBooks] = useState([]);
  const [issuedBooks, setIssuedBooks] = useState([]);
  const [search, setSearch] = useState("");
  const [editingBook, setEditingBook] = useState(null);
  const [loading, setLoading] = useState({
    teachers: false,
    books: false,
    issuedBooks: false,
  });

  const [bookData, setBookData] = useState({
    title: "",
    description: "",
    branch: "",
    year: "",
    semester: "",
    price: "",
    publishDate: "",
    quantity: "",
  });

  const fetchAll = useCallback(async () => {
    setLoading({ teachers: true, books: true, issuedBooks: true });
    try {
      await Promise.all([fetchTeachers(), fetchBooks(), fetchIssuedBooks()]);
    } catch (error) {
      toast.error("Failed to fetch data");
      console.error("Fetch error:", error);
    } finally {
      setLoading({ teachers: false, books: false, issuedBooks: false });
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const fetchTeachers = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "teachers"));
      const teachersData = querySnapshot.docs.map((doc) => ({
        docId: doc.id,
        ...doc.data(),
      }));
      setTeachers(teachersData);
    } catch (error) {
      throw error;
    }
  };

  const fetchBooks = async () => {
    try {
      const booksQuery = query(collection(db, "books"), orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(booksQuery);
      const booksData = querySnapshot.docs.map((doc) => ({
        docId: doc.id,
        ...doc.data(),
      }));
      setBooks(booksData);
    } catch (error) {
      throw error;
    }
  };

  const fetchIssuedBooks = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "issued_books"));
      const issuedBooksData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setIssuedBooks(issuedBooksData);
    } catch (error) {
      throw error;
    }
  };

  /* ==================== LIBRARIAN MANAGEMENT ==================== */
  const toggleLibrarian = async (docId, value, teacherName) => {
    try {
      await updateDoc(doc(db, "teachers", docId), {
        isLibrarian: value,
        updatedAt: serverTimestamp(),
      });
      toast.success(`${teacherName} ${value ? "assigned as" : "removed from"} librarian`);
      fetchTeachers();
    } catch (error) {
      toast.error("Failed to update librarian permission");
      console.error("Toggle librarian error:", error);
    }
  };

  /* ==================== BOOK MANAGEMENT ==================== */
  const validateBookData = () => {
    const requiredFields = ["title", "quantity", "branch"];
    const missingFields = requiredFields.filter((field) => !bookData[field]?.trim());

    if (missingFields.length > 0) {
      toast.error(`Missing required fields: ${missingFields.join(", ")}`);
      return false;
    }

    if (isNaN(bookData.quantity) || Number(bookData.quantity) <= 0) {
      toast.error("Quantity must be a positive number");
      return false;
    }

    return true;
  };

  const saveBook = async () => {
    if (!validateBookData()) return;

    try {
      const bookPayload = {
        ...bookData,
        totalQuantity: Number(bookData.quantity),
        price: Number(bookData.price) || 0,
        year: Number(bookData.year) || "",
        semester: Number(bookData.semester) || "",
        updatedAt: serverTimestamp(),
      };

      if (editingBook) {
        bookPayload.availableQuantity =
          Number(bookData.quantity) - (editingBook.issuedQuantity || 0);
        await updateDoc(doc(db, "books", editingBook.docId), bookPayload);
        toast.success("Book updated successfully");
      } else {
        const newBook = {
          ...bookPayload,
          issuedQuantity: 0,
          availableQuantity: Number(bookData.quantity),
          createdAt: serverTimestamp(),
        };
        await addDoc(collection(db, "books"), newBook);
        toast.success("Book added successfully");
      }

      resetBookForm();
      fetchBooks();
    } catch (error) {
      toast.error(`Failed to ${editingBook ? "update" : "add"} book`);
      console.error("Save book error:", error);
    }
  };

  const editBook = (book) => {
    setEditingBook(book);
    setBookData({
      title: book.title || "",
      description: book.description || "",
      branch: book.branch || "",
      year: book.year || "",
      semester: book.semester || "",
      price: book.price || "",
      publishDate: book.publishDate || "",
      quantity: book.totalQuantity || "",
    });
  };

  const deleteBook = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) return;

    try {
      await deleteDoc(doc(db, "books", id));
      toast.success("Book deleted successfully");
      fetchBooks();
    } catch (error) {
      toast.error("Failed to delete book");
      console.error("Delete book error:", error);
    }
  };

  const resetBookForm = () => {
    setBookData({
      title: "",
      description: "",
      branch: "",
      year: "",
      semester: "",
      price: "",
      publishDate: "",
      quantity: "",
    });
    setEditingBook(null);
  };

  /* ==================== FILTERING ==================== */
  const filteredBooks = books.filter((book) =>
    book.title.toLowerCase().includes(search.toLowerCase()) ||
    book.branch?.toLowerCase().includes(search.toLowerCase())
  );

  /* ==================== STATS ==================== */
  const totalBooks = books.reduce((sum, book) => sum + (book.totalQuantity || 0), 0);
  const issuedCount = issuedBooks.length;
  const availableLibrarians = teachers.filter(t => t.isLibrarian).length;

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 p-4 md:p-6">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* ================= HEADER ================= */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800 flex items-center gap-2">
                📚 Library Admin Dashboard
              </h1>
              <p className="text-gray-600 text-sm mt-1">
                Manage books, librarians, and track issued books
              </p>
            </div>

            <div className="relative w-full md:w-auto">
              <FaSearch className="absolute left-3 top-3 text-gray-400" />
              <input
                placeholder="Search books by title or branch..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full md:w-64 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          {/* ================= STATS CARDS ================= */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl shadow p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Total Books</p>
                  <p className="text-2xl font-bold">{totalBooks}</p>
                </div>
                <FaBook className="text-blue-500 text-2xl" />
              </div>
            </div>
            <div className="bg-white rounded-xl shadow p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Books Issued</p>
                  <p className="text-2xl font-bold">{issuedCount}</p>
                </div>
                <FaHistory className="text-green-500 text-2xl" />
              </div>
            </div>
            <div className="bg-white rounded-xl shadow p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Active Librarians</p>
                  <p className="text-2xl font-bold">{availableLibrarians}</p>
                </div>
                <FaUserTie className="text-purple-500 text-2xl" />
              </div>
            </div>
          </div>

          {/* ================= ASSIGN LIBRARIAN ================= */}
          <section className="bg-white rounded-xl shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-800">
                Manage Librarians
              </h2>
              {loading.teachers && <FaSpinner className="animate-spin text-blue-500" />}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {teachers.map((teacher) => (
                <div
                  key={teacher.docId}
                  className="flex justify-between items-center border border-gray-200 p-4 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-1">
                    <p className="font-medium text-gray-800">{teacher.name}</p>
                    <p className="text-sm text-gray-500">ID: {teacher.id}</p>
                    <p className="text-sm text-gray-500">{teacher.department}</p>
                  </div>
                  <label className="flex items-center cursor-pointer">
                    <div className="relative">
                      <input
                        type="checkbox"
                        className="sr-only"
                        checked={teacher.isLibrarian || false}
                        onChange={(e) =>
                          toggleLibrarian(teacher.docId, e.target.checked, teacher.name)
                        }
                      />
                      <div
                        className={`block w-12 h-6 rounded-full transition-colors ${
                          teacher.isLibrarian ? "bg-blue-500" : "bg-gray-300"
                        }`}
                      ></div>
                      <div
                        className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${
                          teacher.isLibrarian ? "transform translate-x-6" : ""
                        }`}
                      ></div>
                    </div>
                    <span className="ml-3 text-sm text-gray-700">
                      {teacher.isLibrarian ? "Librarian" : "Teacher"}
                    </span>
                  </label>
                </div>
              ))}
            </div>
          </section>

          {/* ================= ADD / EDIT BOOK ================= */}
          <section className="bg-white rounded-xl shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-800">
                {editingBook ? "Edit Book" : "Add New Book"}
              </h2>
              {editingBook && (
                <button
                  onClick={resetBookForm}
                  className="text-sm text-gray-600 hover:text-gray-800"
                >
                  Cancel Edit
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { key: "title", label: "Book Title", required: true },
                { key: "branch", label: "Branch", required: true },
                { key: "quantity", label: "Quantity", type: "number", required: true },
                { key: "price", label: "Price (₹)", type: "number" },
                { key: "year", label: "Year", type: "number" },
                { key: "semester", label: "Semester", type: "number" },
                { key: "publishDate", label: "Publish Date", type: "date" },
                { key: "description", label: "Description" },
              ].map((field) => (
                <div key={field.key}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {field.label}
                    {field.required && <span className="text-red-500 ml-1">*</span>}
                  </label>
                  {field.key === "description" ? (
                    <textarea
                      placeholder={field.label}
                      className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows="3"
                      value={bookData[field.key] || ""}
                      onChange={(e) =>
                        setBookData({ ...bookData, [field.key]: e.target.value })
                      }
                    />
                  ) : (
                    <input
                      type={field.type || "text"}
                      placeholder={field.label}
                      className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={bookData[field.key] || ""}
                      onChange={(e) =>
                        setBookData({ ...bookData, [field.key]: e.target.value })
                      }
                    />
                  )}
                </div>
              ))}
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={saveBook}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                {editingBook ? "Update Book" : "Add Book"}
              </button>
              <button
                onClick={resetBookForm}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-2 rounded-lg font-medium transition-colors"
              >
                Clear
              </button>
            </div>
          </section>

          {/* ================= BOOK LIST ================= */}
          <section className="bg-white rounded-xl shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Books Inventory</h2>
              <span className="text-sm text-gray-500">
                {filteredBooks.length} of {books.length} books
              </span>
            </div>

            <div className="overflow-x-auto rounded-lg border border-gray-200">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Title
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Branch
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Issued
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Available
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredBooks.map((book) => (
                    <tr
                      key={book.docId}
                      className="hover:bg-gray-50 transition-colors"
                    >
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
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {book.branch || "N/A"}
                        </span>
                      </td>
                      <td className="px-4 py-3">{book.totalQuantity || 0}</td>
                      <td className="px-4 py-3">
                        <span className="text-red-600 font-medium">
                          {book.issuedQuantity || 0}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-green-600 font-medium">
                          {book.availableQuantity || book.totalQuantity || 0}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => editBook(book)}
                            className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50"
                            title="Edit book"
                          >
                            <FaEdit />
                          </button>
                          <button
                            onClick={() => deleteBook(book.docId, book.title)}
                            className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50"
                            title="Delete book"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredBooks.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  {search ? "No books found for your search" : "No books available"}
                </div>
              )}
            </div>
          </section>

          {/* ================= ISSUED BOOKS ================= */}
          <section className="bg-white rounded-xl shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Issued Books</h2>
              {loading.issuedBooks && <FaSpinner className="animate-spin text-blue-500" />}
            </div>

            <div className="overflow-x-auto rounded-lg border border-gray-200">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Book Title
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Student
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Roll No
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Teacher ID
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {issuedBooks.map((issued) => (
                    <tr key={issued.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900">
                        {issued.bookTitle}
                      </td>
                      <td className="px-4 py-3">{issued.studentName}</td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          {issued.studentRollNo}
                        </span>
                      </td>
                      <td className="px-4 py-3">{issued.teacherId}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            issued.status === "returned"
                              ? "bg-green-100 text-green-800"
                              : issued.status === "overdue"
                              ? "bg-red-100 text-red-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {issued.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {issuedBooks.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No books have been issued yet
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </Layout>
  );
}