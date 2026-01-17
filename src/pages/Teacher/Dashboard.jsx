import React, { useEffect, useState } from "react";
import { db } from "../../db/firebaseConfig";
import { collection, getDocs, query, where, getDoc, doc } from "firebase/firestore";
import { Link } from "react-router-dom";
import {
  FaBook,
  FaClipboardList,
  FaChartBar,
  FaUserTie,
  FaCalendarCheck,
  FaGraduationCap,
  FaMoneyBillWave,
  FaUniversity,
  FaBookReader,
  FaFileInvoice,
  FaChartLine,
  FaLock,
  FaUnlock,
} from "react-icons/fa";
import { useAuth } from "../../auth/authProvider";
import Layout from "../../components/Layout";

export default function TeacherDashboard() {
  const [subjects, setSubjects] = useState([]);
  const [attendanceStats, setAttendanceStats] = useState({
    total: 0,
    marked: 0,
  });
  const { user } = useAuth();
  const [teacher, setTeacher] = useState(null);
  const [permissions, setPermissions] = useState({
    isAccountHandler: false,
    isLibrarian: false,
    isAdmin: false,
    hasAccountAccess: false,
    hasLibraryAccess: false,
  });

  useEffect(() => {
    const fetchTeacherData = async () => {
      if (!user?.uid) return;

      try {
        const teachersRef = collection(db, "teachers");
        const teacherQuery = query(teachersRef, where("uid", "==", user.uid));
        const teacherSnapshot = await getDocs(teacherQuery);

        if (teacherSnapshot.empty) return;

        const teacherData = teacherSnapshot.docs[0].data();
        const teacherId = teacherData.id;

        setTeacher(teacherData);

        // Check permissions
        const isAccountHandler = teacherData.accountHandler || false;
        const isLibrarian = teacherData.isLibrarian || false;
        const isAdmin = teacherData.isAdmin || false;

        setPermissions({
          isAccountHandler,
          isLibrarian,
          isAdmin,
          hasAccountAccess: isAccountHandler || isAdmin,
          hasLibraryAccess: isLibrarian || isAdmin,
        });

        const subjectsRef = collection(db, "subjects");
        const subjectSnapshot = await getDocs(subjectsRef);

        const subjectsData = subjectSnapshot.docs
          .map((doc) => ({ id: doc.id, ...doc.data() }))
          .filter((subj) => subj.teachers?.some((t) => t.id === teacherId));

        setSubjects(subjectsData);

        let totalSessions = 0;
        let markedSessions = 0;

        for (const subject of subjectsData) {
          const attendanceRef = collection(
            db,
            "subjects",
            subject.id,
            "attendance"
          );
          const attendanceSnapshot = await getDocs(attendanceRef);
          markedSessions += attendanceSnapshot.size;
          totalSessions += attendanceSnapshot.size > 15 ? attendanceSnapshot.size : 15;
        }

        setAttendanceStats({ total: totalSessions, marked: markedSessions });
      } catch (error) {
        console.error("Error fetching teacher data:", error);
      }
    };

    fetchTeacherData();
  }, [user]);

  const attendancePercentage =
    attendanceStats.total > 0
      ? Math.round((attendanceStats.marked / attendanceStats.total) * 100)
      : 0;

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* ===================== HEADER ===================== */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Welcome, {teacher?.name || "Teacher"}
            </h1>
            <p className="text-gray-600">
              Your dashboard overview
              {permissions.isAccountHandler && " • Account Handler"}
              {permissions.isLibrarian && " • Librarian"}
            </p>
          </div>

          {/* ===================== STATS CARDS ===================== */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            {[
              {
                title: "Teaching Subjects",
                value: subjects.length,
                icon: <FaBook />,
                color: "blue",
                bgColor: "from-blue-500 to-blue-600",
              },
              {
                title: "Attendance Sessions",
                value: `${attendanceStats.marked}/${attendanceStats.total}`,
                icon: <FaCalendarCheck />,
                color: "green",
                bgColor: "from-green-500 to-green-600",
              },
              {
                title: "Completion Rate",
                value: `${attendancePercentage}%`,
                icon: <FaChartBar />,
                color: "purple",
                bgColor: "from-purple-500 to-purple-600",
              },
            ].map((item, i) => (
              <div
                key={i}
                className={`bg-gradient-to-r ${item.bgColor} text-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1`}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-sm font-medium opacity-90 mb-2">
                      {item.title}
                    </h2>
                    <p className="text-3xl font-bold">
                      {item.value}
                    </p>
                  </div>
                  <div
                    className={`w-12 h-12 flex items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm text-white text-xl`}
                  >
                    {item.icon}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* ===================== MAIN CONTENT ===================== */}
            <div className="lg:col-span-2 space-y-6">
              {/* Subjects Section */}
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
                  <FaBook className="mr-2 text-blue-600" />
                  My Subjects
                </h2>

                {subjects.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {subjects.map((subject) => (
                      <div
                        key={subject.id}
                        className="border border-gray-200 rounded-xl p-5 hover:border-blue-400 hover:shadow-md transition-all duration-300 hover:bg-blue-50 group"
                      >
                        <h3 className="font-semibold text-gray-800 mb-1">
                          {subject.subjectName}
                        </h3>
                        <p className="text-sm text-gray-500">
                          Code: {subject.subjectCode}
                        </p>

                        <div className="flex justify-between items-center mt-4">
                          <span className="text-xs px-3 py-1 bg-blue-100 text-blue-800 rounded-full">
                            {subject.credits || 3} Credits
                          </span>
                          <Link
                            to={`/teacher/subject/${subject.id}`}
                            className="text-sm font-medium text-blue-600 hover:text-blue-800 flex items-center group-hover:translate-x-1 transition-transform"
                          >
                            View Details <span className="ml-1">→</span>
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10">
                    <FaBook className="mx-auto text-4xl text-gray-300 mb-3" />
                    <p className="text-gray-500">No subjects assigned yet</p>
                  </div>
                )}
              </div>

              {/* Special Features Section */}
              {(permissions.hasAccountAccess || permissions.hasLibraryAccess) && (
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                  <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
                    <FaUniversity className="mr-2 text-blue-600" />
                    Special Access Features
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Account Admin Feature */}
                    {permissions.hasAccountAccess && (
                      <Link
                        to="/admin/accounts"
                        className="border border-green-200 rounded-xl p-5 hover:border-green-400 hover:shadow-md transition-all duration-300 hover:bg-green-50 group"
                      >
                        <div className="flex items-center mb-3">
                          <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-green-100 text-green-600 mr-3">
                            <FaMoneyBillWave />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-800 group-hover:text-green-700">
                              Account Management
                            </h3>
                            <p className="text-xs text-gray-500">
                              {permissions.isAdmin ? "Administrator" : "Account Handler"}
                            </p>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">
                          Manage student fees, teacher salaries, and financial reports
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center text-green-600 text-sm font-medium">
                            Access System <span className="ml-1">→</span>
                          </div>
                          <FaLock className="text-green-500" />
                        </div>
                      </Link>
                    )}

                    {/* Library Feature */}
                    {permissions.hasLibraryAccess && (
                      <Link
                        to="/teacher/library"
                        className="border border-purple-200 rounded-xl p-5 hover:border-purple-400 hover:shadow-md transition-all duration-300 hover:bg-purple-50 group"
                      >
                        <div className="flex items-center mb-3">
                          <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-purple-100 text-purple-600 mr-3">
                            <FaBookReader />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-800 group-hover:text-purple-700">
                              Library Management
                            </h3>
                            <p className="text-xs text-gray-500">
                              {permissions.isAdmin ? "Administrator" : "Librarian"}
                            </p>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">
                          Issue/return books, manage inventory, and track overdue items
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center text-purple-600 text-sm font-medium">
                            Access System <span className="ml-1">→</span>
                          </div>
                          <FaLock className="text-purple-500" />
                        </div>
                      </Link>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* ===================== SIDEBAR ===================== */}
            <div className="space-y-6">
              {/* Quick Actions */}
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-5 flex items-center">
                  <FaClipboardList className="mr-2 text-blue-600" />
                  Quick Actions
                </h2>

                <div className="space-y-4">
                  {[
                    {
                      to: "/teacher/mark-attendance",
                      title: "Mark Attendance",
                      desc: "Record student attendance status",
                      icon: <FaCalendarCheck />,
                      color: "blue"
                    },
                    {
                      to: "/teacher/mark-marks",
                      title: "Record Marks",
                      desc: "Enter exam and assignment scores",
                      icon: <FaGraduationCap />,
                      color: "green"
                    },
                  ].map((item, i) => (
                    <Link
                      key={i}
                      to={item.to}
                      className={`flex items-center gap-4 p-4 rounded-xl border border-${item.color}-100 bg-${item.color}-50 hover:bg-${item.color}-100 transition-all duration-300 group`}
                    >
                      <div className={`w-10 h-10 flex items-center justify-center rounded-lg bg-${item.color}-100 text-${item.color}-600`}>
                        {item.icon}
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-800 group-hover:text-${item.color}-700">
                          {item.title}
                        </h3>
                        <p className="text-sm text-gray-500">{item.desc}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Profile Card */}
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                  <FaUserTie className="mr-2 text-blue-600" />
                  Profile
                </h2>

                <div className="flex items-center mb-6">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 text-white flex items-center justify-center text-lg font-semibold mr-4">
                    {teacher?.name ? teacher.name[0].toUpperCase() : "T"}
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-800">
                      {teacher?.name || "Teacher Name"}
                    </h3>
                    <p className="text-sm text-gray-500">Faculty Member</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {permissions.isAccountHandler && (
                        <span className="text-xs px-2 py-0.5 bg-green-100 text-green-800 rounded-full">
                          Account Handler
                        </span>
                      )}
                      {permissions.isLibrarian && (
                        <span className="text-xs px-2 py-0.5 bg-purple-100 text-purple-800 rounded-full">
                          Librarian
                        </span>
                      )}
                      {permissions.isAdmin && (
                        <span className="text-xs px-2 py-0.5 bg-red-100 text-red-800 rounded-full">
                          Administrator
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-3 text-sm">
                  {[
                    ["Employee ID", teacher?.id],
                    ["Email", teacher?.email || user?.email],
                    ["Department", teacher?.department],
                    ["Teaching Subjects", subjects.length],
                  ].map(([label, value], i) => (
                    <div key={i} className="flex justify-between">
                      <span className="text-gray-500">{label}</span>
                      <span className="font-medium text-gray-800">
                        {value || "Not specified"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* System Status */}
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                  <FaChartLine className="mr-2 text-blue-600" />
                  System Status
                </h2>

                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center">
                      <FaBook className="text-blue-600 mr-3" />
                      <span>Total Subjects</span>
                    </div>
                    <span className="font-bold">{subjects.length}</span>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center">
                      <FaCalendarCheck className="text-green-600 mr-3" />
                      <span>Attendance Recorded</span>
                    </div>
                    <span className="font-bold">{attendancePercentage}%</span>
                  </div>

                  {permissions.hasAccountAccess ? (
                    <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                      <div className="flex items-center">
                        <FaMoneyBillWave className="text-green-600 mr-3" />
                        <span>Account System</span>
                      </div>
                      <div className="flex items-center">
                        <FaUnlock className="text-green-600 mr-2" />
                        <span className="text-xs text-green-800">Access Granted</span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        <FaMoneyBillWave className="text-gray-400 mr-3" />
                        <span className="text-gray-500">Account System</span>
                      </div>
                      <div className="flex items-center">
                        <FaLock className="text-gray-400 mr-2" />
                        <span className="text-xs text-gray-500">Restricted</span>
                      </div>
                    </div>
                  )}

                  {permissions.hasLibraryAccess ? (
                    <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                      <div className="flex items-center">
                        <FaBookReader className="text-purple-600 mr-3" />
                        <span>Library System</span>
                      </div>
                      <div className="flex items-center">
                        <FaUnlock className="text-purple-600 mr-2" />
                        <span className="text-xs text-purple-800">Access Granted</span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        <FaBookReader className="text-gray-400 mr-3" />
                        <span className="text-gray-500">Library System</span>
                      </div>
                      <div className="flex items-center">
                        <FaLock className="text-gray-400 mr-2" />
                        <span className="text-xs text-gray-500">Restricted</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>
        </main>
      </div>
    </Layout>
  );
}