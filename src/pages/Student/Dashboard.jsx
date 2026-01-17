import React, { useEffect, useState, useCallback } from "react";
import { db } from "../../db/firebaseConfig";
import { 
  collection, 
  getDocs, 
  query, 
  where 
} from "firebase/firestore";
import { useAuth } from "../../auth/authProvider";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Layout from '../../components/Layout';
import {
  FaBook,
  FaGraduationCap,
  FaIdCard,
  FaBookmark,
  FaChartBar,
  FaCalendarAlt,
  FaArrowRight,
  FaClock,
  FaMoneyBillWave,
  FaBookOpen,
  FaUsers,
  FaFileAlt,
  FaCalendarDay,
  FaCheckCircle,
  FaInfoCircle,
  FaExternalLinkAlt,
  FaShieldAlt,
  FaCreditCard,
  FaSync,
  FaRocket,
  FaMagic,
  FaTools,
  FaClipboardCheck,
  FaSmile,
  FaFrown,
  FaMeh,
  FaFire,
  FaTrophy,
  FaLightbulb,
  FaReceipt,
  FaChartLine,
  FaUserTie,
  FaBookReader,
  FaBell,
} from "react-icons/fa";

// Feature cards configuration with routes
const FEATURES = [
  {
    id: "library",
    title: "Library Resources",
    description: "Borrowed books, due dates, and library stats",
    icon: FaBookOpen,
    color: "bg-gradient-to-r from-purple-50 to-violet-50",
    iconColor: "text-purple-600",
    badgeColor: "bg-purple-100 text-purple-800",
    badgeText: "Resources",
    statsIcon: FaBookReader,
    route: "/student/library", // Direct route to library
  },
  {
    id: "fees",
    title: "Fee Management",
    description: "Fee payments, pending dues, and payment history",
    icon: FaMoneyBillWave,
    color: "bg-gradient-to-r from-amber-50 to-orange-50",
    iconColor: "text-amber-600",
    badgeColor: "bg-amber-100 text-amber-800",
    badgeText: "Finance",
    statsIcon: FaCreditCard,
    route: "/student/Accounts", // Direct route to fees
  }
];

// Skeleton loader component (same as before)
const SkeletonLoader = () => (
  <div className="p-6 max-w-7xl mx-auto">
    {/* ... same skeleton loader code ... */}
  </div>
);

// Subject card component - UPDATED WITH NAVIGATION
const SubjectCard = ({ subject, index }) => {
  const navigate = useNavigate();

  const handleViewMarks = (e) => {
    e.stopPropagation();
    navigate(`/student/subject/${subject.id}/marks`);
  };

  const handleViewAttendance = (e) => {
    e.stopPropagation();
    navigate(`/student/subject/${subject.id}/attendance`);
  };

  const handleCardClick = () => {
    // Navigate to marks by default when clicking the card
    navigate(`/student/subject/${subject.id}/marks`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 cursor-pointer 
                 transition-all duration-200 hover:shadow-md group overflow-hidden relative"
      onClick={handleCardClick}
    >
      <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-indigo-50 to-purple-50 
                      rounded-full -translate-y-8 translate-x-8 opacity-50 group-hover:opacity-70 
                      transition-opacity duration-300"></div>
      
      <div className="flex items-start justify-between mb-4 relative z-10">
        <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-50 to-purple-50">
          <FaBook className="h-6 w-6 text-indigo-600" />
        </div>
        <span className="text-xs font-medium px-3 py-1 rounded-full bg-green-100 text-green-800">
          {subject.students?.length || 0} students
        </span>
      </div>
      
      <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-indigo-600 
                     transition-colors duration-200 line-clamp-1">
        {subject.subjectName}
      </h3>
      
      <p className="text-gray-600 text-sm mb-4 font-medium">
        {subject.subjectCode}
      </p>
      
      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <button
          onClick={handleViewAttendance}
          className="text-xs font-medium text-blue-600 hover:text-blue-800 px-3 py-1.5 
                   rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors duration-200"
        >
          View Attendance
        </button>
        <button
          onClick={handleViewMarks}
          className="text-xs font-medium text-green-600 hover:text-green-800 px-3 py-1.5 
                   rounded-lg bg-green-50 hover:bg-green-100 transition-colors duration-200"
        >
          View Marks
        </button>
      </div>
    </motion.div>
  );
};

// Feature card component - UPDATED WITH NAVIGATION
const FeatureCard = ({ feature, isActive, stats }) => {
  const navigate = useNavigate();
  const Icon = feature.icon;
  const StatsIcon = feature.statsIcon;

  const handleFeatureClick = () => {
    // Handle navigation based on feature type
    if (feature.route) {
      if (feature.id === 'library') {
        navigate('/student/library');
      } else if (feature.id === 'fees') {
        navigate('/student/Accounts');
      } else if (feature.id === 'marks' || feature.id === 'attendance') {
        // For marks and attendance, we could navigate to the first subject
        // or show a subject selection page. For now, we'll keep it simple.
        navigate(feature.route);
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`${feature.color} rounded-xl p-6 border border-gray-100 cursor-pointer 
                 transition-all duration-200 hover:shadow-lg relative overflow-hidden
                 ${isActive ? 'ring-2 ring-indigo-200' : ''}`}
      onClick={handleFeatureClick}
    >
      <div className="absolute top-0 right-0 w-16 h-16 opacity-10">
        <Icon className="w-full h-full" />
      </div>
      
      <div className="flex items-start justify-between mb-4 relative z-10">
        <div className={`p-3 rounded-xl ${feature.iconColor.replace('text', 'bg')} bg-opacity-20`}>
          <Icon className={`h-6 w-6 ${feature.iconColor}`} />
        </div>
        <span className={`text-xs font-medium px-3 py-1 rounded-full ${feature.badgeColor}`}>
          {feature.badgeText}
        </span>
      </div>
      
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        {feature.title}
      </h3>
      
      <p className="text-gray-600 text-sm mb-4">
        {feature.description}
      </p>
      
      {stats && (
        <div className="mt-4 pt-4 border-t border-gray-200/50">
          <div className="flex items-center gap-2 text-sm text-gray-700">
            <StatsIcon className="h-4 w-4" />
            <span className="font-medium">{stats.label}:</span>
            <span className="font-bold">{stats.value}</span>
          </div>
        </div>
      )}
      
      <div className="flex items-center text-xs text-gray-500 font-medium mt-3">
        Click to view
        <FaArrowRight className="h-3 w-3 ml-1" />
      </div>
    </motion.div>
  );
};

// Stats card component (same as before)
const StatsCard = ({ title, value, icon: Icon, color, change, subtitle }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    className={`${color} rounded-xl p-6 border border-gray-100 shadow-sm`}
  >
    <div className="flex items-center justify-between mb-4">
      <div className="p-2 rounded-lg bg-white/50">
        <Icon className="h-6 w-6" />
      </div>
      {change && (
        <span className={`text-xs font-medium px-2 py-1 rounded-full ${
          change > 0 
            ? 'bg-green-100 text-green-800' 
            : change < 0 
              ? 'bg-red-100 text-red-800' 
              : 'bg-gray-100 text-gray-800'
        }`}>
          {change > 0 ? '+' : ''}{change}%
        </span>
      )}
    </div>
    
    <h4 className="text-2xl font-bold text-gray-900 mb-1">{value}</h4>
    <p className="text-sm text-gray-700">{title}</p>
    {subtitle && (
      <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
    )}
  </motion.div>
);

// Quick action card - UPDATED WITH PROPER LINKS
const QuickActionCard = ({ title, description, icon: Icon, color, link, action }) => {
  const navigate = useNavigate();
  
  const handleClick = () => {
    if (link) {
      navigate(link);
    } else if (action) {
      action();
    }
  };

  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
      onClick={handleClick}
    >
      <div className="flex items-start gap-4">
        <div className={`p-3 rounded-xl ${color}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        <div className="flex-1">
          <h4 className="font-semibold text-gray-900">{title}</h4>
          <p className="text-sm text-gray-600 mt-1">{description}</p>
        </div>
      </div>
      
      <div className="inline-flex items-center text-sm text-indigo-600 font-medium mt-4">
        {link ? 'View details' : 'Take action'}
        <FaExternalLinkAlt className="h-3 w-3 ml-1" />
      </div>
    </motion.div>
  );
};

export default function StudentDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dashboardStats, setDashboardStats] = useState({
    subjects: 0,
    attendance: 0,
    pendingFees: 0,
    libraryBooks: 0,
    upcomingExams: 0,
    pendingAssignments: 0
  });
  
  const [notifications, setNotifications] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [performanceData, setPerformanceData] = useState(null);

  const fetchStudentData = useCallback(async () => {
    if (!user?.uid) return;

    try {
      // Fetch student profile
      const studentQ = query(
        collection(db, "students"),
        where("uid", "==", user.uid)
      );
      const studentSnap = await getDocs(studentQ);

      if (studentSnap.empty) {
        console.warn("No student profile found");
        setSubjects([]);
        return;
      }

      const studentDoc = studentSnap.docs[0];
      const studentData = { id: studentDoc.id, ...studentDoc.data() };
      setStudent(studentData);

      // Fetch all subjects
      const subsSnap = await getDocs(collection(db, "subjects"));
      const mySubjects = subsSnap.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .filter((subj) =>
          subj.students?.some((s) => s.rollNo === studentData.rollNo)
        );

      setSubjects(mySubjects);

      // Fetch dashboard stats
      setDashboardStats({
        subjects: mySubjects.length,
        attendance: 87,
        pendingFees: 12500,
        libraryBooks: 3,
        upcomingExams: 2,
        pendingAssignments: 4
      });

      // Generate notifications
      const notifications = [
        {
          id: 1,
          type: 'warning',
          title: 'Fee Payment Due',
          message: `₹${12500} pending for current semester`,
          time: '2 days ago',
          icon: FaBell,
          color: 'text-amber-600 bg-amber-50'
        },
        {
          id: 2,
          type: 'info',
          title: 'Library Book Due',
          message: '2 books due in next 3 days',
          time: '1 day ago',
          icon: FaBookOpen,
          color: 'text-blue-600 bg-blue-50'
        },
        {
          id: 3,
          type: 'success',
          title: 'Assignment Submitted',
          message: 'Data Structures assignment submitted successfully',
          time: '4 hours ago',
          icon: FaCheckCircle,
          color: 'text-green-600 bg-green-50'
        },
        {
          id: 4,
          type: 'reminder',
          title: 'Upcoming Exam',
          message: 'Mathematics MST1 scheduled for next week',
          time: 'Yesterday',
          icon: FaCalendarDay,
          color: 'text-purple-600 bg-purple-50'
        }
      ];
      setNotifications(notifications);
      
      // Generate recent activity
      const activities = [
        {
          id: 1,
          type: 'attendance',
          title: 'Attendance Marked',
          description: 'Present in Web Development class',
          time: 'Today, 10:30 AM',
          icon: FaCheckCircle,
          color: 'text-green-600'
        },
        {
          id: 2,
          type: 'payment',
          title: 'Fee Payment',
          description: 'Paid ₹5,000 towards tuition fees',
          time: 'Yesterday, 3:45 PM',
          icon: FaCreditCard,
          color: 'text-blue-600'
        },
        {
          id: 3,
          type: 'library',
          title: 'Book Issued',
          description: 'Borrowed "Clean Code" from library',
          time: '2 days ago, 11:20 AM',
          icon: FaBook,
          color: 'text-purple-600'
        },
        {
          id: 4,
          type: 'assignment',
          title: 'Assignment Submitted',
          description: 'Submitted Database Systems project',
          time: '3 days ago, 4:15 PM',
          icon: FaFileAlt,
          color: 'text-amber-600'
        }
      ];
      setRecentActivity(activities);
      
      // Generate performance data
      const performance = {
        overallScore: 82,
        attendanceScore: 87,
        assignmentScore: 78,
        examScore: 85,
        rank: 15,
        totalStudents: 120,
        improvement: 5.2,
        topSubject: mySubjects[0]?.subjectName || 'Mathematics',
        weakSubject: mySubjects[mySubjects.length - 1]?.subjectName || 'Physics'
      };
      setPerformanceData(performance);

    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchStudentData();
  }, [fetchStudentData]);

  const getFeatureStats = (featureId) => {
    switch(featureId) {
      case 'marks':
        return { label: 'Average Score', value: `${performanceData?.overallScore || 0}%` };
      case 'attendance':
        return { label: 'Overall', value: `${dashboardStats.attendance}%` };
      case 'library':
        return { label: 'Books Issued', value: dashboardStats.libraryBooks };
      case 'fees':
        return { label: 'Pending', value: `₹${dashboardStats.pendingFees.toLocaleString()}` };
      default:
        return null;
    }
  };

  const getPerformanceIcon = (score) => {
    if (score >= 80) return { icon: FaSmile, color: 'text-green-600' };
    if (score >= 60) return { icon: FaMeh, color: 'text-amber-600' };
    return { icon: FaFrown, color: 'text-red-600' };
  };

  const handleViewAllNotifications = () => {
    // You can implement a notifications page or show more notifications
    alert('View all notifications feature coming soon!');
  };

  if (loading) return <SkeletonLoader />;

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mb-10"
          >
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8">
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600">
                    <FaGraduationCap className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900">
                      Welcome back, {student?.name || 'Student'}!
                    </h1>
                    <p className="text-gray-600 mt-1">Here's your academic overview</p>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-3 mt-4">
                  <span className="inline-flex items-center px-4 py-2 rounded-full bg-indigo-50 text-indigo-700 text-sm font-medium">
                    <FaIdCard className="h-4 w-4 mr-2" />
                    Roll No: {student?.rollNo}
                  </span>
                  <span className="inline-flex items-center px-4 py-2 rounded-full bg-blue-50 text-blue-700 text-sm font-medium">
                    <FaUsers className="h-4 w-4 mr-2" />
                    {student?.course || 'Computer Science'}
                  </span>
                  <span className="inline-flex items-center px-4 py-2 rounded-full bg-green-50 text-green-700 text-sm font-medium">
                    <FaCalendarDay className="h-4 w-4 mr-2" />
                    Semester {student?.semester || 1}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <button
                  onClick={fetchStudentData}
                  className="inline-flex items-center px-4 py-2.5 text-sm font-medium text-gray-700 
                           bg-white border border-gray-300 rounded-lg hover:bg-gray-50 
                           transition-colors duration-200"
                >
                  <FaSync className="h-4 w-4 mr-2" />
                  Refresh
                </button>
                
                <button 
                  onClick={() => navigate('/student/Accounts')}
                  className="inline-flex items-center px-4 py-2.5 text-sm font-medium text-white 
                           bg-indigo-600 rounded-lg hover:bg-indigo-700 
                           transition-colors duration-200"
                >
                  <FaMagic className="h-4 w-4 mr-2" />
                  Quick Actions
                </button>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatsCard
                title="Enrolled Subjects"
                value={dashboardStats.subjects}
                icon={FaBookmark}
                color="bg-gradient-to-r from-indigo-50 to-indigo-100"
                change={2}
                subtitle="This semester"
              />
              
              <StatsCard
                title="Attendance Rate"
                value={`${dashboardStats.attendance}%`}
                icon={FaClock}
                color="bg-gradient-to-r from-green-50 to-green-100"
                change={3.5}
                subtitle="Above average"
              />
              
              <StatsCard
                title="Pending Fees"
                value={`₹${dashboardStats.pendingFees.toLocaleString()}`}
                icon={FaMoneyBillWave}
                color="bg-gradient-to-r from-amber-50 to-amber-100"
                subtitle="Due this month"
              />
              
              <StatsCard
                title="Upcoming Exams"
                value={dashboardStats.upcomingExams}
                icon={FaCalendarDay}
                color="bg-gradient-to-r from-red-50 to-red-100"
                subtitle="Next 2 weeks"
              />
            </div>
          </motion.div>

          {/* Main Content Grid */}
          <div className="flex justify-center items-center">
            {/* Left Column - Features & Performance */}
            <div className="w-full space-y-10">
              {/* Performance Overview */}
              {performanceData && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 }}
                  className="bg-white rounded-2xl shadow-xl p-6 border border-gray-200"
                >
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-xl font-bold text-gray-900 flex items-center gap-3">
                        <FaTrophy className="h-6 w-6 text-amber-600" />
                        Academic Performance
                      </h2>
                      <p className="text-gray-600 mt-1">Your overall academic standing</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <FaFire className="h-5 w-5 text-red-500" />
                      <span className="text-sm font-medium text-gray-700">
                        Rank #{performanceData.rank} of {performanceData.totalStudents}
                      </span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    {[
                      { label: 'Overall Score', value: `${performanceData.overallScore}%`, color: 'indigo' },
                      { label: 'Attendance', value: `${performanceData.attendanceScore}%`, color: 'green' },
                      { label: 'Assignments', value: `${performanceData.assignmentScore}%`, color: 'blue' },
                      { label: 'Exams', value: `${performanceData.examScore}%`, color: 'purple' },
                    ].map((stat, index) => {
                      const { icon: PerformanceIcon, color: iconColor } = getPerformanceIcon(stat.value);
                      return (
                        <div key={index} className="text-center p-4 rounded-xl bg-gray-50">
                          <PerformanceIcon className={`h-8 w-8 mx-auto mb-2 ${iconColor}`} />
                          <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                          <div className="text-sm text-gray-600">{stat.label}</div>
                        </div>
                      );
                    })}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200">
                      <div className="flex items-center gap-3">
                        <FaLightbulb className="h-5 w-5 text-green-600" />
                        <div>
                          <p className="font-medium text-green-800">Strongest Subject</p>
                          <p className="text-lg font-bold">{performanceData.topSubject}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-4 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200">
                      <div className="flex items-center gap-3">
                        <FaTools className="h-5 w-5 text-amber-600" />
                        <div>
                          <p className="font-medium text-amber-800">Needs Attention</p>
                          <p className="text-lg font-bold">{performanceData.weakSubject}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

 {/* Enrolled Subjects */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.3 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Enrolled Subjects</h2>
                    <p className="text-gray-600">Your current semester subjects</p>
                  </div>
                  <span className="px-3 py-1.5 bg-indigo-100 text-indigo-800 rounded-full text-sm font-medium">
                    {subjects.length} subject{subjects.length !== 1 ? 's' : ''}
                  </span>
                </div>

                {subjects.length === 0 ? (
                  <div className="bg-white rounded-2xl p-12 text-center border border-gray-200 shadow-sm">
                    <FaBook className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      No subjects enrolled
                    </h3>
                    <p className="text-gray-600">
                      You haven't been enrolled in any subjects for this semester.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {subjects.map((subject, index) => (
                      <SubjectCard
                        key={subject.id}
                        subject={subject}
                        index={index}
                      />
                    ))}
                  </div>
                )}
              </motion.div>
              
              {/* Features Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Academic Features</h2>
                    <p className="text-gray-600">Access all your academic tools in one place</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {FEATURES.map((feature) => (
                    <FeatureCard
                      key={feature.id}
                      feature={feature}
                      stats={getFeatureStats(feature.id)}
                    />
                  ))}
                </div>
              </motion.div>

             
            </div>
          </div>

          {/* Footer Status */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.5 }}
            className="mt-10"
          >
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-6 border border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-indigo-100 mb-3">
                    <FaShieldAlt className="h-6 w-6 text-indigo-600" />
                  </div>
                  <h4 className="font-bold text-gray-900">Secure & Private</h4>
                  <p className="text-sm text-gray-600 mt-1">Your data is protected with encryption</p>
                </div>
                
                <div className="text-center p-4">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-100 mb-3">
                    <FaRocket className="h-6 w-6 text-green-600" />
                  </div>
                  <h4 className="font-bold text-gray-900">Fast Performance</h4>
                  <p className="text-sm text-gray-600 mt-1">Instant access to all your data</p>
                </div>
                
                <div className="text-center p-4">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 mb-3">
                    <FaInfoCircle className="h-6 w-6 text-blue-600" />
                  </div>
                  <h4 className="font-bold text-gray-900">24/7 Support</h4>
                  <p className="text-sm text-gray-600 mt-1">Help available anytime you need</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
}