import React, { useEffect, useState } from "react";
import { db } from "../../db/firebaseConfig";
import { collection, getDocs, query, where, doc, getDoc } from "firebase/firestore";
import { useParams } from "react-router-dom";
import { useAuth } from "../../auth/authProvider";
import { motion } from "framer-motion";
import Layout from "../../components/Layout";

export default function SubjectAttendance() {
  const { id } = useParams(); // subject id
  const { user } = useAuth();
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [studentRoll, setStudentRoll] = useState(null);
  const [subject, setSubject] = useState(null);

  useEffect(() => {
    if (!user?.uid) return;

    const fetchAttendance = async () => {
      try {
        // 1. Get student rollNo
        const studentQ = query(
          collection(db, "students"),
          where("uid", "==", user.uid)
        );
        const studentSnap = await getDocs(studentQ);
        if (studentSnap.empty) return;

        const studentDoc = studentSnap.docs[0];
        const rollNo = studentDoc.data().rollNo;
        setStudentRoll(rollNo);

        // 2. Get subject details
        const subjectDoc = await getDoc(doc(db, "subjects", id));
        if (subjectDoc.exists()) {
          setSubject(subjectDoc.data());
        }

        // 3. Get attendance records for this subject
        const attSnap = await getDocs(collection(db, "subjects", id, "attendance"));
        let attRecords = [];

        attSnap.forEach((docSnap) => {
          const data = docSnap.data();
          const record = data.records?.find((r) => r.rollNo === rollNo);

          attRecords.push({
            id: docSnap.id,
            date: data.date,
            status: record ? record.status : "Absent", // default Absent if not found
          });
        });

        // Sort by date (latest first)
        attRecords.sort((a, b) => new Date(b.date) - new Date(a.date));

        setAttendance(attRecords);
      } catch (error) {
        console.error("Error fetching attendance:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAttendance();
  }, [id, user]);

  // Skeleton loader component
  const SkeletonLoader = () => (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="h-10 bg-gray-200 rounded-lg w-64 mb-8 animate-pulse"></div>
        
        {/* Summary cards skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[...Array(3)].map((_, index) => (
            <div key={index} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
        
        {/* Table skeleton */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-6"></div>
          {[...Array(5)].map((_, index) => (
            <div key={index} className="flex justify-between items-center py-4 border-b border-gray-100 last:border-b-0">
              <div className="h-4 bg-gray-200 rounded w-1/3"></div>
              <div className="h-4 bg-gray-200 rounded w-1/6"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  if (loading) return <SkeletonLoader />;

  const totalPresent = attendance.filter((a) => a.status === "Present").length;
  const totalAbsent = attendance.filter((a) => a.status === "Absent").length;
  const totalClasses = attendance.length;
  const attendancePercentage = totalClasses > 0 ? Math.round((totalPresent / totalClasses) * 100) : 0;

  return (
    <Layout>
 <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mr-3 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            Attendance Records
          </h1>
          {subject && (
            <p className="text-gray-600">
              For {subject.subjectName} ({subject.subjectCode})
            </p>
          )}
        </motion.div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
          >
            <div className="flex items-center">
              <div className="bg-green-100 p-3 rounded-lg mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-500">Present</p>
                <p className="text-2xl font-bold text-gray-900">{totalPresent}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
          >
            <div className="flex items-center">
              <div className="bg-red-100 p-3 rounded-lg mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-500">Absent</p>
                <p className="text-2xl font-bold text-gray-900">{totalAbsent}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
            className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
          >
            <div className="flex items-center">
              <div className="bg-indigo-100 p-3 rounded-lg mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-500">Attendance %</p>
                <p className="text-2xl font-bold text-gray-900">{attendancePercentage}%</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Attendance Records */}
        {attendance.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-xl shadow-sm p-8 text-center border border-gray-100"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-1">No attendance records</h3>
            <p className="text-gray-500">Attendance hasn't been recorded for this subject yet.</p>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.4 }}
            className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Class History</h2>
              <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                {attendance.length} class{attendance.length !== 1 ? 'es' : ''}
              </span>
            </div>

            <div className="divide-y divide-gray-100">
              {attendance.map((att, index) => (
                <motion.div
                  key={att.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="py-4 first:pt-0 last:pb-0"
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="text-gray-700">{new Date(att.date).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}</span>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${att.status === "Present" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                      {att.status}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
    </Layout>
   
  );
}