import React, { useState, useEffect } from "react";
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  onSnapshot,
  query,
  orderBy,
  where,
  getDocs
} from "firebase/firestore";
import { 
  createUserWithEmailAndPassword,
  updatePassword,
  sendPasswordResetEmail
} from "firebase/auth";
import { db, auth } from "../../db/firebaseConfig";
import { 
  MagnifyingGlassIcon, 
  PencilIcon, 
  TrashIcon, 
  PlusIcon, 
  EyeIcon, 
  EyeSlashIcon,
  ArrowLeftIcon,
  BookOpenIcon,
  UserCircleIcon 
} from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";
import Layout from "../../components/Layout";

// Teacher Form Component
const TeacherForm = ({ teacher, onSubmit, onCancel, loading }) => {
  const [formData, setFormData] = useState({
    name: teacher?.name || "",
    id: teacher?.id || "",
    department: teacher?.department || "",
    email: teacher?.email || "",
    password: "",
    confirmPassword: "",
    isLibrarian: teacher?.isLibrarian || false
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.id.trim()) newErrors.id = "Teacher ID is required";
    if (!formData.department.trim()) newErrors.department = "Department is required";
    
    if (!teacher) {
      if (!formData.password) newErrors.password = "Password is required";
      if (formData.password.length < 6) newErrors.password = "Password must be at least 6 characters";
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match";
      }
    } else {
      if (formData.password && formData.password.length < 6) {
        newErrors.password = "Password must be at least 6 characters";
      }
      if (formData.password && formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match";
      }
    }
    
    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validateForm();
    
    if (Object.keys(validationErrors).length === 0) {
      onSubmit(formData);
    } else {
      setErrors(validationErrors);
    }
  };

  // Auto-generate email based on ID if empty
  useEffect(() => {
    if (!formData.email && formData.id) {
      setFormData(prev => ({
        ...prev,
        email: `${formData.id}@sgsteacher.com`
      }));
    }
  }, [formData.id]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          {teacher ? "Edit Teacher" : "Add New Teacher"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 mb-2" htmlFor="name">
              Full Name *
            </label>
            <input
              id="name"
              name="name"
              placeholder="Teacher Name"
              value={formData.name}
              onChange={handleChange}
              className={`border rounded-lg w-full p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 mb-2" htmlFor="id">
                Teacher ID *
              </label>
              <input
                id="id"
                name="id"
                placeholder="Teacher ID"
                value={formData.id}
                onChange={handleChange}
                className={`border rounded-lg w-full p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.id ? 'border-red-500' : 'border-gray-300'
                } ${teacher ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                disabled={!!teacher}
              />
              {errors.id && <p className="text-red-500 text-sm mt-1">{errors.id}</p>}
            </div>
            
            <div>
              <label className="block text-gray-700 mb-2" htmlFor="department">
                Department *
              </label>
              <input
                id="department"
                name="department"
                placeholder="Department"
                value={formData.department}
                onChange={handleChange}
                className={`border rounded-lg w-full p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.department ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.department && <p className="text-red-500 text-sm mt-1">{errors.department}</p>}
            </div>
          </div>
          
          <div>
            <label className="block text-gray-700 mb-2" htmlFor="email">
              Email *
            </label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="teacher@school.com"
              value={`${formData.id}@sgsteacher.com`}
              onChange={handleChange}
              className={`border rounded-lg w-full p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.email ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
          </div>
          
          <div className="flex items-center">
            <input
              id="isLibrarian"
              name="isLibrarian"
              type="checkbox"
              checked={formData.isLibrarian}
              onChange={handleChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="isLibrarian" className="ml-2 block text-gray-700">
              <div className="flex items-center">
                <BookOpenIcon className="h-4 w-4 mr-1" />
                Mark as Librarian
              </div>
            </label>
          </div>
          
          {!teacher ? (
            <>
              <div>
                <label className="block text-gray-700 mb-2" htmlFor="password">
                  Initial Password *
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`border rounded-lg w-full p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.password ? 'border-red-500' : 'border-gray-300'
                  }`}
                  minLength={6}
                />
                {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
              </div>
              
              <div>
                <label className="block text-gray-700 mb-2" htmlFor="confirmPassword">
                  Confirm Password *
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="Confirm Password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`border rounded-lg w-full p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
              </div>
            </>
          ) : (
            <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
              <p className="text-sm text-yellow-800">
                <strong>Password Update:</strong> Leave password fields blank to keep current password.
                Use the "Send Password Reset" button in the table to reset via email.
              </p>
              
              {formData.password && (
                <>
                  <div className="mt-3">
                    <label className="block text-gray-700 mb-2" htmlFor="password">
                      New Password
                    </label>
                    <input
                      id="password"
                      name="password"
                      type="password"
                      placeholder="New Password"
                      value={formData.password}
                      onChange={handleChange}
                      className={`border rounded-lg w-full p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.password ? 'border-red-500' : 'border-gray-300'
                      }`}
                      minLength={6}
                    />
                    {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
                  </div>
                  
                  <div>
                    <label className="block text-gray-700 mb-2" htmlFor="confirmPassword">
                      Confirm New Password
                    </label>
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      placeholder="Confirm New Password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className={`border rounded-lg w-full p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
                  </div>
                </>
              )}
            </div>
          )}
          
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Saving..." : teacher ? "Update Teacher" : "Create Teacher"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Teacher Table Component
const TeachersTable = ({ teachers, searchTerm, onEdit, onDelete, onResetPassword, loading }) => {
  const filteredTeachers = teachers.filter(teacher => {
    const searchLower = searchTerm.toLowerCase();
    return (
      teacher.name?.toLowerCase().includes(searchLower) ||
      teacher.id?.toLowerCase().includes(searchLower) ||
      teacher.department?.toLowerCase().includes(searchLower) ||
      teacher.email?.toLowerCase().includes(searchLower)
    );
  });

  if (loading) {
    return (
      <tr>
        <td colSpan="6" className="py-8 text-center">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-600">Loading teachers...</p>
          </div>
        </td>
      </tr>
    );
  }

  if (filteredTeachers.length === 0) {
    return (
      <tr>
        <td colSpan="6" className="py-8 text-center text-gray-500">
          <UserCircleIcon className="h-12 w-12 mx-auto text-gray-400 mb-3" />
          <p className="text-lg">{searchTerm ? "No teachers match your search." : "No teachers found."}</p>
          {!searchTerm && <p className="text-sm mt-1">Add your first teacher using the button above.</p>}
        </td>
      </tr>
    );
  }

  return filteredTeachers.map((teacher) => (
    <tr key={teacher.uid || teacher.id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
      <td className="py-3 px-4">
        <div className="flex items-center">
          {teacher.name}
          {teacher.isLibrarian && (
            <span className="ml-2 px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded-full">
              <BookOpenIcon className="h-3 w-3 inline mr-1" />
              Librarian
            </span>
          )}
        </div>
      </td>
      <td className="py-3 px-4 font-mono text-sm">{teacher.id}</td>
      <td className="py-3 px-4">
        <div className="text-sm text-gray-600 truncate max-w-[200px]" title={teacher.email}>
          {teacher.email}
        </div>
      </td>
      <td className="py-3 px-4">{teacher.department}</td>
      <td className="py-3 px-4">
        <div className="flex justify-end space-x-2">
          <button
            onClick={() => onResetPassword(teacher)}
            className="text-green-600 hover:text-green-800 p-2 rounded-full hover:bg-green-100 transition-colors"
            title="Send Password Reset Email"
            type="button"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>
          </button>
          
          <button
            onClick={() => onEdit(teacher)}
            className="text-blue-600 hover:text-blue-800 p-2 rounded-full hover:bg-blue-100 transition-colors"
            title="Edit Teacher"
            type="button"
          >
            <PencilIcon className="h-5 w-5" />
          </button>
          
          <button
            onClick={() => onDelete(teacher)}
            className="text-red-600 hover:text-red-800 p-2 rounded-full hover:bg-red-100 transition-colors"
            title="Delete Teacher"
            type="button"
          >
            <TrashIcon className="h-5 w-5" />
          </button>
        </div>
      </td>
    </tr>
  ));
};

export default function ManageTeachers() {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: "", type: "" });
  const navigate = useNavigate();

  const showNotification = (message, type = "success") => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: "", type: "" }), 3000);
  };

  // Load teachers from Firestore
  useEffect(() => {
    setLoading(true);
    const q = query(collection(db, "teachers"), orderBy("name"));
    
    const unsubscribe = onSnapshot(q, 
      (querySnapshot) => {
        const teachersData = [];
        querySnapshot.forEach((doc) => {
          teachersData.push({
  ...doc.data(),
  firestoreId: doc.id
});

        });
        setTeachers(teachersData);
        setLoading(false);
      },
      (error) => {
        console.error("Error loading teachers: ", error);
        showNotification("Error loading teachers", "error");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // Check if teacher ID or email already exists
  const checkTeacherExists = async (teacherId, email) => {
    try {
      const idQuery = query(collection(db, "teachers"), where("id", "==", teacherId));
      const emailQuery = query(collection(db, "teachers"), where("email", "==", email));
      
      const [idSnapshot, emailSnapshot] = await Promise.all([
        getDocs(idQuery),
        getDocs(emailQuery)
      ]);
      
      return {
        idExists: !idSnapshot.empty,
        emailExists: !emailSnapshot.empty
      };
    } catch (error) {
      console.error("Error checking teacher exists:", error);
      return { idExists: false, emailExists: false };
    }
  };

  const handleCreateTeacher = async (formData) => {
    setActionLoading(true);
    try {
      // Check if teacher ID or email already exists
      const exists = await checkTeacherExists(formData.id, formData.email);
      
      if (exists.idExists) {
        showNotification("Teacher ID already exists", "error");
        setActionLoading(false);
        return;
      }
      
      if (exists.emailExists) {
        showNotification("Email already exists", "error");
        setActionLoading(false);
        return;
      }

      // Create user in Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        formData.email, 
        formData.password
      );
      
      // Store teacher data in Firestore
      const teacherData = {
        name: formData.name.trim(),
        id: formData.id.trim(),
        department: formData.department.trim(),
        email: `${formData.id}@sgsteacher.com`,
        isLibrarian: formData.isLibrarian,
        uid: userCredential.user.uid,
        password: formData.password, // Consider removing this for security
        createdAt: new Date().toISOString()
      };
      
      await addDoc(collection(db, "teachers"), teacherData);
      
      showNotification("Teacher created successfully!");
      setShowModal(false);
    } catch (error) {
      console.error("Error creating teacher: ", error);
      let errorMessage = "Error creating teacher";
      
      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage = "Email already in use";
          break;
        case 'auth/invalid-email':
          errorMessage = "Invalid email address";
          break;
        case 'auth/weak-password':
          errorMessage = "Password is too weak";
          break;
      }
      
      showNotification(errorMessage, "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateTeacher = async (formData) => {
  setActionLoading(true);
  try {
    if (!selectedTeacher?.firestoreId) {
      throw new Error("Invalid teacher document reference");
    }

    const teacherRef = doc(db, "teachers", selectedTeacher.firestoreId);

    const updateData = {
      name: formData.name.trim(),
      department: formData.department.trim(),
      email: `${formData.id}@sgsteacher.com`,
      isLibrarian: formData.isLibrarian,
      updatedAt: new Date().toISOString(),
    };

    await updateDoc(teacherRef, updateData);

    showNotification("Teacher updated successfully!");
    setShowModal(false);
    setSelectedTeacher(null);
  } catch (error) {
    console.error("Error updating teacher:", error);
    showNotification("Update failed: " + error.message, "error");
  } finally {
    setActionLoading(false);
  }
};


  const handleDeleteTeacher = async (teacher) => {
    if (!window.confirm(`Are you sure you want to delete ${teacher.name}? This action cannot be undone.`)) return;

    setActionLoading(true);
    try {
      // Find the Firestore document ID
      const teacherDoc = teachers.find(t => t.id === teacher.id);
      if (!teacherDoc || !teacherDoc.firestoreId) {
        throw new Error("Teacher document not found");
      }

      // Delete from Firestore
      await deleteDoc(doc(db, "teachers", teacherDoc.firestoreId));
      
      showNotification("Teacher deleted successfully!");
    } catch (error) {
      console.error("Error deleting teacher: ", error);
      showNotification("Error deleting teacher", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleSubmit = (formData) => {
    if (selectedTeacher) {
      handleUpdateTeacher(formData);
    } else {
      handleCreateTeacher(formData);
    }
  };

  const handleEdit = (teacher) => {
    setSelectedTeacher(teacher);
    setShowModal(true);
  };

  const openAddModal = () => {
    setSelectedTeacher(null);
    setShowModal(true);
  };

  // Statistics
  const totalTeachers = teachers.length;
  const librariansCount = teachers.filter(t => t.isLibrarian).length;

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 p-4 md:p-6">
        <div className="max-w-7xl mx-auto">
          {/* Notification */}
          {notification.show && (
            <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg animate-fade-in-down ${
              notification.type === "error" ? 
                "bg-red-100 border-l-4 border-red-500 text-red-800" : 
                "bg-green-100 border-l-4 border-green-500 text-green-800"
            }`}>
              <div className="flex items-center">
                {notification.type === "error" ? (
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                )}
                {notification.message}
              </div>
            </div>
          )}

          {/* Header */}
          <div className="mb-6">
            <button
              onClick={() => navigate("/admin/dashboard")}
              className="flex items-center text-blue-600 hover:text-blue-800 font-medium transition-colors mb-4"
            >
              <ArrowLeftIcon className="h-5 w-5 mr-2" />
              Back to Dashboard
            </button>
            
            <div className="flex flex-col md:flex-row md:items-center justify-between">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Manage Teachers</h1>
                <p className="text-gray-600 mt-1">
                  {totalTeachers} teacher{totalTeachers !== 1 ? 's' : ''} • {librariansCount} librarian{librariansCount !== 1 ? 's' : ''}
                </p>
              </div>
              <button
                onClick={openAddModal}
                disabled={actionLoading}
                className="flex items-center bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition duration-200 disabled:opacity-50 mt-4 md:mt-0"
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                Add New Teacher
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-xl shadow p-5">
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-blue-100 text-blue-600 mr-4">
                  <UserCircleIcon className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Teachers</p>
                  <p className="text-2xl font-bold text-gray-800">{totalTeachers}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow p-5">
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-purple-100 text-purple-600 mr-4">
                  <BookOpenIcon className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Librarians</p>
                  <p className="text-2xl font-bold text-gray-800">{librariansCount}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow p-5">
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-green-100 text-green-600 mr-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Last Updated</p>
                  <p className="text-sm font-medium text-gray-800">Just now</p>
                </div>
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search by name, ID, email, or department..."
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Teachers Table */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-800 text-white">
                  <tr>
                    <th className="py-3 px-4 text-left font-semibold">Name</th>
                    <th className="py-3 px-4 text-left font-semibold">ID</th>
                    <th className="py-3 px-4 text-left font-semibold">Email</th>
                    <th className="py-3 px-4 text-left font-semibold">Department</th>
                    <th className="py-3 px-4 text-left font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="text-gray-700">
                  <TeachersTable 
                    teachers={teachers} 
                    searchTerm={searchTerm} 
                    onEdit={handleEdit}
                    onDelete={handleDeleteTeacher}
                    loading={loading}
                  />
                </tbody>
              </table>
            </div>
          </div>

          {/* Security Note */}
          <div className="mt-6 p-4 bg-yellow-50 rounded-lg text-sm text-yellow-800 border border-yellow-200">
            <p className="font-medium mb-1">Security Note:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Teacher passwords are stored in Firestore for admin reference only</li>
              <li>Use the "Send Password Reset" button for secure password changes</li>
              <li>Teachers can log in using their registered email and password</li>
              <li>Librarians have additional privileges in the library system</li>
            </ul>
          </div>
        </div>

        {/* Add/Edit Modal */}
        {showModal && (
          <TeacherForm 
            teacher={selectedTeacher}
            onSubmit={handleSubmit}
            onCancel={() => setShowModal(false)}
            loading={actionLoading}
          />
        )}
      </div>
    </Layout>
  );
}