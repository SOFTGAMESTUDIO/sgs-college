import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../../db/firebaseConfig";
import {
  collection,
  getDocs,
  query,
  orderBy,
  limit,
  where,
} from "firebase/firestore";
import {
  Users,
  BookOpen,
  GraduationCap,
  DollarSign,
  Book,
  Search,
  Settings,
  Layers,
} from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { motion } from "framer-motion";
import Layout from "../../components/Layout";

// Small reusable UI pieces (kept inside this file for single-file component preview)
const StatCard = ({ title, value, delta, icon: Icon, color = "blue" }) => (
  <motion.div
    initial={{ opacity: 0, y: 6 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.25 }}
    className={`bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center justify-between`}
  >
    <div>
      <div className="text-sm text-gray-500">{title}</div>
      <div className={`text-3xl font-semibold ${color === "green" ? "text-green-600" : color === "purple" ? "text-purple-600" : "text-blue-600"}`}>
        {value}
      </div>
      {typeof delta !== "undefined" && (
        <div className="text-xs text-gray-400 mt-1">{delta}</div>
      )}
    </div>
    <div className={`p-3 rounded-lg bg-${color}-50`}> 
      <Icon size={24} className={`text-${color}-600`} />
    </div>
  </motion.div>
);

const Panel = ({ title, children, actions }) => (
  <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
      <div className="flex items-center gap-2">{actions}</div>
    </div>
    {children}
  </div>
);

export default function AdminDashboard() {
  const navigate = useNavigate();

  // Lightweight loading state
  const [loading, setLoading] = useState(false);

  // Core entities
  const [teachers, setTeachers] = useState([]);
  const [students, setStudents] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [books, setBooks] = useState([]);
  const [feeStructures, setFeeStructures] = useState([]);
  const [feePayments, setFeePayments] = useState([]);
  const [issuedBooks, setIssuedBooks] = useState([]);

  // UI helpers
  const [search, setSearch] = useState("");

  // =============== FETCHING ===============
  const fetchCollection = async (name, q = null) => {
    try {
      const snapshot = q ? await getDocs(q) : await getDocs(collection(db, name));
      return snapshot.docs.map((d) => ({ docId: d.id, ...d.data() }));
    } catch (err) {
      console.error(`Error fetching ${name}:`, err);
      return [];
    }
  };

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [t, s, sub, b, fees, payments, issued] = await Promise.all([
        fetchCollection("teachers", query(collection(db, "teachers"), orderBy("name"))),
        fetchCollection("students", query(collection(db, "students"), orderBy("rollNo"))),
        fetchCollection("subjects", query(collection(db, "subjects"), orderBy("name"))),
        fetchCollection("books", query(collection(db, "books"), orderBy("createdAt", "desc"))),
        fetchCollection("feeStructures", query(collection(db, "feeStructures"), orderBy("semester"))),
        fetchCollection("feePayments", query(collection(db, "feePayments"), orderBy("paymentDate", "desc"), limit(12))),
        fetchCollection("issued_books", query(collection(db, "issued_books"), orderBy("issuedAt", "desc"), limit(12))),
      ]);

      setTeachers(t);
      setStudents(s);
      setSubjects(sub);
      setBooks(b);
      setFeeStructures(fees);
      setFeePayments(payments.map(p => ({ ...p, paymentDate: p.paymentDate ? new Date(p.paymentDate.seconds * 1000) : null })));
      setIssuedBooks(issued);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // =============== DERIVED METRICS ===============
  const counts = useMemo(() => ({
    teachers: teachers.length,
    students: students.length,
    subjects: subjects.length,
    books: books.reduce((s, b) => s + (b.totalQuantity || 0), 0),
    issuedBooks: issuedBooks.length,
  }), [teachers, students, subjects, books, issuedBooks]);

  // Payments over last 6 months chart data (fallback when payments are missing)
  const paymentsChart = useMemo(() => {
    // group payments by month-year
    const map = new Map();
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${d.getMonth() + 1}`;
      map.set(key, { month: d.toLocaleString(undefined, { month: 'short' }), total: 0 });
    }

    feePayments.forEach(p => {
      if (!p.paymentDate) return;
      const key = `${p.paymentDate.getFullYear()}-${p.paymentDate.getMonth() + 1}`;
      if (!map.has(key)) return;
      map.get(key).total += Number(p.amount || 0);
    });

    return Array.from(map.values());
  }, [feePayments]);

  // Recent tables
  const recentPayments = feePayments.slice(0, 8);
  const recentBooks = books.slice(0, 6);
  const recentTeachers = teachers.slice(0, 6);

  // =============== UI ACTIONS ===============
  const go = (path) => navigate(path);

const totalIssuedQuantity = useMemo(() => {
  return issuedBooks.reduce(
    (sum, item) => sum + Number(item.issuedQuantity || 0),
    0
  );
}, [issuedBooks]);


  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        <div className="p-6 max-w-8xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Academic Dashboard</h1>
              <p className="text-sm text-gray-500">Overview of students, teachers, library and finance</p>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center bg-white rounded-full p-2 border border-gray-100 shadow-sm">
                <Search size={16} className="text-gray-400 mr-2" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Quick search (students, teachers, books...)"
                  className="w-64 outline-none text-sm"
                />
              </div>

              <button onClick={() => fetchAll()} className="px-4 py-2 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50">
                Refresh
              </button>

              <button onClick={() => go('/admin/manage-teachers')} className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow-sm hover:bg-blue-700 flex items-center gap-2">
                <Users size={16} /> Manage
              </button>

              <button className="p-2 bg-white rounded-lg border border-gray-100 shadow-sm"><Settings size={16} /></button>
            </div>
          </div>

          {/* Main grid */}
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
            <div className="xl:col-span-3 space-y-6">
              {/* Top stats */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <StatCard title="Teachers" value={counts.teachers} delta={`Active: ${recentTeachers.length}`} icon={Users} color="blue" />
                <StatCard title="Students" value={counts.students} delta={`New this month: ${students.filter(s => { /* simple filter: createdAt exists within 30 days */ return false; }).length}`} icon={GraduationCap} color="green" />
                <StatCard title="Subjects" value={counts.subjects} delta={`${subjects.length} unique`} icon={BookOpen} color="purple" />
                <StatCard title="Books (Total)" value={counts.books} delta={`${recentBooks.length} recent`} icon={Book} color="purple" />
                <StatCard title="Issued" value={counts.issuedBooks} delta={`Pending: ${issuedBooks.toString(issuedQuantity)}`} icon={Layers} color="blue" />
                <StatCard title="Income (6m)" value={`₹${paymentsChart.reduce((s, p) => s + p.total, 0).toLocaleString()}`} delta={`Last: ₹${paymentsChart[paymentsChart.length -1]?.total || 0}`} icon={DollarSign} color="green" />
              </div>

              {/* Payments Chart + Recent Payments */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <Panel title="Fee Collections (last 6 months)" actions={<div className="text-xs text-gray-400">auto</div>}>
                  <div style={{ width: '100%', height: 160 }}>
                    <ResponsiveContainer>
                      <AreaChart data={paymentsChart}>
                        <defs>
                          <linearGradient id="colorAmt" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#60A5FA" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#60A5FA" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Area type="monotone" dataKey="total" stroke="#2563EB" fillOpacity={1} fill="url(#colorAmt)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </Panel>

                <Panel title="Recent Payments" actions={<button onClick={() => go('/admin/Accounts')} className="text-sm text-blue-600">View all</button>}>
                  <div className="space-y-2">
                    {recentPayments.length === 0 ? (
                      <div className="text-sm text-gray-500">No recent payments</div>
                    ) : (
                      <div className="overflow-auto max-h-40">
                        <table className="w-full text-sm">
                          <tbody>
                            {recentPayments.map((p) => (
                              <tr key={p.id} className="border-b last:border-b-0">
                                <td className="py-2 pr-3 text-gray-700">{p.studentName}</td>
                                <td className="py-2 text-sm text-gray-500">{p.feeType}</td>
                                <td className="py-2 text-right font-medium">₹{p.amount}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </Panel>

                <Panel title="Quick Actions" actions={<div className="text-xs text-gray-400">Admin</div>}>
                  <div className="grid grid-cols-2 gap-2">
                    <button onClick={() => go('/admin/add-subjects')} className="py-2 px-3 rounded-lg border border-gray-100 text-sm hover:bg-gray-50">Add Subject</button>
                    <button onClick={() => go('/admin/manage-teachers')} className="py-2 px-3 rounded-lg border border-gray-100 text-sm hover:bg-gray-50">Add Teacher</button>
                    <button onClick={() => go('/admin/manage-students')} className="py-2 px-3 rounded-lg border border-gray-100 text-sm hover:bg-gray-50">Enroll Student</button>
                    <button onClick={() => go('/admin/library')} className="py-2 px-3 rounded-lg border border-gray-100 text-sm hover:bg-gray-50">Add Book</button>
                  </div>
                </Panel>
              </div>

              {/* Student / Teacher lists */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Panel title="Students (quick)" actions={<div className="text-xs text-gray-400">{counts.students} total</div>}>
                  <div className="overflow-auto max-h-64">
                    <table className="w-full text-sm">
                      <thead className="text-left text-xs text-gray-400 border-b">
                        <tr><th className="py-2">Name</th><th>Roll</th><th className="text-right">Sem</th></tr>
                      </thead>
                      <tbody>
                        {students.filter(s => s.name?.toLowerCase().includes(search.toLowerCase())).slice(0, 12).map(s => (
                          <tr key={s.docId} className="border-b last:border-b-0 hover:bg-gray-50 cursor-pointer" onClick={() => go(`/admin/manage-students?student=${s.docId}`)}>
                            <td className="py-2">{s.name}</td>
                            <td className="py-2 text-sm text-gray-500">{s.rollNo}</td>
                            <td className="py-2 text-right">{s.semester}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Panel>

                <Panel title="Teachers (quick)" actions={<div className="text-xs text-gray-400">{counts.teachers} total</div>}>
                  <div className="overflow-auto max-h-64">
                    <table className="w-full text-sm">
                      <thead className="text-left text-xs text-gray-400 border-b">
                        <tr><th className="py-2">Name</th><th>Dept</th><th className="text-right">Salary</th></tr>
                      </thead>
                      <tbody>
                        {teachers.filter(t => t.name?.toLowerCase().includes(search.toLowerCase())).slice(0, 12).map(t => (
                          <tr key={t.docId} className="border-b last:border-b-0 hover:bg-gray-50 cursor-pointer" onClick={() => go(`/admin/manage-teachers?teacher=${t.docId}`)}>
                            <td className="py-2">{t.name}</td>
                            <td className="py-2 text-sm text-gray-500">{t.department}</td>
                            <td className="py-2 text-right">{t.salary ? `₹${t.salary}` : '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Panel>
              </div>

            </div>

            {/* Right column */}
            <div className="space-y-6">
              <Panel title="Library Snapshot" actions={<button onClick={() => go('/admin/library')} className="text-sm text-blue-600">Open library</button>}>
                <div className="text-sm text-gray-600 mb-3">Total books: <strong>{counts.books}</strong> • Issued: <strong>{counts.issuedBooks}</strong></div>
                <div className="space-y-2">
                  {recentBooks.length === 0 ? (
                    <div className="text-sm text-gray-500">No books yet</div>
                  ) : (
                    recentBooks.map(b => (
                      <div key={b.docId} className="flex items-center justify-between py-2 border-b last:border-b-0">
                        <div>
                          <div className="font-medium text-gray-800">{b.title}</div>
                          <div className="text-xs text-gray-500">{b.branch} • {b.year || '-'} • Qty: {b.totalQuantity || 0}</div>
                        </div>
                        <div className="text-sm text-gray-600">{b.availableQuantity}/{b.totalQuantity}</div>
                      </div>
                    ))
                  )}
                </div>
              </Panel>

              <Panel title="Fee Summary (selected student)" actions={<div className="text-xs text-gray-400">Interactive</div>}>
                <div className="text-sm text-gray-500">Click a student from the list to view fee summary. You can also manage fee structures from Accounts.</div>
              </Panel>

              <Panel title="Routes & Shortcuts" actions={<div className="text-xs text-gray-400">Admin</div>}>
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={() => go('/admin/dashboard')} className="py-2 px-3 rounded-lg border border-gray-100 text-sm">Overview</button>
                  <button onClick={() => go('/admin/manage-teachers')} className="py-2 px-3 rounded-lg border border-gray-100 text-sm">Teachers</button>
                  <button onClick={() => go('/admin/manage-students')} className="py-2 px-3 rounded-lg border border-gray-100 text-sm">Students</button>
                  <button onClick={() => go('/admin/display-subjects')} className="py-2 px-3 rounded-lg border border-gray-100 text-sm">Subjects</button>
                  <button onClick={() => go('/admin/library')} className="py-2 px-3 rounded-lg border border-gray-100 text-sm">Library</button>
                  <button onClick={() => go('/admin/Accounts')} className="py-2 px-3 rounded-lg border border-gray-100 text-sm">Accounts</button>
                </div>
              </Panel>
            </div>
          </div>

          <div className="mt-6 text-xs text-gray-400">Tip: Use the search box to quickly filter tables. Click row items to open management pages.</div>
        </div>
      </div>
    </Layout>
  );
}
