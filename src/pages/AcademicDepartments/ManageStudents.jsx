import React, { useState, useEffect } from "react";
import { db, auth } from "../../db/firebaseConfig";
import { 
  collection, 
  addDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  doc 
} from "firebase/firestore";
import { 
  createUserWithEmailAndPassword, 
  updateEmail, 
  updatePassword, 
  deleteUser 
} from "firebase/auth";
import { useNavigate } from "react-router-dom";
import Layout from "../../components/Layout";

export default function ManageStudents() {
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  
  const [newStudent, setNewStudent] = useState({
    name: "",
    rollNo: "",
    course: "",
    semester: "",
    password: "",
  });

  const studentsCollection = collection(db, "students");

  // Fetch students from Firestore
  useEffect(() => {
    const fetchStudents = async () => {
      setLoading(true);
      try {
        const snapshot = await getDocs(studentsCollection);
        const studentList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setStudents(studentList);
        setFilteredStudents(studentList);
      } catch (error) {
        console.error("Error fetching students:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, []);

  // Filter students based on search term
  useEffect(() => {
    const filtered = students.filter(
      (student) =>
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.rollNo.toLowerCase().includes(searchTerm.toLowerCase())
    );
    filtered.sort((a, b) => a.rollNo.localeCompare(b.rollNo, undefined, { numeric: true, sensitivity: 'base' }));
    setFilteredStudents(filtered);
  }, [searchTerm, students]);

  // Handle search input change
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  // Add new student to Firestore and Auth
  const handleAddStudent = async () => {
    if (
      !newStudent.name ||
      !newStudent.rollNo ||
      !newStudent.course ||
      !newStudent.semester ||
      !newStudent.password
    ) {
      return alert("Please fill all fields");
    }

    try {
      const email = `${newStudent.rollNo}@sgs.com`;
      const password = newStudent.password;

      // Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      // Add student to Firestore
      const docRef = await addDoc(studentsCollection, {
        uid: userCredential.user.uid,
        name: newStudent.name,
        rollNo: newStudent.rollNo,
        course: newStudent.course,
        semester: newStudent.semester,
        password: newStudent.password,
      });

      // Update local state
      setStudents([...students, { ...newStudent, id: docRef.id, uid: userCredential.user.uid }]);
      
      // Reset form
      setNewStudent({
        name: "",
        rollNo: "",
        course: "",
        semester: "",
        password: "",
      });
    } catch (error) {
      console.error("Error adding student:", error);
      alert(`Error adding student: ${error.message}`);
    }
  };

  // Set student for editing
  const handleEdit = (student) => {
    setIsEditing(true);
    setEditingStudent({ ...student });
  };

  // Update student in Firestore and Auth
  const handleUpdateStudent = async () => {
    if (
      !editingStudent.name ||
      !editingStudent.rollNo ||
      !editingStudent.course ||
      !editingStudent.semester
    ) {
      return alert("Please fill all fields");
    }

    try {
      // Update Firestore document
      const studentDoc = doc(db, "students", editingStudent.id);
      await updateDoc(studentDoc, {
        name: editingStudent.name,
        rollNo: editingStudent.rollNo,
        course: editingStudent.course,
        semester: editingStudent.semester,
      });

      // Update email in Firebase Auth if rollNo changed
      if (editingStudent.rollNo !== students.find(s => s.id === editingStudent.id).rollNo) {
        const newEmail = `${editingStudent.rollNo}@sgs.com`;
        await updateEmail(auth.currentUser, newEmail);
      }

      // Update local state
      const updatedStudents = students.map((student) =>
        student.id === editingStudent.id ? editingStudent : student
      );
      setStudents(updatedStudents);

      // Reset editing state
      setIsEditing(false);
      setEditingStudent(null);
    } catch (error) {
      console.error("Error updating student:", error);
      alert(`Error updating student: ${error.message}`);
    }
  };

  // Prepare student for deletion
  const confirmDelete = (student) => {
    setStudentToDelete(student);
    setShowDeleteModal(true);
  };

  // Delete student from Firestore and Auth
  const handleDeleteStudent = async () => {
    try {
      // Delete from Firestore
      const studentDoc = doc(db, "students", studentToDelete.id);
      await deleteDoc(studentDoc);

      // Delete from Firebase Auth
      await deleteUser(await auth.currentUser);

      // Update local state
      const updatedStudents = students.filter(
        (student) => student.id !== studentToDelete.id
      );
      setStudents(updatedStudents);

      // Close modal
      setShowDeleteModal(false);
      setStudentToDelete(null);
    } catch (error) {
      console.error("Error deleting student:", error);
      alert(`Error deleting student: ${error.message}`);
    }
  };

  // Cancel editing
  const cancelEdit = () => {
    setIsEditing(false);
    setEditingStudent(null);
  };

  return (
    <Layout>
 <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-wrap justify-between">
           <h1 className="text-3xl font-bold text-gray-800 mb-6">Student Management</h1>
         <button
            onClick={() => navigate("/admin/dashboard")}
            className="flex items-center text-blue-600 hover:text-blue-800 font-medium transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Back to Dashboard
          </button>


        </div>
       
       

        {/* Add/Edit Student Card */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            {isEditing ? "Edit Student" : "Add New Student"}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                type="text"
                placeholder="Student Name"
                value={isEditing ? editingStudent.name : newStudent.name}
                onChange={(e) =>
                  isEditing
                    ? setEditingStudent({ ...editingStudent, name: e.target.value })
                    : setNewStudent({ ...newStudent, name: e.target.value })
                }
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Roll No</label>
              <input
                type="text"
                placeholder="Roll Number"
                value={isEditing ? editingStudent.rollNo : newStudent.rollNo}
                onChange={(e) =>
                  isEditing
                    ? setEditingStudent({ ...editingStudent, rollNo: e.target.value })
                    : setNewStudent({ ...newStudent, rollNo: e.target.value })
                }
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={isEditing}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Course</label>
              <input
                type="text"
                placeholder="Course"
                value={isEditing ? editingStudent.course : newStudent.course}
                onChange={(e) =>
                  isEditing
                    ? setEditingStudent({ ...editingStudent, course: e.target.value })
                    : setNewStudent({ ...newStudent, course: e.target.value })
                }
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Semester</label>
              <input
                type="number"
                placeholder="Semester"
                value={isEditing ? editingStudent.semester : newStudent.semester}
                onChange={(e) =>
                  isEditing
                    ? setEditingStudent({ ...editingStudent, semester: e.target.value })
                    : setNewStudent({ ...newStudent, semester: e.target.value })
                }
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            {!isEditing && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input
                  type="password"
                  placeholder="Password"
                  value={newStudent.password}
                  onChange={(e) =>
                    setNewStudent({ ...newStudent, password: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            )}
          </div>
          
          <div className="flex space-x-3">
            {isEditing ? (
              <>
                <button
                  onClick={handleUpdateStudent}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                >
                  Update Student
                </button>
                <button
                  onClick={cancelEdit}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50"
                >
                  Cancel
                </button>
              </>
            ) : (
              <button
                onClick={handleAddStudent}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
              >
                Add Student
              </button>
            )}
          </div>
        </div>

         {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search by name or roll number..."
              value={searchTerm}
              onChange={handleSearch}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Students Table */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <h2 className="text-xl font-semibold text-gray-800 p-6 border-b">Students List</h2>
          
          {loading ? (
            <div className="p-6 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
              <p className="mt-2 text-gray-600">Loading students...</p>
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              No students found. {searchTerm && "Try a different search term."}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Roll No</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Password</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Semester</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredStudents.map((student) => (
                    <tr key={student.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{student.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{student.rollNo}</div>
                        
                      </td>
                       <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{student.password}</div>
                        
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{student.course}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">Sem {student.semester}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleEdit(student)}
                          className="text-blue-600 hover:text-blue-900 mr-3 focus:outline-none"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => confirmDelete(student)}
                          className="text-red-600 hover:text-red-900 focus:outline-none"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Confirm Deletion</h3>
            <p className="text-gray-600 mb-4">
              Are you sure you want to delete {studentToDelete?.name} ({studentToDelete?.rollNo})? 
              This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteStudent}
                className="px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 transition duration-200"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    </Layout>
   
  );
}