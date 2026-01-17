/**
 * Main Application Router
 * Defines all routes and route protection for the Student Attendance System
 */

import React from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";

import { useAuth } from "./auth/authProvider.jsx";

// ✅ Basic Pages
import HomePage from "./pages/Home/Home.jsx";
import Login from "./pages/Registration/Login.jsx";

// ✅ Admin Pages
import AdminDashboard from "./pages/AcademicDepartments/Dashboard.jsx";
import ManageTeachers from "./pages/AcademicDepartments/ManageTeachers.jsx";
import ManageStudents from "./pages/AcademicDepartments/ManageStudents.jsx";
import ManageSubjects from "./pages/AcademicDepartments/ManageSubjects.jsx";
import SubjectManagement from "./pages/AcademicDepartments/DisplaySubject.jsx";

// ✅ Teacher Pages
import TeacherDashboard from "./pages/Teacher/Dashboard.jsx";
import AttendanceSummaryPage from "./pages/Teacher/ViewReports.jsx";
import MarkAttendance from "./pages/Teacher/MarkAttendance.jsx";

// ✅ Student Pages
import MySubjects from './pages/Student/Dashboard.jsx'
import SubjectAttendance from './pages/Student/MySubjects.jsx'
import MarkMarks from "./pages/Teacher/MarkMarks.jsx";
import SubjectMarksChart from "./pages/Student/SubjectMarksChart.jsx";
import LibraryAdmin from "./pages/AcademicDepartments/LibraryAdmin.jsx";
import LibraryTeacher from "./pages/Teacher/LibraryTeacher.jsx";
import LibraryStudent from "./pages/Student/LibraryStudent.jsx";
import AccountsAdmin from "./pages/AcademicDepartments/AccountsAdmin.jsx";
import AccountsTeacher from "./pages/Teacher/AccountsTeacher.jsx";
import StudentFees from "./pages/Student/StudentFees.jsx";
import ProfilePage from "./pages/Profile/Profile.jsx";
import NoPage from "./pages/NoPage/NoPage.jsx";
import AboutPage from "./pages/Customer page/AboutUs.jsx";
import AdmissionsPage from "./pages/Customer page/Admision.jsx";


function App() {
  return (
    <Router>
      <Routes>
        {/* ---------------- Basic Routes ---------------- */}

        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<Login />} />
        
        <Route path="/about" element={<AboutPage />} />
        <Route path="/admissions" element={<AdmissionsPage />} />
          
<Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage/>
            </ProtectedRoute>
          }
        />


        
        {/* ---------------- Admin Routes ---------------- */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRouteForAdmin>
              <AdminDashboard />
            </ProtectedRouteForAdmin>
          }
        />
        <Route
          path="/admin/manage-teachers"
          element={
            <ProtectedRouteForAdmin>
              <ManageTeachers />
            </ProtectedRouteForAdmin>
          }
        />
        <Route
          path="/admin/manage-students"
          element={
            <ProtectedRouteForAdmin>
              <ManageStudents />
            </ProtectedRouteForAdmin>
          }
        />

        <Route
          path="/admin/display-subjects"
          element={
            <ProtectedRouteForAdmin>
              <SubjectManagement />
            </ProtectedRouteForAdmin>
          }
        />

        <Route
          path="/admin/add-subjects"
          element={
            <ProtectedRouteForAdmin>
              <ManageSubjects />
            </ProtectedRouteForAdmin>
          }
        />
        <Route
          path="/admin/library"
          element={
            <ProtectedRouteForAdmin>
              <LibraryAdmin />
            </ProtectedRouteForAdmin>
          }
        />
        <Route
          path="/admin/Accounts"
          element={
            <ProtectedRouteForAdmin>
              <AccountsAdmin />
            </ProtectedRouteForAdmin>
          }
        />

        {/* ---------------- Teacher Routes ---------------- */}
        <Route
          path="/teacher/dashboard"
          element={
            <ProtectedRouteForTeacher>
              <TeacherDashboard />
            </ProtectedRouteForTeacher>
          }
        />
        <Route
          path="/teacher/subject/:id"
          element={
            <ProtectedRouteForTeacher>
              <AttendanceSummaryPage />
            </ProtectedRouteForTeacher>
          }
        />
        <Route
          path="/teacher/mark-attendance"
          element={
            <ProtectedRouteForTeacher>
              <MarkAttendance />
            </ProtectedRouteForTeacher>
          }
        />
        <Route
          path="/teacher/mark-marks"
          element={
            <ProtectedRouteForTeacher>
              <MarkMarks />
            </ProtectedRouteForTeacher>
          }
        />
        <Route
          path="/teacher/library"
          element={
            <ProtectedRouteForTeacher>
              <LibraryTeacher/>
            </ProtectedRouteForTeacher>
          }
        />
<Route
          path="/teacher/Accounts"
          element={
            <ProtectedRouteForTeacher>
              <AccountsTeacher/>
            </ProtectedRouteForTeacher>
          }
        />



       

        {/* ---------------- Student Routes ---------------- */}
        <Route
          path="/student/dashboard"
          element={
            <ProtectedRoute>
              <MySubjects />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/subject/:id/attendance"
          element={
            <ProtectedRoute>
              <SubjectAttendance />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/subject/:id/marks"
          element={
            <ProtectedRoute>
              <SubjectMarksChart />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/library"
          element={
            <ProtectedRoute>
              <LibraryStudent />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/Accounts"
          element={
            <ProtectedRoute>
              <StudentFees/>
            </ProtectedRoute>
          }
        />
        {/* Default Route */}
        <Route path="*" element={<NoPage/>} />
      </Routes>
    </Router>
  );
}

export default App;

/* ✅ Protected Routes */

/**
 * Protected Route Component
 * Allows access only to authenticated users (any role)
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to render if authenticated
 * @returns {JSX.Element} Children if authenticated, otherwise redirects to login
 */
export const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>; // ⏳ prevent instant redirect
  }

  return user ? children : <Navigate to="/login" />;
};

export const ProtectedRouteForTeacher = ({ children }) => {
  const { user, isTeacher, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>; // ⏳ prevent instant redirect
  }

  return user && isTeacher ? children : <Navigate to="/login" />;
};


/**
 * Admin Protected Route Component
 * Allows access only to users with admin privileges
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to render if user is admin
 * @returns {JSX.Element} Children if admin, otherwise redirects to login
 */
export const ProtectedRouteForAdmin = ({ children }) => {
  const { isAdmin, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>; // ⏳ prevent instant redirect
  }

  return isAdmin ? children : <Navigate to="/login" />;
};

/**
 * Private Route Component
 * Similar to ProtectedRoute - allows access to authenticated users
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to render if authenticated
 * @returns {JSX.Element} Children if authenticated, otherwise redirects to login
 */
export const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>; // ⏳ prevent instant redirect
  }

  return user ? children : <Navigate to="/login" />;
};
