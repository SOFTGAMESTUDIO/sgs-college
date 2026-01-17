import React, { useState, useEffect } from "react";
import { saveSubject } from "../../models/subject";
import { db } from "../../db/firebaseConfig";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from "react-router-dom";
import Layout from "../../components/Layout";

export default function ManageSubjects() {
  const [teachers, setTeachers] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    subjectCode: "",
    subjectName: "",
    teacherIds: [], // Now an array for multiple teachers
    studentIds: [],
  });

  // Fetch Teachers and Students
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch teachers
        const teachersQuery = query(collection(db, "teachers"), orderBy("name"));
        const teachersSnapshot = await getDocs(teachersQuery);
        const teachersData = teachersSnapshot.docs.map((doc) => ({ 
          id: doc.id, 
          ...doc.data() 
        }));
        setTeachers(teachersData);

        // Fetch students sorted by roll number
        const studentsQuery = query(collection(db, "students"), orderBy("rollNo"));
        const studentsSnapshot = await getDocs(studentsQuery);
        const studentsData = studentsSnapshot.docs.map((doc) => ({ 
          id: doc.id, 
          ...doc.data() 
        }));
        setStudents(studentsData);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Handle Input Change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle Teacher Selection (multiple)
  const toggleTeacher = (id) => {
    setFormData(prev => {
      const isSelected = prev.teacherIds.includes(id);
      return {
        ...prev,
        teacherIds: isSelected
          ? prev.teacherIds.filter(tid => tid !== id)
          : [...prev.teacherIds, id]
      };
    });
  };

  // Handle Student Selection
  const toggleStudent = (id) => {
    setFormData(prev => {
      const isSelected = prev.studentIds.includes(id);
      return {
        ...prev,
        studentIds: isSelected
          ? prev.studentIds.filter(sid => sid !== id)
          : [...prev.studentIds, id]
      };
    });
  };

  // Select/Deselect All Students
  const toggleAllStudents = () => {
    if (formData.studentIds.length === students.length) {
      setFormData(prev => ({ ...prev, studentIds: [] }));
    } else {
      setFormData(prev => ({ 
        ...prev, 
        studentIds: students.map(student => student.id) 
      }));
    }
  };

  // Select/Deselect All Teachers
  const toggleAllTeachers = () => {
    if (formData.teacherIds.length === teachers.length) {
      setFormData(prev => ({ ...prev, teacherIds: [] }));
    } else {
      setFormData(prev => ({ 
        ...prev, 
        teacherIds: teachers.map(teacher => teacher.id) 
      }));
    }
  };

  // Form Submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.subjectCode || !formData.subjectName || formData.teacherIds.length === 0) {
      toast.error("Please fill all required fields and assign at least one teacher!");
      return;
    }

    setLoading(true);
    try {
      // Prepare teacher data with names and IDs
      const teacherData = formData.teacherIds.map(teacherId => {
        const teacher = teachers.find(t => t.id === teacherId);
        return { id: teacherId, name: teacher.name };
      });

      // Prepare student data with roll numbers
      const studentData = formData.studentIds.map(studentId => {
        const student = students.find(s => s.id === studentId);
        return { id: studentId, rollNo: student.rollNo, name: student.name };
      });

      // Sort students by roll number
      studentData.sort((a, b) => a.rollNo.localeCompare(b.rollNo, undefined, { numeric: true }));

      await saveSubject({
        subjectCode: formData.subjectCode,
        subjectName: formData.subjectName,
        teachers: teacherData,
        students: studentData
      });
      
      toast.success("Subject created successfully!");
      
      // Reset form
      setFormData({
        subjectCode: "",
        subjectName: "",
        teacherIds: [],
        studentIds: [],
      });
    } catch (error) {
      console.error("Error saving subject:", error);
      toast.error("Failed to create subject. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Get selected teachers info
  const selectedTeachers = teachers.filter(t => formData.teacherIds.includes(t.id));

  return (
    <Layout>
<div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto bg-white rounded-xl shadow-md overflow-hidden">
        <div className="p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Manage Subjects</h1>
              <p className="text-gray-600 mt-2">Create and assign subjects with multiple teachers</p>
               <div className="flex space-x-4">
               <div className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm font-medium">
                {formData.teacherIds.length} {formData.teacherIds.length === 1 ? 'Teacher' : 'Teachers'}
              </div>
              <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                {formData.studentIds.length} {formData.studentIds.length === 1 ? 'Student' : 'Students'}
              </div>
            </div>
            </div>
           
            <button
            onClick={() => navigate("/admin/display-subjects")}
            className="flex items-center text-blue-600 hover:text-blue-800 font-medium transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Back to Subject
          </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Subject Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="subjectCode" className="block text-sm font-medium text-gray-700 mb-1">
                  Subject Code *
                </label>
                <input
                  id="subjectCode"
                  name="subjectCode"
                  value={formData.subjectCode}
                  placeholder="e.g., CS101"
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                  required
                />
              </div>

              <div>
                <label htmlFor="subjectName" className="block text-sm font-medium text-gray-700 mb-1">
                  Subject Name *
                </label>
                <input
                  id="subjectName"
                  name="subjectName"
                  value={formData.subjectName}
                  placeholder="e.g., Introduction to Programming"
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                  required
                />
              </div>
            </div>

            {/* Teacher Selection */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-medium text-gray-700">
                  Assign Teachers *
                </label>
                <button
                  type="button"
                  onClick={toggleAllTeachers}
                  className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                >
                  {formData.teacherIds.length === teachers.length ? 'Deselect All' : 'Select All'}
                </button>
              </div>

              <div className="border border-gray-200 rounded-lg p-4 max-h-60 overflow-y-auto">
                {teachers.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No teachers available</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {teachers.map((teacher) => (
                      <label 
                        key={teacher.id} 
                        className={`flex items-start p-2 rounded-md cursor-pointer transition ${formData.teacherIds.includes(teacher.id) ? 'bg-indigo-50 border border-indigo-200' : 'hover:bg-gray-50'}`}
                      >
                        <input
                          type="checkbox"
                          checked={formData.teacherIds.includes(teacher.id)}
                          onChange={() => toggleTeacher(teacher.id)}
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
              
              {selectedTeachers.length > 0 && (
                <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm font-medium text-blue-800 mb-1">Selected Teachers:</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedTeachers.map(teacher => (
                      <span key={teacher.id} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                        {teacher.name} ({teacher.department})
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Student Selection */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-medium text-gray-700">
                  Assign Students
                </label>
                <button
                  type="button"
                  onClick={toggleAllStudents}
                  className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                >
                  {formData.studentIds.length === students.length ? 'Deselect All' : 'Select All'}
                </button>
              </div>

              <div className="border border-gray-200 rounded-lg p-4 max-h-60 overflow-y-auto">
                {students.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No students available</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {students.map((student) => (
                      <label 
                        key={student.id} 
                        className={`flex items-start p-2 rounded-md cursor-pointer transition ${formData.studentIds.includes(student.id) ? 'bg-indigo-50 border border-indigo-200' : 'hover:bg-gray-50'}`}
                      >
                        <input
                          type="checkbox"
                          checked={formData.studentIds.includes(student.id)}
                          onChange={() => toggleStudent(student.id)}
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

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3 px-4 rounded-lg font-medium text-white transition ${loading ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'}`}
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </span>
                ) : 'Create Subject'}
              </button>
            </div>
          </form>
        </div>
      </div>
      <ToastContainer position="bottom-right" autoClose={3000} />
    </div>
    </Layout>
    
  );
}