import React, { useEffect, useState } from "react";
import { db } from "../../db/firebaseConfig";
import {
  collection,
  getDocs,
  addDoc,
  query,
  where,
} from "firebase/firestore";
import { useAuth } from "../../auth/authProvider";
import { useNavigate } from "react-router-dom";
import Layout from "../../components/Layout";

export default function MarkAttendance() {
  const [selectedSubject, setSelectedSubject] = useState("");
  const [subjects, setSubjects] = useState([]);
  const [students, setStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  const fetchData = async (subjectId = "") => {
    try {
      setIsLoading(true);

      const teachersRef = collection(db, "teachers");
      const teacherQuery = query(teachersRef, where("uid", "==", user.uid));
      const teacherSnapshot = await getDocs(teacherQuery);
      if (teacherSnapshot.empty) return;

      const teacherDoc = teacherSnapshot.docs[0].data();
      const teacherId = teacherDoc.id;

      const subjectSnap = await getDocs(collection(db, "subjects"));
      const subs = subjectSnap.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .filter((subj) => subj.teachers?.some((t) => t.id === teacherId));

      setSubjects(subs);

      if (subjectId) {
        const subject = subs.find((s) => s.id === subjectId);
        if (!subject) return setStudents([]);

        let studs = [];
        if (subject.students?.length) {
          studs = subject.students.map((s) => ({
            ...s,
            status: ["Absent"],
          }));
        } else if (subject.studentIds?.length) {
          const studentSnap = await getDocs(collection(db, "students"));
          studs = studentSnap.docs
            .map((doc) => ({ id: doc.id, ...doc.data() }))
            .filter((s) => subject.studentIds.includes(s.rollNo))
            .map((s) => ({ ...s, status: ["Absent"] }));
        }
        setStudents(studs);
      } else setStudents([]);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchData();
  }, [user]);

  useEffect(() => {
    if (selectedSubject) fetchData(selectedSubject);
  }, [selectedSubject]);

  const handleAttendanceChange = (id, status) => {
    setStudents((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: [status] } : s))
    );
  };

  const handleSubmit = async () => {
    if (!selectedSubject) return alert("Please select a subject first!");

    try {
      setIsLoading(true);
      const subject = subjects.find((s) => s.id === selectedSubject);
      const attendanceRef = collection(
        db,
        "subjects",
        selectedSubject,
        "attendance"
      );

      await addDoc(attendanceRef, {
        subjectId: subject.subjectCode,
        subjectName: subject.subjectName,
        date: new Date().toISOString().split("T")[0],
        records: students.map((s) => ({
          name: s.name,
          rollNo: s.rollNo,
          status: s.status?.[0] || "Absent",
        })),
      });

      alert("✅ Attendance submitted successfully!");
    } catch {
      alert("❌ Failed to save attendance.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-100 py-10 px-4">
        <div className="max-w-6xl mx-auto space-y-8">

          {/* Header */}
          <div className="flex flex-wrap justify-between items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Mark Attendance
              </h1>
              <p className="text-gray-600 mt-1">
                Track and manage student attendance
              </p>
            </div>
            <button
              onClick={() => navigate("/teacher/dashboard")}
              className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium transition"
            >
              ← Back to Dashboard
            </button>
          </div>

          {/* Subject Selector */}
          <div className="bg-white/80 backdrop-blur rounded-2xl border border-gray-200 shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Select Subject
            </h2>
            <select
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
            >
              <option value="">Choose a subject</option>
              {subjects.map((sub) => (
                <option key={sub.id} value={sub.id}>
                  {sub.subjectName} ({sub.subjectCode || sub.id})
                </option>
              ))}
            </select>
          </div>

          {/* Loading */}
          {isLoading && (
            <div className="flex justify-center py-16">
              <div className="animate-spin h-12 w-12 border-4 border-blue-200 border-t-blue-600 rounded-full" />
            </div>
          )}

          {/* Attendance Table */}
          {!isLoading && selectedSubject && students.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b">
                <h2 className="text-xl font-semibold text-gray-800">
                  Attendance —{" "}
                  {subjects.find((s) => s.id === selectedSubject)?.subjectName}
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  {students.length} students
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                        Roll No
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                        Student Name
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {students.map((s) => (
                      <tr key={s.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 font-medium">{s.rollNo}</td>
                        <td className="px-6 py-4">{s.name}</td>
                        <td className="px-6 py-4">
                          <div className="flex justify-center gap-3">
                            {["Present", "Leave", "Absent"].map((status) => (
                              <label
                                key={status}
                                className={`px-4 py-2 rounded-full border text-sm cursor-pointer transition
                                  ${
                                    s.status?.[0] === status
                                      ? status === "Present"
                                        ? "bg-green-100 text-green-700 border-green-300"
                                        : status === "Leave"
                                        ? "bg-yellow-100 text-yellow-700 border-yellow-300"
                                        : "bg-red-100 text-red-700 border-red-300"
                                      : "bg-white border-gray-300 hover:bg-gray-100"
                                  }`}
                              >
                                <input
                                  type="radio"
                                  className="sr-only"
                                  checked={s.status?.[0] === status}
                                  onChange={() =>
                                    handleAttendanceChange(s.id, status)
                                  }
                                />
                                {status}
                              </label>
                            ))}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Submit */}
              <div className="px-6 py-5 bg-gray-50 border-t">
                <button
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="inline-flex items-center px-6 py-3 rounded-xl bg-blue-600 text-white font-medium shadow hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 transition disabled:opacity-70"
                >
                  Submit Attendance
                </button>
              </div>
            </div>
          )}

          {/* Empty States */}
          {!isLoading && selectedSubject && students.length === 0 && (
            <div className="bg-white rounded-2xl border shadow-sm p-10 text-center text-gray-600">
              No students enrolled in this subject.
            </div>
          )}

          {!isLoading && !selectedSubject && (
            <div className="bg-white rounded-2xl border shadow-sm p-12 text-center text-gray-600">
              Select a subject to begin marking attendance.
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
