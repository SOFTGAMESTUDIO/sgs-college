import React, { useEffect, useState } from "react";
import { useAuth } from "../auth/authProvider";
import { db, auth } from "../db/firebaseConfig";
import { collection, getDocs, query, where } from "firebase/firestore";
import { signOut } from "firebase/auth";
import { 
  FaChalkboardTeacher, 
  FaUserGraduate,
  FaUserTie,
  FaCog,
  FaSignOutAlt,
  FaBell,
  FaHome
} from "react-icons/fa";
import { useNavigate, useLocation } from "react-router-dom";
import { 
  AcademicCapIcon, 
  ChevronDownIcon,
  BellIcon
} from "@heroicons/react/24/outline";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAdmin } = useAuth();
  const [profile, setProfile] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);

  // ✅ Logout function
  const logout = async () => {
    try {
      await signOut(auth);
      navigate("/Login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  // ✅ Fetch profile (teacher/student)
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user?.uid || !user?.email) return;

      try {
        let collectionName = "";
        if (user.email.includes("@sgsteacher.com")) {
          collectionName = "teachers";
        } else if (user.email.includes("@sgs.com")) {
          collectionName = "students";
        } else {
          console.warn("Unknown user type:", user.email);
          return;
        }

        const ref = collection(db, collectionName);
        const q = query(ref, where("uid", "==", user.uid));
        const snapshot = await getDocs(q);

        if (!snapshot.empty) {
          setProfile(snapshot.docs[0].data());
        } else {
          console.warn(`No ${collectionName} found for UID:`, user.uid);
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      }
    };

    fetchProfile();
  }, [user]);

  // Get role display
  const getRoleDisplay = () => {
    if (isAdmin) return "Administrator";
    if (user?.email?.includes("@sgsteacher.com")) return "Faculty";
    if (user?.email?.includes("@sgs.com")) return "Student";
    return "Guest";
  };

  // Get role icon
  const getRoleIcon = () => {
    if (isAdmin) return <FaCog className="w-4 h-4" />;
    if (user?.email?.includes("@sgsteacher.com")) return <FaUserTie className="w-4 h-4" />;
    if (user?.email?.includes("@sgs.com")) return <FaUserGraduate className="w-4 h-4" />;
    return <FaUserGraduate className="w-4 h-4" />;
  };

  // Navigation items
  const navItems = [
    { path: "/", label: "Home", icon: <FaHome className="w-4 h-4" /> },
    ...(isAdmin ? [
      { path: "/admin/dashboard", label: "Admin Dashboard", icon: <FaCog className="w-4 h-4" /> },
    ] : []),
    ...(user?.email?.includes("@sgsteacher.com") ? [
      { path: "/teacher/dashboard", label: "Faculty Portal", icon: <FaChalkboardTeacher className="w-4 h-4" /> },
    ] : []),
    ...(user?.email?.includes("@sgs.com") ? [
      { path: "/student/dashboard", label: "Student Portal", icon: <FaUserGraduate className="w-4 h-4" /> },
    ] : []),
  ];

  return (
    <header className="sticky top-0 z-50 bg-gradient-to-r from-blue-900 to-blue-800 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left: College Logo & Brand */}
          <div 
            className="flex items-center space-x-3 cursor-pointer hover:opacity-90 transition-opacity"
            onClick={() => navigate("/")}
          >
            <div className="bg-white/10 p-2 rounded-lg backdrop-blur-sm">
              <AcademicCapIcon className="h-8 w-8 text-blue-300" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">SGS College</h1>
              <p className="text-xs text-blue-200">Smart College System</p>
            </div>
          </div>

          {/* Center: Navigation Links (only for authenticated users) */}
          {user && (
            <nav className="hidden md:flex items-center space-x-1">
              {navItems.map((item) => (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                    location.pathname === item.path
                      ? "bg-white/20 text-white shadow-inner"
                      : "text-blue-100 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  {item.icon}
                  <span className="font-medium">{item.label}</span>
                </button>
              ))}
            </nav>
          )}

          {/* Right: User Section */}
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                {/* Notifications */}
                <button className="relative p-2 text-blue-200 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                  <BellIcon className="h-5 w-5" />
                  <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
                </button>

                {/* User Profile Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setShowDropdown(!showDropdown)}
                    className="flex items-center space-x-3 p-2 rounded-lg hover:bg-white/10 transition-colors"
                  >
                    <div className="flex flex-col items-end">
                      <p className="text-sm font-medium text-white">
                        {profile?.name || user?.displayName || "User"}
                      </p>
                      <div className="flex items-center space-x-1 text-xs text-blue-200">
                        {getRoleIcon()}
                        <span>{getRoleDisplay()}</span>
                      </div>
                    </div>
                    
                    {/* Profile Avatar */}
                    <div className="relative">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-white font-bold shadow-lg">
                        {profile?.name
                          ? profile.name.charAt(0).toUpperCase()
                          : user?.displayName
                          ? user.displayName.charAt(0).toUpperCase()
                          : "U"}
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-blue-900"></div>
                    </div>
                    
                    <ChevronDownIcon className={`h-4 w-4 text-blue-300 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Dropdown Menu */}
                  {showDropdown && (
                    <>
                      <div 
                        className="fixed inset-0 z-40"
                        onClick={() => setShowDropdown(false)}
                      />
                      <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-2xl border border-gray-100 py-2 z-50 animate-in slide-in-from-top-5">
                        {/* User Info */}
                        <div className="px-4 py-3 border-b border-gray-100">
                          <p className="font-semibold text-gray-900">
                            {profile?.name || user?.displayName || "User"}
                          </p>
                          <p className="text-sm text-gray-500 truncate">{user.email}</p>
                          <div className="mt-2 inline-flex items-center px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-medium">
                            {getRoleIcon()}
                            <span className="ml-1">{getRoleDisplay()}</span>
                          </div>
                        </div>

                        {/* Dropdown Items */}
                        <div className="py-2">
                          <button
                            onClick={() => {
                              navigate("/profile");
                              setShowDropdown(false);
                            }}
                            className="flex items-center w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                          >
                            <FaUserGraduate className="w-4 h-4 mr-3 text-gray-400" />
                            My Profile
                          </button>
                        </div>

                        {/* Logout */}
                        <div className="border-t border-gray-100 pt-2">
                          <button
                            onClick={logout}
                            className="flex items-center w-full px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors"
                          >
                            <FaSignOutAlt className="w-4 h-4 mr-3" />
                            Sign Out
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </>
            ) : (
              // Login Button for non-authenticated users
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => navigate("/about")}
                  className="hidden md:inline-block text-blue-100 hover:text-white font-medium hover:bg-white/10 px-4 py-2 rounded-lg transition-colors"
                >
                  About College
                </button>
                <button
                  onClick={() => navigate("/Login")}
                  className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-medium px-6 py-2.5 rounded-lg shadow-lg hover:shadow-xl hover:from-cyan-600 hover:to-blue-700 transition-all duration-200"
                >
                  Login to Portal
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Navigation for authenticated users */}
      {user && (
        <div className="md:hidden border-t border-blue-800/50">
          <div className="flex overflow-x-auto px-4 py-2 space-x-2">
            {navItems.map((item) => (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm whitespace-nowrap transition-all ${
                  location.pathname === item.path
                    ? "bg-white/20 text-white"
                    : "text-blue-100 hover:bg-white/10"
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;