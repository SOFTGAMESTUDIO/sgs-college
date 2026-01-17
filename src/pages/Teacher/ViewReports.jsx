import React, { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { db } from "../../db/firebaseConfig";
import {
  collection,
  doc,
  getDoc,
  getDocs,
} from "firebase/firestore";
import { FaCalendarCheck, FaChevronLeft, FaSearch } from "react-icons/fa";
import Layout from "../../components/Layout";

export default function AttendanceSummaryPage() {
  const { id: subjectId } = useParams();

  const [loading, setLoading] = useState(true);
  const [subject, setSubject] = useState(null);
  const [students, setStudents] = useState([]);
  const [attendanceDocs, setAttendanceDocs] = useState([]);
  const [marksData, setMarksData] = useState({});
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");

  /* ---------- helpers ---------- */
  const normalizeStatus = (s) =>
    Array.isArray(s) ? s[0] : s || "-";

  /* ---------- fetch ---------- */
  useEffect(() => {
    let mounted = true;

    async function run() {
      try {
        setLoading(true);

        const subSnap = await getDoc(doc(db, "subjects", subjectId));
        if (!subSnap.exists()) throw new Error("Subject not found");

        const subData = { id: subSnap.id, ...subSnap.data() };
        const roster = (subData.students || []).map((s) => ({
          id: s.id || s.rollNo,
          name: s.name,
          rollNo: s.rollNo,
        }));

        const attSnap = await getDocs(
          collection(db, "subjects", subjectId, "attendance")
        );

        const attendance = attSnap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }));

        const marksSnap = await getDocs(
          collection(db, "subjects", subjectId, "marks")
        );

        const marksObj = {};
        for (const exam of marksSnap.docs) {
          const recSnap = await getDocs(
            collection(
              db,
              "subjects",
              subjectId,
              "marks",
              exam.id,
              "records"
            )
          );

          recSnap.docs.forEach((d) => {
            const rec = d.data();
            if (!marksObj[rec.rollNo]) marksObj[rec.rollNo] = {};
            marksObj[rec.rollNo][exam.id] = rec.marks;
          });
        }

        if (!mounted) return;
        setSubject(subData);
        setStudents(roster);
        setAttendanceDocs(attendance);
        setMarksData(marksObj);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }

    run();
    return () => (mounted = false);
  }, [subjectId]);

  /* ---------- derived ---------- */
  const dates = useMemo(
    () =>
      [...new Set(attendanceDocs.map((a) => a.date))].sort(
        (a, b) => new Date(a) - new Date(b)
      ),
    [attendanceDocs]
  );

  const rows = useMemo(() => {
    return students.map((stu) => {
      const statusByDate = {};
      dates.forEach((d) => (statusByDate[d] = "-"));

      attendanceDocs.forEach((a) => {
        const r = a.records?.find(
          (x) => x.rollNo === stu.rollNo
        );
        if (r) statusByDate[a.date] = normalizeStatus(r.status);
      });

      const present = Object.values(statusByDate).filter(
        (s) => s === "Present"
      ).length;

      return {
        ...stu,
        statusByDate,
        present,
        total: dates.length,
        marks: marksData[stu.rollNo] || {},
      };
    });
  }, [students, attendanceDocs, dates, marksData]);

  /* ---------- SEARCH FILTER ---------- */
  const filteredRows = useMemo(() => {
    if (!search.trim()) return rows;

    const q = search.toLowerCase();
    return rows.filter(
      (r) =>
        r.name?.toLowerCase().includes(q) ||
        r.rollNo?.toLowerCase().includes(q)
    );
  }, [search, rows]);

  /* ---------- UI ---------- */
  if (loading)
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full" />
      </div>
    );

  if (error)
    return <div className="p-6 text-red-600">{error}</div>;

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-7xl mx-auto space-y-6">

          {/* Header */}
          <div className="bg-white rounded-2xl border shadow-sm p-5 flex flex-wrap justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <FaCalendarCheck className="text-blue-600" />
              </div>
              <div>
                <h1 className="text-xl font-semibold">
                  Attendance & Marks
                </h1>
                <p className="text-sm text-gray-500">
                  {subject.subjectName} • {subject.subjectCode}
                </p>
              </div>
            </div>

            <Link
              to=".."
              className="text-blue-600 font-medium flex items-center gap-2"
            >
              <FaChevronLeft /> Back
            </Link>
          </div>

          {/* 🔍 SEARCH BAR */}
          <div className="bg-white rounded-xl border shadow-sm p-4">
            <div className="relative max-w-md">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by student name or roll no"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
          </div>

          {/* STUDENT CARDS */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredRows.map((row) => (
              <div
                key={row.rollNo}
                className="bg-white rounded-2xl border shadow-sm p-4"
              >
                <div className="mb-3">
                  <h3 className="font-semibold text-gray-800">
                    {row.name}
                  </h3>
                  <p className="text-sm text-gray-500">
                    Roll No: {row.rollNo}
                  </p>
                </div>

                {/* Attendance */}
                <div className="mb-4">
                  <p className="text-xs font-semibold text-gray-500 mb-2">
                    Attendance
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {dates.map((d) => {
                      const s = row.statusByDate[d];
                      return (
                        <span
                          key={d}
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            s === "Present"
                              ? "bg-green-100 text-green-700"
                              : s === "Absent"
                              ? "bg-red-100 text-red-700"
                              : s === "Leave"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {s[0] || "-"}
                        </span>
                      );
                    })}
                  </div>
                  <p className="text-xs mt-2 text-blue-600 font-semibold">
                    {row.total
                      ? Math.round(
                          (row.present / row.total) * 100
                        )
                      : 0}
                    % Present
                  </p>
                </div>

                {/* Marks */}
                <div>
                  <p className="text-xs font-semibold text-gray-500 mb-2">
                    Marks
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {["mst1", "mst2", "final"].map((ex) => (
                      <span
                        key={ex}
                        className="px-3 py-1 rounded-lg bg-blue-50 text-blue-700 text-sm font-medium"
                      >
                        {ex.toUpperCase()}:{" "}
                        {row.marks[ex] ?? "-"}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Empty Search */}
          {filteredRows.length === 0 && (
            <div className="bg-white rounded-xl border p-10 text-center text-gray-500">
              No students match your search.
            </div>
          )}

        </div>
      </div>
    </Layout>
  );
}
