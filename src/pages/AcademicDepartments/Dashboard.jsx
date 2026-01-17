import React, { useEffect, useState } from "react";
import { db } from "../../db/firebaseConfig";
import { collection, getDocs } from "firebase/firestore";
import { 
  Users, 
  BookOpen, 
  GraduationCap, 
  ChevronRight,
} from "lucide-react";
import Layout from "../../components/Layout";

export default function AdminDashboard() {
  const [counts, setCounts] = useState({
    teachers: 0,
    students: 0,
    subjects: 0,
  });

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const teachersSnapshot = await getDocs(collection(db, "teachers"));
        const studentsSnapshot = await getDocs(collection(db, "students"));
        const subjectsSnapshot = await getDocs(collection(db, "subjects"));

        setCounts({
          teachers: teachersSnapshot.size,
          students: studentsSnapshot.size,
          subjects: subjectsSnapshot.size,
        });
      } catch (error) {
        console.error("Error fetching counts:", error);
      }
    };

    fetchCounts();
  }, []);

  return (
    <Layout>
  <div className="min-h-screen bg-gray-50">
      <div className="p-6 max-w-7xl mx-auto">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 transition-all hover:shadow-md">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-lg font-semibold text-gray-600 mb-2">Total Teachers</h2>
                <p className="text-3xl font-bold text-blue-600">{counts.teachers}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Users size={24} className="text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 transition-all hover:shadow-md">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-lg font-semibold text-gray-600 mb-2">Total Students</h2>
                <p className="text-3xl font-bold text-green-600">{counts.students}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <GraduationCap size={24} className="text-green-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 transition-all hover:shadow-md">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-lg font-semibold text-gray-600 mb-2">Total Subjects</h2>
                <p className="text-3xl font-bold text-purple-600">{counts.subjects}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <BookOpen size={24} className="text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Management Section */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">Management</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <a 
              href="/admin/manage-teachers" 
              className="group flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all"
            >
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg mr-4 group-hover:bg-blue-200 transition-colors">
                  <Users size={20} className="text-blue-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-800">Manage Teachers</h3>
                  <p className="text-sm text-gray-500">View and edit teacher records</p>
                </div>
              </div>
              <ChevronRight size={20} className="text-gray-400 group-hover:text-blue-600" />
            </a>
            
            <a 
              href="/admin/manage-students" 
              className="group flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:border-green-500 hover:bg-green-50 transition-all"
            >
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg mr-4 group-hover:bg-green-200 transition-colors">
                  <GraduationCap size={20} className="text-green-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-800">Manage Students</h3>
                  <p className="text-sm text-gray-500">View and edit student records</p>
                </div>
              </div>
              <ChevronRight size={20} className="text-gray-400 group-hover:text-green-600" />
            </a>
            
            <a 
              href="/admin/display-subjects" 
              className="group flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:border-purple-500 hover:bg-purple-50 transition-all"
            >
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg mr-4 group-hover:bg-purple-200 transition-colors">
                  <BookOpen size={20} className="text-purple-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-800">Manage Subjects</h3>
                  <p className="text-sm text-gray-500">View and edit subject records</p>
                </div>
              </div>
              <ChevronRight size={20} className="text-gray-400 group-hover:text-purple-600" />
            </a>
          </div>
        </div>
      </div>
    </div>
    </Layout>
  
  );
}