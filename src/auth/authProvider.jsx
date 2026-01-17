/**
 * Authentication Context Provider
 * Manages user authentication state and admin role verification
 */

import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../db/firebaseConfig.jsx";

const AuthContext = createContext();

const ADMIN_EMAIL = import.meta.env.VITE__ADMIN_EMAIL_SGS?.trim()?.toLowerCase();

/**
 * Authentication Provider Component
 * Provides authentication context to all child components
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 * @returns {JSX.Element} Provider component wrapping children
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isTeacher, setIsTeacher] = useState(false);


  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        const currentEmail = firebaseUser.email?.trim()?.toLowerCase();
        setUser(firebaseUser);
        setIsAdmin(currentEmail === ADMIN_EMAIL);
      } else {
        setUser(null);
        setIsAdmin(false);
      }
      if (firebaseUser?.email) {
  const currentEmail = firebaseUser.email.trim().toLowerCase();
;
  // check domain + numeric username
  const isTeacherEmail =
    /^\d+@sgsteacher\.com$/.test(currentEmail);
  setIsTeacher(isTeacherEmail);
} else {
  setIsTeacher(false);
}

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAdmin,isTeacher, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Custom hook to access authentication context
 * @returns {Object} Authentication context containing user, isAdmin, and loading state
 * @throws {Error} If used outside of AuthProvider
 */
export const useAuth = () => useContext(AuthContext);
