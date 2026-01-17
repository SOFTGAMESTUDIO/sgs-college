import React, { useState, useEffect } from "react";
import { db } from "../../db/firebaseConfig";
import { collection, getDocs, doc, updateDoc, deleteDoc, query, orderBy } from "firebase/firestore";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from "react-router-dom";
import Layout from "../../components/Layout";

export default function SubjectManagement() {
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingSubject, setEditingSubject] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [subjectToDelete, setSubjectToDelete] = useState(null);
  const navigate = useNavigate();

  // Fetch all data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch subjects
        const subjectsQuery = query(collection(db, "subjects"), orderBy("subjectName"));
        const subjectsSnapshot = await getDocs(subjectsQuery);
        const subjectsData = subjectsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setSubjects(subjectsData);

        // Fetch teachers
        const teachersQuery = query(collection(db, "teachers"), orderBy("name"));
        const teachersSnapshot = await getDocs(teachersQuery);
        const teachersData = teachersSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setTeachers(teachersData);

        // Fetch students
        const studentsQuery = query(collection(db, "students"), orderBy("rollNo"));
        const studentsSnapshot = await getDocs(studentsQuery);
        const studentsData = studentsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setStudents(studentsData);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Handle edit subject
  const handleEdit = (subject) => {
    setEditingSubject(subject);
    setShowEditModal(true);
  };

  // Handle save edited subject
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    try {
      const subjectRef = doc(db, "subjects", editingSubject.id);
      await updateDoc(subjectRef, {
        subjectCode: editingSubject.subjectCode,
        subjectName: editingSubject.subjectName,
        teachers: editingSubject.teachers,
        students: editingSubject.students
      });
      
      // Update local state
      setSubjects(subjects.map(s => s.id === editingSubject.id ? editingSubject : s));
      setShowEditModal(false);
      setEditingSubject(null);
      toast.success("Subject updated successfully");
    } catch (error) {
      console.error("Error updating subject:", error);
      toast.error("Failed to update subject");
    }
  };

  // Handle delete subject
  const handleDelete = (subject) => {
    setSubjectToDelete(subject);
    setShowDeleteConfirm(true);
  };

  // Confirm delete
  const confirmDelete = async () => {
    try {
      await deleteDoc(doc(db, "subjects", subjectToDelete.id));
      setSubjects(subjects.filter(s => s.id !== subjectToDelete.id));
      setShowDeleteConfirm(false);
      setSubjectToDelete(null);
      toast.success("Subject deleted successfully");
    } catch (error) {
      console.error("Error deleting subject:", error);
      toast.error("Failed to delete subject");
    }
  };

  // Update teacher assignment in edit mode
  const toggleTeacherInEdit = (teacherId) => {
    const isAssigned = editingSubject.teachers.some(t => t.id === teacherId);
    const teacher = teachers.find(t => t.id === teacherId);
    
    if (isAssigned) {
      setEditingSubject({
        ...editingSubject,
        teachers: editingSubject.teachers.filter(t => t.id !== teacherId)
      });
    } else {
      setEditingSubject({
        ...editingSubject,
        teachers: [...editingSubject.teachers, { id: teacher.id, name: teacher.name }]
      });
    }
  };

  // Update student assignment in edit mode
  const toggleStudentInEdit = (studentId) => {
    const isAssigned = editingSubject.students.some(s => s.id === studentId);
    const student = students.find(s => s.id === studentId);
    
    if (isAssigned) {
      setEditingSubject({
        ...editingSubject,
        students: editingSubject.students.filter(s => s.id !== studentId)
      });
    } else {
      setEditingSubject({
        ...editingSubject,
        students: [...editingSubject.students, { 
          id: student.id, 
          rollNo: student.rollNo, 
          name: student.name 
        }]
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <Layout>
 <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
         <button
            onClick={() => navigate("/admin/dashboard")}
            className="flex items-center text-blue-600 hover:text-blue-800 font-medium transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
             Back to Dashboard
          </button>

       <header className="mb-8">
     <div className="flex justify-between items-start">
       <div>
         <h1 className="text-3xl font-bold text-gray-800 mb-2">Subject Management</h1>
         <p className="text-gray-600">View and manage all subjects with their teachers and students</p>
       </div>
       <button
         onClick={() => navigate("/admin/add-subjects")}
         className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
       >
         Add Subject
       </button>
     </div>
   </header>

        {/* Subjects Grid */}
        {subjects.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-8 text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-gray-900">No subjects found</h3>
            <p className="mt-1 text-gray-500">There are no subjects to display at this time.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {subjects.map(subject => (
              <div key={subject.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h2 className="text-xl font-bold text-gray-800">{subject.subjectName}</h2>
                      <p className="text-sm text-gray-500">{subject.subjectCode}</p>
                    </div>
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => handleEdit(subject)}
                        className="text-indigo-600 hover:text-indigo-800"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                        </svg>
                      </button>
                      <button 
                        onClick={() => handleDelete(subject)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  
                  {/* Teachers Section */}
                  <div className="mb-6">
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Teachers</h3>
                    <div className="space-y-2">
                      {subject.teachers.map(teacher => (
                        <div key={teacher.id} className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                            <span className="text-indigo-800 font-medium">
                              {teacher.name.split(' ').map(n => n[0]).join('')}
                            </span>
                          </div>
                          <div className="ml-3">
                            <p className="text-sm font-medium text-gray-900">{teacher.name}</p>
                            <p className="text-xs text-gray-500">ID: {teacher.id}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Students Section */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Students</h3>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">No. of Students : <span className="text-green-600">{subject.students.length}</span>  </h4>
                    <div className="border border-gray-200 rounded-lg divide-y divide-gray-200 max-h-60 overflow-y-auto">
                      {subject.students.sort((a, b) => a.rollNo.localeCompare(b.rollNo)).map(student => (
                        <div key={student.id} className="p-3 flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-900">{student.name}</p>
                            <p className="text-xs text-gray-500">Roll No: {student.rollNo}</p>
                          </div>
                          <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full">
                            ID: {student.id}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Edit Modal */}
        {showEditModal && editingSubject && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl max-h-screen overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-800">Edit Subject</h2>
                  <button 
                    onClick={() => setShowEditModal(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <form onSubmit={handleSaveEdit}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Subject Code *
                      </label>
                      <input
                        type="text"
                        value={editingSubject.subjectCode}
                        onChange={(e) => setEditingSubject({...editingSubject, subjectCode: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Subject Name *
                      </label>
                      <input
                        type="text"
                        value={editingSubject.subjectName}
                        onChange={(e) => setEditingSubject({...editingSubject, subjectName: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                        required
                      />
                    </div>
                  </div>

                  {/* Teacher Selection */}
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-3">
                      <label className="block text-sm font-medium text-gray-700">
                        Assign Teachers *
                      </label>
                    </div>

                    <div className="border border-gray-200 rounded-lg p-4 max-h-60 overflow-y-auto">
                      {teachers.length === 0 ? (
                        <p className="text-gray-500 text-center py-4">No teachers available</p>
                      ) : (
                        <div className="grid grid-cols-1 gap-3">
                          {teachers.map((teacher) => (
                            <label 
                              key={teacher.id} 
                              className={`flex items-start p-2 rounded-md cursor-pointer transition ${editingSubject.teachers.some(t => t.id === teacher.id) ? 'bg-indigo-50 border border-indigo-200' : 'hover:bg-gray-50'}`}
                            >
                              <input
                                type="checkbox"
                                checked={editingSubject.teachers.some(t => t.id === teacher.id)}
                                onChange={() => toggleTeacherInEdit(teacher.id)}
                                className="mt-1 mr-2 text-indigo-600 focus:ring-indigo-500"
                              />
                              <div>
                                <span className="block text-sm font-medium text-gray-900">{teacher.name}</span>
                                <span className="block text-xs text-gray-500">{teacher.department}</span>
                                {teacher.email && (
                                  <span className="block text-xs text-gray-500">{teacher.email}</span>
                                )}
                              </div>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Student Selection */}
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-3">
                      <label className="block text-sm font-medium text-gray-700">
                        Assign Students
                      </label>
                    </div>

                    <div className="border border-gray-200 rounded-lg p-4 max-h-60 overflow-y-auto">
                      {students.length === 0 ? (
                        <p className="text-gray-500 text-center py-4">No students available</p>
                      ) : (
                        <div className="grid grid-cols-1 gap-3">
                          {students.map((student) => (
                            <label 
                              key={student.id} 
                              className={`flex items-start p-2 rounded-md cursor-pointer transition ${editingSubject.students.some(s => s.id === student.id) ? 'bg-indigo-50 border border-indigo-200' : 'hover:bg-gray-50'}`}
                            >
                              <input
                                type="checkbox"
                                checked={editingSubject.students.some(s => s.id === student.id)}
                                onChange={() => toggleStudentInEdit(student.id)}
                                className="mt-1 mr-2 text-indigo-600 focus:ring-indigo-500"
                              />
                              <div>
                                <span className="block text-sm font-medium text-gray-900">{student.name}</span>
                                <span className="block text-xs text-gray-500">Roll No: {student.rollNo}</span>
                                {student.email && (
                                  <span className="block text-xs text-gray-500">{student.email}</span>
                                )}
                              </div>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-end space-x-4">
                    <button
                      type="button"
                      onClick={() => setShowEditModal(false)}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                    >
                      Save Changes
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && subjectToDelete && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-lg w-full max-w-md">
              <div className="p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Confirm Deletion</h2>
                <p className="text-gray-600 mb-6">
                  Are you sure you want to delete the subject "{subjectToDelete.subjectName}"? This action cannot be undone.
                </p>
                <div className="flex justify-end space-x-4">
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmDelete}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <ToastContainer position="bottom-right" autoClose={3000} />
      </div>
    </div>
    </Layout>
   
  );
}