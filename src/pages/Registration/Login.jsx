// src/pages/Login.jsx
import { useState } from "react";
import { auth } from "../../db/firebaseConfig";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import Layout from "../../components/Layout";
import {
  AcademicCapIcon,
  UserCircleIcon,
  LockClosedIcon,
  IdentificationIcon,
  ShieldCheckIcon,
  BuildingLibraryIcon,
} from "@heroicons/react/24/outline";

const Login = () => {
  const [rollNo, setRollNo] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [userType, setUserType] = useState("student"); // 'student' or 'staff'
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      // Build email based on user type
      const email =
        userType === "student"
          ? `${rollNo}@sgs.com`
          : `${rollNo}@sgsteacher.com`;

      await signInWithEmailAndPassword(auth, email, password);
      navigate("/");
    } catch (err) {
      // User-friendly error messages
      switch (err.code) {
        case "auth/user-not-found":
          setError("Account not found. Please check your credentials.");
          break;
        case "auth/wrong-password":
          setError("Incorrect password. Please try again.");
          break;
        case "auth/invalid-email":
          setError("Invalid email format. Please check your ID.");
          break;
        case "auth/too-many-requests":
          setError("Too many failed attempts. Please try again later.");
          break;
        case "auth/network-request-failed":
          setError("Network error. Please check your internet connection.");
          break;
        default:
          setError("Login failed. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center p-4">
        <div className="w-full max-w-6xl flex flex-col lg:flex-row rounded-2xl overflow-hidden shadow-2xl">
          {/* Left Panel - College Information */}
          <div className="lg:w-2/5 bg-gradient-to-br from-blue-900 to-blue-800 text-white p-8 lg:p-12">
            <div className="h-full flex flex-col justify-between">
              <div>
                <div className="flex items-center space-x-3 mb-8">
                  <div className="bg-white/10 p-3 rounded-xl backdrop-blur-sm">
                    <AcademicCapIcon className="h-10 w-10" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold">SGS College</h1>
                    <p className="text-blue-200 text-sm">Smart College System</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <h2 className="text-3xl font-bold leading-tight">
                    Welcome to the Future of Education
                  </h2>
                  <p className="text-blue-100">
                    Access your academic dashboard, attendance records, and course materials all in one place.
                  </p>
                </div>

                <div className="mt-12 space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="bg-white/20 p-2 rounded-lg">
                      <ShieldCheckIcon className="h-6 w-6" />
                    </div>
                    <div>
                      <h4 className="font-semibold">Secure Access</h4>
                      <p className="text-sm text-blue-200">Enterprise-grade security for all your academic data</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="bg-white/20 p-2 rounded-lg">
                      <BuildingLibraryIcon className="h-6 w-6" />
                    </div>
                    <div>
                      <h4 className="font-semibold">Digital Campus</h4>
                      <p className="text-sm text-blue-200">Complete digital transformation of academic processes</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-12 pt-6 border-t border-blue-700">
                <p className="text-sm text-blue-200">
                  Need help? Contact IT Support at 
                  <a href="mailto:support@sgs.edu" className="text-white font-medium ml-1 hover:underline">
                    support@sgs.edu
                  </a>
                </p>
              </div>
            </div>
          </div>

          {/* Right Panel - Login Form */}
          <div className="lg:w-3/5 bg-white p-8 lg:p-12">
            <div className="max-w-md mx-auto">
              <div className="text-center mb-10">
                <div className="inline-flex items-center justify-center p-4 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full mb-6">
                  <LockClosedIcon className="h-12 w-12 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  Secure Login Portal
                </h2>
                <p className="text-gray-600">
                  Sign in to access your academic dashboard
                </p>
              </div>

              {/* User Type Selection */}
              <div className="flex mb-8">
                <div className="flex-1 grid grid-cols-2 gap-2 p-1 bg-gray-100 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setUserType("student")}
                    className={`py-4 px-6 rounded-xl text-center transition-all duration-200 ${
                      userType === "student"
                        ? "bg-white shadow-lg border border-blue-200 text-blue-700"
                        : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex flex-col items-center">
                      <UserCircleIcon className={`h-8 w-8 mb-2 ${userType === "student" ? "text-blue-600" : "text-gray-400"}`} />
                      <span className="font-medium">Student</span>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setUserType("staff")}
                    className={`py-4 px-6 rounded-xl text-center transition-all duration-200 ${
                      userType === "staff"
                        ? "bg-white shadow-lg border border-blue-200 text-blue-700"
                        : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex flex-col items-center">
                      <IdentificationIcon className={`h-8 w-8 mb-2 ${userType === "staff" ? "text-blue-600" : "text-gray-400"}`} />
                      <span className="font-medium">Faculty/Staff</span>
                    </div>
                  </button>
                </div>
              </div>

              <form onSubmit={handleLogin} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {userType === "student" ? "University Roll Number" : "Staff ID"}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <IdentificationIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      placeholder={
                        userType === "student"
                          ? "e.g., 2023CS001"
                          : "e.g., STAFF001"
                      }
                      value={rollNo}
                      onChange={(e) => setRollNo(e.target.value)}
                      required
                      className="w-full pl-10 pr-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    />
                    
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <LockClosedIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="w-full pl-10 pr-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    />
                  </div>
                </div>

                {error && (
                  <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-red-700">{error}</p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-600">Remember me</span>
                  </label>
                  <button
                    type="button"
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                    onClick={() => navigate("/forgot-password")}
                  >
                    Forgot password?
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-blue-700 to-blue-800 text-white py-4 px-4 rounded-xl font-semibold shadow-lg hover:shadow-xl hover:from-blue-800 hover:to-blue-900 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center">
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Authenticating...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center">
                      <LockClosedIcon className="h-5 w-5 mr-2" />
                      Sign In to {userType === "student" ? "Student" : "Faculty"} Portal
                    </span>
                  )}
                </button>
              </form>

              <div className="mt-10 pt-8 border-t border-gray-200">
                <div className="text-center">
                  <p className="text-sm text-gray-600">
                    For first-time users or login assistance, please contact the IT Department
                  </p>
                  <div className="mt-4 flex justify-center space-x-6">
                    <button
                      onClick={() => navigate("/help")}
                      className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Help Center
                    </button>
                    <button
                      onClick={() => navigate("/faq")}
                      className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                    >
                      FAQ
                    </button>
                    <button
                      onClick={() => navigate("/contact")}
                      className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Contact Support
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-8 text-center">
                <p className="text-xs text-gray-500">
                  By signing in, you agree to our{" "}
                  <a href="/terms" className="text-blue-600 hover:underline">Terms of Service</a>{" "}
                  and{" "}
                  <a href="/privacy" className="text-blue-600 hover:underline">Privacy Policy</a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Login;