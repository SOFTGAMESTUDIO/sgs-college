/**
 * Subject Model
 * Handles database operations for subject entities
 */

import { db } from "../db/firebaseConfig";
import { collection, addDoc } from "firebase/firestore";

/**
 * Saves a new subject to the Firestore database
 * @param {Object} subjectData - The subject information to save
 * @param {string} subjectData.subjectName - Name of the subject
 * @param {string} subjectData.subjectCode - Unique subject code
 * @param {Array} subjectData.teachers - Array of teacher objects assigned to this subject
 * @param {Array} subjectData.students - Array of student objects enrolled in this subject
 * @returns {Promise<string>} The document ID of the created subject
 * @throws {Error} If the save operation fails
 */
export const saveSubject = async (subjectData) => {
  try {
    const docRef = await addDoc(collection(db, "subjects"), subjectData);
    return docRef.id;
  } catch (error) {
    console.error("Error adding subject:", error);
    throw new Error(`Failed to save subject: ${error.message}`);
  }
};
