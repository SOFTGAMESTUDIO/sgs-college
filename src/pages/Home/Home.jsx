import React, { useEffect, useState } from "react";
import { useAuth } from "../../auth/authProvider";
import { db } from "../../db/firebaseConfig";
import { collection, getDocs, query, where } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import Layout from "../../components/Layout";
import {
  AcademicCapIcon,
  UserGroupIcon,
  ChartBarIcon,
  ClipboardDocumentCheckIcon,
  ClockIcon,
  CalendarIcon,
  ArrowRightIcon,
  BuildingLibraryIcon,
  BookOpenIcon,
  ChartPieIcon,
  UserCircleIcon,
  ShieldCheckIcon,
  ComputerDesktopIcon,
} from "@heroicons/react/24/outline";

const HomePage = () => {
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState({ students: 0, teachers: 0, subjects: 0 });

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user?.uid || !user?.email || isAdmin) return;

      try {
        let collectionName = "";
        if (user.email.includes("@sgsteacher.com")) {
          collectionName = "teachers";
        } else if (user.email.includes("@sgs.com")) {
          collectionName = "students";
        } else {
          return;
        }

        const ref = collection(db, collectionName);
        const q = query(ref, where("uid", "==", user.uid));
        const snapshot = await getDocs(q);

        if (!snapshot.empty) {
          setProfile(snapshot.docs[0].data());
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      }
    };

    const fetchStats = async () => {
      try {
        const teachersSnapshot = await getDocs(collection(db, "teachers"));
        const studentsSnapshot = await getDocs(collection(db, "students"));
        const subjectsSnapshot = await getDocs(collection(db, "subjects"));

        setStats({
          students: studentsSnapshot.size,
          teachers: teachersSnapshot.size,
          subjects: subjectsSnapshot.size,
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
      }
    };

    if (user) {
      fetchProfile();
      fetchStats();
    }
  }, [user, isAdmin]);

  const role = isAdmin
    ? "admin"
    : user?.email?.includes("@sgsteacher.com")
    ? "teacher"
    : user?.email?.includes("@sgs.com")
    ? "student"
    : null;

  // College feature cards
  const collegeFeatures = [
    {
      title: "Digital Administration",
      description: "Streamlined management of academic programs, faculty, and student records",
      icon: <BuildingLibraryIcon className="h-10 w-10 text-blue-600" />,
      color: "bg-blue-50",
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      title: "Smart Attendance",
      description: "AI-powered attendance tracking with real-time analytics and reporting",
      icon: <ClipboardDocumentCheckIcon className="h-10 w-10 text-emerald-600" />,
      color: "bg-emerald-50",
      gradient: "from-emerald-500 to-green-500",
    },
    {
      title: "Academic Portal",
      description: "Integrated platform for course materials, assignments, and grades",
      icon: <BookOpenIcon className="h-10 w-10 text-violet-600" />,
      color: "bg-violet-50",
      gradient: "from-violet-500 to-purple-500",
    },
  ];

  const collegeStats = [
    {
      label: "Academic Programs",
      value: "50+",
      description: "Undergraduate & Graduate",
      icon: <AcademicCapIcon className="h-8 w-8" />,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      label: "Faculty Members",
      value: "200+",
      description: "Expert Educators",
      icon: <UserGroupIcon className="h-8 w-8" />,
      color: "text-emerald-600",
      bgColor: "bg-emerald-100",
    },
    {
      label: "Student Success",
      value: "96%",
      description: "Graduation Rate",
      icon: <ChartPieIcon className="h-8 w-8" />,
      color: "text-amber-600",
      bgColor: "bg-amber-100",
    },
    {
      label: "Campus Technology",
      value: "100%",
      description: "Digital Classrooms",
      icon: <ComputerDesktopIcon className="h-8 w-8" />,
      color: "text-violet-600",
      bgColor: "bg-violet-100",
    },
  ];

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
     

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 bg-whi">
          {/* Hero Section */}
          <div className="py-12 md:py-20 text-center">
            <div className="max-w-4xl mx-auto">
              <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-blue-900">
                  Smart College System
                </span>
              </h1>
              <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
                Transforming education through innovative technology and data-driven insights
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => navigate("/about")}
                  className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-blue-700 hover:bg-blue-800 md:text-lg"
                >
                  Explore Campus
                </button>
                <button
                  onClick={() => navigate("/admissions")}
                  className="inline-flex items-center justify-center px-8 py-3 border-2 border-blue-700 text-base font-medium rounded-lg text-blue-700 hover:bg-blue-50 md:text-lg"
                >
                  Admissions 2024
                </button>
              </div>
            </div>
          </div>

          {/* College Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
            {collegeStats.map((stat, index) => (
              <div key={index} className="bg-white rounded-xl shadow-md p-6 text-center border border-gray-100">
                <div className={`inline-flex p-3 rounded-lg ${stat.bgColor} ${stat.color} mb-4`}>
                  {stat.icon}
                </div>
                <div className="text-3xl font-bold text-gray-900">{stat.value}</div>
                <div className="text-sm font-semibold text-gray-700 mt-1">{stat.label}</div>
                <div className="text-xs text-gray-500 mt-1">{stat.description}</div>
              </div>
            ))}
          </div>

          {/* College Features */}
          <div className="mb-20">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900">Digital Campus Experience</h2>
              <p className="text-gray-600 mt-3 max-w-2xl mx-auto">
                Our integrated platform brings together administration, teaching, and learning in one seamless ecosystem
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {collegeFeatures.map((feature, index) => (
                <div key={index} className="group relative">
                  <div className={`absolute -inset-0.5 bg-gradient-to-r ${feature.gradient} rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-300`}></div>
                  <div className="relative bg-white rounded-xl shadow-lg p-8 h-full border border-gray-100">
                    <div className={`rounded-2xl p-4 inline-flex ${feature.color} mb-6`}>
                      {feature.icon}
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                    <p className="text-gray-600 mb-6">{feature.description}</p>
                    <div className="text-blue-600 font-medium inline-flex items-center group-hover:translate-x-2 transition-transform">
                      Learn more
                      <ArrowRightIcon className="h-4 w-4 ml-2" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Authenticated Dashboard Section */}
          {user && (
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl shadow-xl p-8 mb-16">
              <div className="max-w-4xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      Welcome to SGS College Portal
                    </h2>
                    <p className="text-gray-600 flex items-center mt-1">
                      <UserCircleIcon className="h-5 w-5 mr-2" />
                      {profile?.name || user.displayName || role} • {user.email}
                    </p>
                  </div>
                  <span className="bg-blue-100 text-blue-800 text-sm font-semibold px-4 py-2 rounded-full uppercase">
                    {role} Portal
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="bg-white rounded-xl p-6 shadow-sm border">
                    <div className="flex items-center mb-4">
                      <div className="bg-blue-100 p-3 rounded-lg">
                        <UserGroupIcon className="h-6 w-6 text-blue-600" />
                      </div>
                      <div className="ml-4">
                        <div className="text-2xl font-bold text-gray-900">{stats.students}</div>
                        <div className="text-sm text-gray-600">Students</div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl p-6 shadow-sm border">
                    <div className="flex items-center mb-4">
                      <div className="bg-emerald-100 p-3 rounded-lg">
                        <AcademicCapIcon className="h-6 w-6 text-emerald-600" />
                      </div>
                      <div className="ml-4">
                        <div className="text-2xl font-bold text-gray-900">{stats.teachers}</div>
                        <div className="text-sm text-gray-600">Faculty</div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl p-6 shadow-sm border">
                    <div className="flex items-center mb-4">
                      <div className="bg-violet-100 p-3 rounded-lg">
                        <BookOpenIcon className="h-6 w-6 text-violet-600" />
                      </div>
                      <div className="ml-4">
                        <div className="text-2xl font-bold text-gray-900">{stats.subjects}</div>
                        <div className="text-sm text-gray-600">Courses</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    onClick={() => navigate(`/${role}/dashboard`)}
                    className="flex-1 bg-gradient-to-r from-blue-700 to-blue-800 text-white font-semibold py-4 px-6 rounded-xl hover:shadow-lg transition-all duration-200 flex items-center justify-center"
                  >
                    Access {role.charAt(0).toUpperCase() + role.slice(1)} Dashboard
                    <ArrowRightIcon className="h-5 w-5 ml-2" />
                  </button>
                  
                  {role === "admin" && (
                    <button
                      onClick={() => navigate("/teacher/dashboard")}
                      className="flex-1 bg-white text-blue-700 font-semibold py-4 px-6 rounded-xl border-2 border-blue-700 hover:bg-blue-50 transition-all duration-200 flex items-center justify-center"
                    >
                      Faculty Dashboard
                      <ArrowRightIcon className="h-5 w-5 ml-2" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Footer Banner */}
          <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl text-white p-10 mb-10">
            <div className="max-w-4xl mx-auto text-center">
              <AcademicCapIcon className="h-16 w-16 mx-auto text-blue-300 mb-6" />
              <h3 className="text-2xl font-bold mb-4">Join Our Academic Community</h3>
              <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
                SGS College offers world-class education with cutting-edge technology infrastructure
                and a commitment to student success
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button className="bg-white text-gray-900 font-semibold py-3 px-8 rounded-lg hover:bg-gray-100">
                  Virtual Campus Tour
                </button>
                <button className="bg-transparent border-2 border-white text-white font-semibold py-3 px-8 rounded-lg hover:bg-white/10">
                  Contact Admissions
                </button>
              </div>
            </div>
          </div>
        </main>

    
      </div>
    </Layout>
  );
};

export default HomePage;