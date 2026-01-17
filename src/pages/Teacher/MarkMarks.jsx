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

export default function MarkMarks() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [subjects, setSubjects] = useState([]);
  const [students, setStudents] = useState([]);

  const [selectedSubject, setSelectedSubject] = useState("");
  const [examType, setExamType] = useState("");
  const [maxMarks, setMaxMarks] = useState(30);

  const [isLoading, setIsLoading] = useState(false);

  /* ================= FETCH DATA ================= */
  const fetchData = async (subjectId = "") => {
    try {
      setIsLoading(true);

      const teacherQuery = query(
        collection(db, "teachers"),
        where("uid", "==", user.uid)
      );
      const teacherSnap = await getDocs(teacherQuery);
      if (teacherSnap.empty) return;

      const teacherId = teacherSnap.docs[0].data().id;

      const subjectSnap = await getDocs(collection(db, "subjects"));
      const subs = subjectSnap.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .filter((s) => s.teachers?.some((t) => t.id === teacherId));

      setSubjects(subs);

      if (!subjectId) return setStudents([]);

      const subject = subs.find((s) => s.id === subjectId);
      if (!subject) return setStudents([]);

      let studs = [];

      if (subject.students?.length) {
        studs = subject.students.map((s) => ({ ...s, marks: "" }));
      } else if (subject.studentIds?.length) {
        const studentSnap = await getDocs(collection(db, "students"));
        studs = studentSnap.docs
          .map((d) => ({ id: d.id, ...d.data() }))
          .filter((s) => subject.studentIds.includes(s.rollNo))
          .map((s) => ({ ...s, marks: "" }));
      }

      setStudents(studs);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  /* ================= EFFECTS ================= */
  useEffect(() => {
    if (user) fetchData();
  }, [user]);

  useEffect(() => {
    if (selectedSubject) fetchData(selectedSubject);
  }, [selectedSubject]);

  /* ================= HANDLERS ================= */
  const handleMarksChange = (id, value) => {
    if (value < 0 || value > maxMarks) return;

    setStudents((prev) =>
      prev.map((s) => (s.id === id ? { ...s, marks: value } : s))
    );
  };

  const handleSubmit = async () => {
    if (!selectedSubject || !examType) {
      return alert("Select subject and exam type");
    }

    const subject = subjects.find((s) => s.id === selectedSubject);

    try {
      setIsLoading(true);

      const marksRef = collection(
        db,
        "subjects",
        selectedSubject,
        "marks",
        examType,
        "records"
      );

      await addDoc(marksRef, {
        subjectId: subject.subjectCode,
        subjectName: subject.subjectName,
        examType,
        maxMarks,
        date: new Date().toISOString().split("T")[0],
        records: students.map((s) => ({
          name: s.name,
          rollNo: s.rollNo,
          marks: Number(s.marks || 0),
        })),
      });

      alert("✅ Marks submitted successfully");
    } catch {
      alert("❌ Failed to submit marks");
    } finally {
      setIsLoading(false);
    }
  };

  /* ================= UI ================= */
  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-100 px-4 py-10">
        <div className="max-w-6xl mx-auto space-y-8">

          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Marks Entry
              </h1>
              <p className="text-gray-600 mt-1">
                Fast & accurate student evaluation
              </p>
            </div>
            <button
              onClick={() => navigate("/teacher/dashboard")}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              ← Dashboard
            </button>
          </div>

          {/* Controls */}
          <div className="bg-white rounded-2xl shadow-sm border p-6 grid md:grid-cols-2 gap-4">
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="px-4 py-3 rounded-xl border focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Subject</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.subjectName}
                </option>
              ))}
            </select>

            <select
              value={examType}
              onChange={(e) => {
                setExamType(e.target.value);
                setMaxMarks(e.target.value === "final" ? 100 : 30);
              }}
              className="px-4 py-3 rounded-xl border focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Exam</option>
              <option value="mst1">MST 1 (30)</option>
              <option value="mst2">MST 2 (30)</option>
              <option value="final">Final Exam (100)</option>
            </select>
          </div>

          {/* Students */}
          {!isLoading && students.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm border p-6 space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">
                  Students ({students.length})
                </h2>
                <span className="text-sm text-gray-500">
                  Max Marks: {maxMarks}
                </span>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {students.map((s) => (
                  <div
                    key={s.id}
                    className="border rounded-xl p-4 hover:shadow transition"
                  >
                    <div className="mb-3">
                      <h3 className="font-semibold text-gray-800">
                        {s.name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        Roll No: {s.rollNo}
                      </p>
                    </div>

                    <input
                      type="number"
                      min="0"
                      max={maxMarks}
                      value={s.marks}
                      placeholder="Enter marks"
                      onChange={(e) =>
                        handleMarksChange(s.id, e.target.value)
                      }
                      className="w-full text-center text-lg font-semibold px-4 py-3 rounded-lg border focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                ))}
              </div>

              {/* Submit */}
              <div className="pt-4 flex justify-end">
                <button
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="px-8 py-3 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 transition disabled:opacity-70"
                >
                  Submit Marks
                </button>
              </div>
            </div>
          )}

          {!isLoading && selectedSubject && students.length === 0 && (
            <div className="bg-white rounded-xl border p-10 text-center text-gray-600">
              No students found for this subject.
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
