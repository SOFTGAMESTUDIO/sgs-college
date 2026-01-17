/**
 * Teacher Model
 * Handles database operations for teacher entities including authentication
 */

import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../db/firebaseConfig";
import { collection, addDoc } from "firebase/firestore";

/**
 * Saves a new teacher to the database and creates their authentication account
 * @param {Object} teacherData - The teacher information to save
 * @param {string} teacherData.id - Unique teacher ID
 * @param {string} teacherData.name - Teacher's full name
 * @param {string} teacherData.password - Teacher's password for authentication
 * @param {string} [teacherData.department] - Teacher's department
 * @param {string} [teacherData.designation] - Teacher's designation
 * @returns {Promise<string>} The document ID of the created teacher record
 * @throws {Error} If authentication or database operation fails
 */
export const saveTeacher = async (teacherData) => {
  try {
    const password = teacherData.password;
    const email = `${teacherData.id}@sgsteacher.com`;

    // Create Firebase authentication account
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);

    // Save teacher data to Firestore with UID reference
    const docRef = await addDoc(collection(db, "teachers"), {
      uid: userCredential.user.uid,
      ...teacherData
    });

    return docRef.id;
  } catch (error) {
    console.error("Error adding teacher:", error);
    throw new Error(`Failed to save teacher: ${error.message}`);
  }
};
