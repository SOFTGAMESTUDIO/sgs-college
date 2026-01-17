import React, { useEffect, useState } from "react";
import { useAuth } from "../../auth/authProvider";
import { db, storage } from "../../db/firebaseConfig.jsx";
import { 
  doc, 
  getDoc, 
  updateDoc, 
  collection, 
  query, 
  where, 
  getDocs 
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useNavigate } from "react-router-dom";
import Layout from "../../components/Layout";
import {
  UserCircleIcon,
  CameraIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon,
  AcademicCapIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  CalendarIcon,
  IdentificationIcon,
  BuildingLibraryIcon,
  BookOpenIcon,
  ChartBarIcon,
  ClockIcon,
  UserGroupIcon,
  ShieldCheckIcon,
  CogIcon,
} from "@heroicons/react/24/outline";

const ProfilePage = () => {
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [uploading, setUploading] = useState(false);
  const [stats, setStats] = useState({});
  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    fetchProfile();
    fetchStats();
    fetchRecentActivity();
  }, [user]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      let profileData = {};

      if (isAdmin) {
        // Admin profile from auth
        profileData = {
          name: user.displayName || "Administrator",
          email: user.email,
          role: "admin",
          uid: user.uid,
          createdAt: user.metadata.creationTime,
          lastLogin: user.metadata.lastSignInTime,
        };
      } else if (user.email.includes("@sgsteacher.com")) {
        // Teacher profile
        const teachersRef = collection(db, "teachers");
        const q = query(teachersRef, where("uid", "==", user.uid));
        const snapshot = await getDocs(q);
        
        if (!snapshot.empty) {
          profileData = snapshot.docs[0].data();
          profileData.id = snapshot.docs[0].id;
          profileData.role = "teacher";
        }
      } else if (user.email.includes("@sgs.com")) {
        // Student profile
        const studentsRef = collection(db, "students");
        const q = query(studentsRef, where("uid", "==", user.uid));
        const snapshot = await getDocs(q);
        
        if (!snapshot.empty) {
          profileData = snapshot.docs[0].data();
          profileData.id = snapshot.docs[0].id;
          profileData.role = "student";
        }
      }

      setProfile(profileData);
      setFormData(profileData);
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      if (isAdmin) {
        // Admin stats
        const studentsSnapshot = await getDocs(collection(db, "students"));
        const teachersSnapshot = await getDocs(collection(db, "teachers"));
        const subjectsSnapshot = await getDocs(collection(db, "subjects"));
        
        setStats({
          totalStudents: studentsSnapshot.size,
          totalTeachers: teachersSnapshot.size,
          totalSubjects: subjectsSnapshot.size,
          systemStatus: "Operational",
        });
      } else if (user?.email?.includes("@sgsteacher.com")) {
        // Teacher stats
        const subjectsSnapshot = await getDocs(
          query(collection(db, "subjects"), where("teacherId", "==", user.uid))
        );
        
        const attendanceSnapshot = await getDocs(
          query(collection(db, "attendance"), where("teacherId", "==", user.uid))
        );

        setStats({
          subjects: subjectsSnapshot.size,
          totalAttendance: attendanceSnapshot.size,
          averageAttendance: "92%",
          upcomingClasses: 5,
        });
      } else if (user?.email?.includes("@sgs.com")) {
        // Student stats
        const attendanceSnapshot = await getDocs(
          query(collection(db, "attendance"), where("studentId", "==", user.uid))
        );

        const presentCount = attendanceSnapshot.docs.filter(
          doc => doc.data().status === "present"
        ).length;

        setStats({
          totalClasses: attendanceSnapshot.size,
          attendanceRate: attendanceSnapshot.size > 0 
            ? `${Math.round((presentCount / attendanceSnapshot.size) * 100)}%`
            : "0%",
          subjects: 6,
          upcomingExams: 2,
        });
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const fetchRecentActivity = async () => {
    // Simulated recent activity
    const activities = [
      { id: 1, action: "Profile updated", timestamp: "2 hours ago", icon: "👤" },
      { id: 2, action: "Login successful", timestamp: "Yesterday", icon: "🔐" },
      { id: 3, action: "Password changed", timestamp: "3 days ago", icon: "🔑" },
      { id: 4, action: "Settings updated", timestamp: "1 week ago", icon: "⚙️" },
    ];
    setRecentActivity(activities);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    try {
      if (!profile || !profile.id) return;

      let collectionName = "";
      if (profile.role === "teacher") {
        collectionName = "teachers";
      } else if (profile.role === "student") {
        collectionName = "students";
      }

      if (collectionName) {
        const docRef = doc(db, collectionName, profile.id);
        await updateDoc(docRef, formData);
        
        setProfile(formData);
        setEditing(false);
        alert("Profile updated successfully!");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to update profile");
    }
  };

  const handleImageUpload = async (e) => {
    try {
      const file = e.target.files[0];
      if (!file) return;

      setUploading(true);
      const storageRef = ref(storage, `profile-images/${user.uid}`);
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);

      // Update profile with new image URL
      const updatedProfile = { ...formData, photoURL: downloadURL };
      setFormData(updatedProfile);
      
      if (profile.id) {
        let collectionName = profile.role === "teacher" ? "teachers" : "students";
        const docRef = doc(db, collectionName, profile.id);
        await updateDoc(docRef, { photoURL: downloadURL });
      }

      setProfile(updatedProfile);
      alert("Profile picture updated!");
    } catch (error) {
      console.error("Error uploading image:", error);
      alert("Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  const getRoleBadge = () => {
    const role = profile?.role;
    const colors = {
      admin: "bg-purple-100 text-purple-800",
      teacher: "bg-blue-100 text-blue-800",
      student: "bg-green-100 text-green-800",
    };
    
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${colors[role] || "bg-gray-100 text-gray-800"}`}>
        {role?.toUpperCase()}
      </span>
    );
  };

  const renderAdminProfile = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-8">
        <div className="flex items-center space-x-4">
          <div className="bg-white p-3 rounded-xl shadow-md">
            <ShieldCheckIcon className="h-12 w-12 text-purple-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">System Administrator</h2>
            <p className="text-gray-600">Full system access and management privileges</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">System Information</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Database Status</span>
              <span className="flex items-center text-green-600">
                <div className="h-2 w-2 bg-green-500 rounded-full mr-2"></div>
                Operational
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Server Uptime</span>
              <span className="font-medium">99.9%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Last Backup</span>
              <span className="font-medium">Today, 02:00 AM</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <button 
              onClick={() => navigate("/admin/dashboard")}
              className="w-full text-left p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              Go to Admin Dashboard
            </button>
            <button 
              onClick={() => navigate("/admin/users")}
              className="w-full text-left p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              Manage Users
            </button>
            <button 
              onClick={() => navigate("/admin/settings")}
              className="w-full text-left p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              System Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTeacherProfile = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl p-8">
        <div className="flex items-center space-x-4">
          <div className="bg-white p-3 rounded-xl shadow-md">
            <AcademicCapIcon className="h-12 w-12 text-blue-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{profile?.department || "Faculty Member"}</h2>
            <p className="text-gray-600">{profile?.qualification || "Educator"}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Teaching Schedule</h3>
          <div className="space-y-3">
            {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"].map((day) => (
              <div key={day} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="font-medium">{day}</span>
                <span className="text-sm text-gray-600">9:00 AM - 4:00 PM</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Assigned Subjects</h3>
          <div className="space-y-3">
            {["Mathematics", "Physics", "Computer Science", "Engineering"].map((subject, index) => (
              <div key={index} className="flex items-center p-3 bg-gray-50 rounded-lg">
                <BookOpenIcon className="h-5 w-5 text-blue-500 mr-3" />
                <span>{subject}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderStudentProfile = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-8">
        <div className="flex items-center space-x-4">
          <div className="bg-white p-3 rounded-xl shadow-md">
            <UserGroupIcon className="h-12 w-12 text-green-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{profile?.program || "Student"}</h2>
            <p className="text-gray-600">Batch: {profile?.batch || "2024"}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Academic Information</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Current Semester</span>
              <span className="font-medium">Semester {profile?.semester || "4"}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">CGPA</span>
              <span className="font-medium">3.75 / 4.00</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Attendance</span>
              <span className="font-medium text-green-600">92%</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Enrolled Subjects</h3>
          <div className="space-y-3">
            {["Data Structures", "Algorithms", "Database Systems", "Web Development"].map((subject, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span>{subject}</span>
                <span className="text-sm text-gray-600">CSE-101{index}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading profile...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!profile) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <UserCircleIcon className="h-16 w-16 text-gray-400 mx-auto" />
            <h2 className="mt-4 text-xl font-semibold text-gray-900">Profile Not Found</h2>
            <p className="mt-2 text-gray-600">Unable to load profile information.</p>
            <button
              onClick={() => navigate("/")}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Go Home
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
            <p className="text-gray-600 mt-2">Manage your account information and settings</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Profile Card */}
            <div className="lg:col-span-2 space-y-6">
              {/* Profile Header Card */}
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                <div className="flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-6">
                  {/* Profile Image */}
                  <div className="relative">
                    <div className="relative w-40 h-40 rounded-full overflow-hidden border-4 border-white shadow-lg">
                      {profile.photoURL ? (
                        <img
                          src={profile.photoURL}
                          alt={profile.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                          <UserCircleIcon className="h-24 w-24 text-white/80" />
                        </div>
                      )}
                    </div>
                    
                    {/* Edit Photo Button */}
                    <label className="absolute bottom-2 right-2 bg-white p-2 rounded-full shadow-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        disabled={uploading}
                      />
                      {uploading ? (
                        <div className="h-6 w-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <CameraIcon className="h-6 w-6 text-gray-700" />
                      )}
                    </label>
                  </div>

                  {/* Profile Info */}
                  <div className="flex-1 text-center md:text-left">
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900">
                          {editing ? (
                            <input
                              type="text"
                              name="name"
                              value={formData.name || ""}
                              onChange={handleInputChange}
                              className="border-b-2 border-blue-500 px-2 py-1"
                            />
                          ) : (
                            profile.name || "No Name"
                          )}
                        </h2>
                        <p className="text-gray-600 mt-1 flex items-center justify-center md:justify-start">
                          <EnvelopeIcon className="h-4 w-4 mr-2" />
                          {user.email}
                        </p>
                      </div>
                      <div className="mt-4 md:mt-0">
                        {getRoleBadge()}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex space-x-3 mt-6 justify-center md:justify-start">
                      {editing ? (
                        <>
                          <button
                            onClick={handleSave}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center"
                          >
                            <CheckIcon className="h-5 w-5 mr-2" />
                            Save Changes
                          </button>
                          <button
                            onClick={() => {
                              setEditing(false);
                              setFormData(profile);
                            }}
                            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center"
                          >
                            <XMarkIcon className="h-5 w-5 mr-2" />
                            Cancel
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => setEditing(true)}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
                        >
                          <PencilIcon className="h-5 w-5 mr-2" />
                          Edit Profile
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Role-Specific Profile Content */}
              {profile.role === "admin" && renderAdminProfile()}
              {profile.role === "teacher" && renderTeacherProfile()}
              {profile.role === "student" && renderStudentProfile()}
            </div>

            {/* Right Column - Stats & Activity */}
            <div className="space-y-6">
              {/* Stats Card */}
              <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
                <div className="space-y-4">
                  {Object.entries(stats).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between">
                      <span className="text-gray-600 capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </span>
                      <span className="font-semibold text-gray-900">{value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Personal Information Card */}
              <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
                <div className="space-y-4">
                  {editing ? (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone || ""}
                          onChange={handleInputChange}
                          className="w-full border rounded-lg px-3 py-2"
                          placeholder="Enter phone number"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Address
                        </label>
                        <textarea
                          name="address"
                          value={formData.address || ""}
                          onChange={handleInputChange}
                          className="w-full border rounded-lg px-3 py-2"
                          rows="3"
                          placeholder="Enter address"
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center space-x-3">
                        <PhoneIcon className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-500">Phone</p>
                          <p className="font-medium">{profile.phone || "Not provided"}</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <MapPinIcon className="h-5 w-5 text-gray-400 mt-1" />
                        <div>
                          <p className="text-sm text-gray-500">Address</p>
                          <p className="font-medium">{profile.address || "Not provided"}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <CalendarIcon className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-500">Member Since</p>
                          <p className="font-medium">
                            {new Date(profile.createdAt || user.metadata.creationTime).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <IdentificationIcon className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-500">User ID</p>
                          <p className="font-medium text-sm font-mono">{user.uid.substring(0, 8)}...</p>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Recent Activity Card */}
              <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
                <div className="space-y-4">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-center space-x-3">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                        {activity.icon}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                        <p className="text-xs text-gray-500">{activity.timestamp}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ProfilePage;