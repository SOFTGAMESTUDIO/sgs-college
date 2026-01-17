import React, { useEffect, useState, useMemo } from "react";
import { db } from "../../db/firebaseConfig";
import {
  collection,
  getDocs,
  query,
  where,
  doc,
  getDoc,
} from "firebase/firestore";
import { useParams } from "react-router-dom";
import { useAuth } from "../../auth/authProvider";
import Layout from "../../components/Layout";
import { motion, AnimatePresence } from "framer-motion";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Bar, Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function SubjectMarksAnalysis() {
  const { id } = useParams();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [subject, setSubject] = useState(null);
  const [marks, setMarks] = useState({
    mst1: null,
    mst2: null,
    final: null,
  });
  const [allStudentsMarks, setAllStudentsMarks] = useState([]);
  const [selectedExam, setSelectedExam] = useState("mst1");
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [performanceStats, setPerformanceStats] = useState(null);
  const [analysisView, setAnalysisView] = useState("overview"); // overview, comparison, trends

  useEffect(() => {
    if (!user?.uid) return;

    const fetchData = async () => {
      try {
        // Fetch student profile
        const studentQ = query(
          collection(db, "students"),
          where("uid", "==", user.uid)
        );
        const studentSnap = await getDocs(studentQ);
        if (studentSnap.empty) return;

        const studentData = studentSnap.docs[0].data();
        const rollNo = studentData.rollNo;
        setSelectedStudentId(rollNo);

        // Fetch subject
        const subjectSnap = await getDoc(doc(db, "subjects", id));
        if (subjectSnap.exists()) {
          const subjectData = { id: subjectSnap.id, ...subjectSnap.data() };
          setSubject(subjectData);

          // Fetch all students' marks for each exam
          const exams = ["mst1", "mst2", "final"];
          let marksData = {};
          let allMarksData = {};

          for (const exam of exams) {
            // Fetch current student's marks
            const snap = await getDocs(
              collection(db, "subjects", id, "marks", exam, "records")
            );

            let found = null;
            const examMarks = [];

            snap.forEach((docSnap) => {
              const data = docSnap.data();
              const records = data.records || [];

              // Collect all students' marks
              records.forEach(record => {
                examMarks.push({
                  rollNo: record.rollNo,
                  marks: record.marks,
                  maxMarks: data.maxMarks,
                  examType: exam
                });
              });

              // Find current student's marks
              const record = records.find(r => r.rollNo === rollNo);
              if (record) {
                found = {
                  marks: record.marks,
                  maxMarks: data.maxMarks,
                  percentage: (record.marks / data.maxMarks) * 100
                };
              }
            });

            marksData[exam] = found;
            allMarksData[exam] = examMarks;
          }

          setMarks(marksData);
          
          // Process all students' marks
          const processedMarks = processAllMarks(allMarksData);
          setAllStudentsMarks(processedMarks);

          // Calculate performance statistics
          calculatePerformanceStats(processedMarks, rollNo);
        }
      } catch (err) {
        console.error("Error fetching marks:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, user]);

  const processAllMarks = (allMarksData) => {
    const studentMap = new Map();
    
    // Process each exam's marks
    Object.entries(allMarksData).forEach(([exam, marks]) => {
      marks.forEach(mark => {
        if (!studentMap.has(mark.rollNo)) {
          studentMap.set(mark.rollNo, {
            rollNo: mark.rollNo,
            mst1: null,
            mst2: null,
            final: null,
            total: 0,
            average: 0,
            rank: null
          });
        }
        
        const student = studentMap.get(mark.rollNo);
        student[exam] = {
          marks: mark.marks,
          maxMarks: mark.maxMarks,
          percentage: (mark.marks / mark.maxMarks) * 100
        };
      });
    });

    // Calculate totals, averages, and rank
    const students = Array.from(studentMap.values());
    
    students.forEach(student => {
      const exams = ['mst1', 'mst2', 'final'].filter(exam => student[exam]);
      if (exams.length > 0) {
        const totalMarks = exams.reduce((sum, exam) => sum + student[exam].marks, 0);
        const maxTotal = exams.reduce((sum, exam) => sum + student[exam].maxMarks, 0);
        student.total = totalMarks;
        student.average = maxTotal > 0 ? (totalMarks / maxTotal) * 100 : 0;
      }
    });

    // Rank students by average
    students.sort((a, b) => b.average - a.average);
    students.forEach((student, index) => {
      student.rank = index + 1;
    });

    return students;
  };

  const calculatePerformanceStats = (students, currentRollNo) => {
    const currentStudent = students.find(s => s.rollNo === currentRollNo);
    if (!currentStudent) return;

    const averages = students.map(s => s.average).filter(avg => avg > 0);
    const mean = averages.reduce((a, b) => a + b, 0) / averages.length;
    const sorted = averages.sort((a, b) => a - b);
    const median = sorted[Math.floor(sorted.length / 2)];
    const min = Math.min(...averages);
    const max = Math.max(...averages);

    const currentAvg = currentStudent.average;
    let performance = "Average";
    if (currentAvg >= max * 0.9) performance = "Excellent";
    else if (currentAvg >= mean * 1.1) performance = "Above Average";
    else if (currentAvg <= mean * 0.9) performance = "Below Average";

    setPerformanceStats({
      rank: currentStudent.rank,
      totalStudents: students.length,
      percentile: ((students.length - currentStudent.rank) / students.length) * 100,
      average: mean,
      median,
      min,
      max,
      performance,
      currentAverage: currentAvg
    });
  };

  // Chart data for student's performance
  const studentChartData = {
    labels: ["MST 1", "MST 2", "Final Exam"],
    datasets: [
      {
        label: "Marks Obtained",
        data: [
          marks.mst1?.marks ?? 0,
          marks.mst2?.marks ?? 0,
          marks.final?.marks ?? 0,
        ],
        backgroundColor: [
          "rgba(99, 102, 241, 0.8)",
          "rgba(34, 197, 94, 0.8)",
          "rgba(245, 158, 11, 0.8)"
        ],
        borderColor: [
          "rgb(99, 102, 241)",
          "rgb(34, 197, 94)",
          "rgb(245, 158, 11)"
        ],
        borderWidth: 2,
        borderRadius: 8,
      },
      {
        label: "Maximum Marks",
        data: [
          marks.mst1?.maxMarks ?? 0,
          marks.mst2?.maxMarks ?? 0,
          marks.final?.maxMarks ?? 0,
        ],
        backgroundColor: "rgba(156, 163, 175, 0.2)",
        borderColor: "rgb(156, 163, 175)",
        borderWidth: 1,
        borderRadius: 8,
      }
    ],
  };

  // Chart data for class distribution
  const distributionChartData = useMemo(() => {
    const examData = allStudentsMarks
      .filter(s => s[selectedExam])
      .map(s => s[selectedExam].percentage);
    
    const ranges = [
      { label: "90-100", min: 90, max: 100 },
      { label: "80-89", min: 80, max: 89 },
      { label: "70-79", min: 70, max: 79 },
      { label: "60-69", min: 60, max: 69 },
      { label: "50-59", min: 50, max: 59 },
      { label: "Below 50", min: 0, max: 49 },
    ];

    const distribution = ranges.map(range => ({
      label: range.label,
      count: examData.filter(p => p >= range.min && p <= range.max).length
    }));

    return {
      labels: distribution.map(d => d.label),
      datasets: [{
        label: `Number of Students (${selectedExam.toUpperCase()})`,
        data: distribution.map(d => d.count),
        backgroundColor: [
          "rgba(34, 197, 94, 0.7)",
          "rgba(134, 239, 172, 0.7)",
          "rgba(253, 224, 71, 0.7)",
          "rgba(251, 191, 36, 0.7)",
          "rgba(249, 115, 22, 0.7)",
          "rgba(239, 68, 68, 0.7)",
        ],
        borderColor: [
          "rgb(34, 197, 94)",
          "rgb(134, 239, 172)",
          "rgb(253, 224, 71)",
          "rgb(251, 191, 36)",
          "rgb(249, 115, 22)",
          "rgb(239, 68, 68)",
        ],
        borderWidth: 1,
      }]
    };
  }, [allStudentsMarks, selectedExam]);

  // Line chart for performance trend
  const trendChartData = useMemo(() => {
    const currentStudent = allStudentsMarks.find(s => s.rollNo === selectedStudentId);
    if (!currentStudent) return null;

    return {
      labels: ["MST 1", "MST 2", "Final Exam"],
      datasets: [
        {
          label: "Your Performance (%)",
          data: ['mst1', 'mst2', 'final'].map(exam => 
            currentStudent[exam]?.percentage || 0
          ),
          borderColor: "rgb(99, 102, 241)",
          backgroundColor: "rgba(99, 102, 241, 0.1)",
          fill: true,
          tension: 0.4,
        },
        {
          label: "Class Average (%)",
          data: ['mst1', 'mst2', 'final'].map(exam => {
            const examData = allStudentsMarks
              .filter(s => s[exam])
              .map(s => s[exam].percentage);
            return examData.length > 0 ? 
              examData.reduce((a, b) => a + b, 0) / examData.length : 0;
          }),
          borderColor: "rgb(156, 163, 175)",
          backgroundColor: "rgba(156, 163, 175, 0.1)",
          fill: true,
          tension: 0.4,
          borderDash: [5, 5],
        }
      ]
    };
  }, [allStudentsMarks, selectedStudentId]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          font: {
            size: 12,
            family: "'Inter', sans-serif"
          },
          padding: 20,
          usePointStyle: true,
        }
      },
      tooltip: {
        backgroundColor: 'rgba(17, 24, 39, 0.9)',
        titleFont: { size: 12 },
        bodyFont: { size: 11 },
        padding: 12,
        cornerRadius: 6,
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(229, 231, 235, 0.5)'
        },
        ticks: {
          font: {
            size: 11
          }
        }
      },
      x: {
        grid: {
          display: false
        },
        ticks: {
          font: {
            size: 11
          }
        }
      }
    },
    interaction: {
      intersect: false,
      mode: 'index',
    }
  };

  const loadingSkeleton = () => (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="h-10 bg-gray-200 rounded-lg w-64 mb-8 animate-pulse"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="h-8 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
              </div>
            ))}
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 h-96 animate-pulse"></div>
        </div>
      </div>
    </Layout>
  );

  if (loading) return loadingSkeleton();

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Marks Analysis Dashboard
                </h1>
                {subject && (
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-gray-600 font-medium">
                      {subject.subjectName}
                    </span>
                    <span className="text-gray-500">•</span>
                    <code className="text-sm bg-gray-100 text-gray-700 px-2 py-1 rounded">
                      {subject.subjectCode}
                    </code>
                  </div>
                )}
              </div>
              
              <div className="flex gap-2">
                {['overview', 'comparison', 'trends'].map((view) => (
                  <button
                    key={view}
                    onClick={() => setAnalysisView(view)}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                      analysisView === view
                        ? 'bg-indigo-600 text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                    }`}
                  >
                    {view.charAt(0).toUpperCase() + view.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Performance Stats */}
            {performanceStats && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8"
              >
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Your Rank</p>
                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-bold text-gray-900">
                          #{performanceStats.rank}
                        </span>
                        <span className="text-sm text-gray-500">
                          of {performanceStats.totalStudents}
                        </span>
                      </div>
                    </div>
                    <div className="p-3 rounded-lg bg-indigo-50">
                      <span className="text-2xl font-bold text-indigo-600">
                        {Math.round(performanceStats.percentile)}%
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <p className="text-sm text-gray-500 mb-1">Performance</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xl font-bold text-gray-900">
                      {performanceStats.performance}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      performanceStats.performance === "Excellent" ? "bg-green-100 text-green-800" :
                      performanceStats.performance === "Above Average" ? "bg-blue-100 text-blue-800" :
                      performanceStats.performance === "Below Average" ? "bg-amber-100 text-amber-800" :
                      "bg-gray-100 text-gray-800"
                    }`}>
                      {Math.round(performanceStats.currentAverage)}%
                    </span>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <p className="text-sm text-gray-500 mb-1">Class Average</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-gray-900">
                      {Math.round(performanceStats.average)}%
                    </span>
                    <span className="text-sm text-gray-500">
                      Median: {Math.round(performanceStats.median)}%
                    </span>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <p className="text-sm text-gray-500 mb-1">Score Range</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-lg font-bold text-gray-900">
                      {Math.round(performanceStats.min)}% - {Math.round(performanceStats.max)}%
                    </span>
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>

          <AnimatePresence mode="wait">
            {analysisView === "overview" && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-8"
              >
                {/* Main Performance Chart */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-lg font-semibold text-gray-900">Your Performance</h2>
                      <div className="text-sm text-gray-500">Max vs Obtained</div>
                    </div>
                    <div className="h-80">
                      <Bar data={studentChartData} options={chartOptions} />
                    </div>
                  </div>

                  <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-lg font-semibold text-gray-900">Class Distribution</h2>
                      <select
                        value={selectedExam}
                        onChange={(e) => setSelectedExam(e.target.value)}
                        className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      >
                        <option value="mst1">MST 1</option>
                        <option value="mst2">MST 2</option>
                        <option value="final">Final Exam</option>
                      </select>
                    </div>
                    <div className="h-80">
                      <Bar data={distributionChartData} options={chartOptions} />
                    </div>
                  </div>
                </div>

                {/* Marks Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[
                    { key: "mst1", label: "MST 1", color: "indigo" },
                    { key: "mst2", label: "MST 2", color: "green" },
                    { key: "final", label: "Final Exam", color: "amber" },
                  ].map((exam, i) => {
                    const examData = marks[exam.key];
                    const colorClass = {
                      indigo: "bg-indigo-50 text-indigo-700",
                      green: "bg-green-50 text-green-700",
                      amber: "bg-amber-50 text-amber-700",
                    }[exam.color];

                    return (
                      <motion.div
                        key={exam.key}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="bg-white rounded-xl shadow-lg p-6 border border-gray-200"
                      >
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="font-semibold text-gray-900">{exam.label}</h3>
                          {examData && (
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${colorClass}`}>
                              {Math.round(examData.percentage)}%
                            </span>
                          )}
                        </div>
                        
                        {examData ? (
                          <>
                            <div className="mb-4">
                              <div className="flex justify-between text-sm text-gray-600 mb-1">
                                <span>Score</span>
                                <span className="font-medium">{examData.marks}/{examData.maxMarks}</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                  className={`h-2 rounded-full ${
                                    exam.color === "indigo" ? "bg-indigo-600" :
                                    exam.color === "green" ? "bg-green-600" : "bg-amber-600"
                                  }`}
                                  style={{ width: `${Math.min(100, examData.percentage)}%` }}
                                />
                              </div>
                            </div>
                            
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-500">Performance</span>
                              <span className={`font-medium ${
                                examData.percentage >= 80 ? "text-green-600" :
                                examData.percentage >= 60 ? "text-amber-600" : "text-red-600"
                              }`}>
                                {examData.percentage >= 80 ? "Excellent" :
                                 examData.percentage >= 60 ? "Good" : "Needs Improvement"}
                              </span>
                            </div>
                          </>
                        ) : (
                          <div className="text-center py-8">
                            <div className="text-gray-400 mb-2">Not Uploaded</div>
                            <div className="text-sm text-gray-500">Marks will be available soon</div>
                          </div>
                        )}
                      </motion.div>
                    );
                  })}
                </div>

                {/* All Students Table */}
                {allStudentsMarks.length > 0 && (
                  <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                    <div className="p-6 border-b border-gray-200">
                      <h2 className="text-lg font-semibold text-gray-900">Class Performance</h2>
                      <p className="text-sm text-gray-600 mt-1">All students' marks comparison</p>
                    </div>
                    
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Rank
                            </th>
                            <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Roll No
                            </th>
                            <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              MST 1
                            </th>
                            <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              MST 2
                            </th>
                            <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Final
                            </th>
                            <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Average
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {allStudentsMarks.map((student) => (
                            <tr
                              key={student.rollNo}
                              className={`hover:bg-gray-50 ${
                                student.rollNo === selectedStudentId ? "bg-indigo-50" : ""
                              }`}
                            >
                              <td className="py-4 px-6">
                                <div className={`inline-flex items-center justify-center w-8 h-8 rounded-full ${
                                  student.rank === 1 ? "bg-amber-100 text-amber-800" :
                                  student.rank <= 3 ? "bg-green-100 text-green-800" :
                                  "bg-gray-100 text-gray-800"
                                }`}>
                                  {student.rank}
                                </div>
                              </td>
                              <td className="py-4 px-6 font-medium text-gray-900">
                                {student.rollNo}
                                {student.rollNo === selectedStudentId && (
                                  <span className="ml-2 text-xs text-indigo-600">(You)</span>
                                )}
                              </td>
                              {['mst1', 'mst2', 'final'].map((exam) => (
                                <td key={exam} className="py-4 px-6">
                                  {student[exam] ? (
                                    <div className="flex items-center">
                                      <span className="font-medium">{student[exam].marks}</span>
                                      <span className="text-xs text-gray-500 ml-1">
                                        /{student[exam].maxMarks}
                                      </span>
                                      <span className={`ml-2 text-xs px-2 py-0.5 rounded ${
                                        student[exam].percentage >= 80 ? "bg-green-100 text-green-800" :
                                        student[exam].percentage >= 60 ? "bg-amber-100 text-amber-800" :
                                        "bg-red-100 text-red-800"
                                      }`}>
                                        {Math.round(student[exam].percentage)}%
                                      </span>
                                    </div>
                                  ) : (
                                    <span className="text-gray-400 text-sm">-</span>
                                  )}
                                </td>
                              ))}
                              <td className="py-4 px-6">
                                <div className="flex items-center">
                                  <span className="font-medium">{Math.round(student.average)}%</span>
                                  <div className="ml-3 w-24 bg-gray-200 rounded-full h-2">
                                    <div
                                      className="h-2 rounded-full bg-indigo-600"
                                      style={{ width: `${Math.min(100, student.average)}%` }}
                                    />
                                  </div>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {analysisView === "trends" && trendChartData && (
              <motion.div
                key="trends"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-white rounded-xl shadow-lg p-6 border border-gray-200"
              >
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Performance Trends</h2>
                <div className="h-96">
                  <Line data={trendChartData} options={{
                    ...chartOptions,
                    scales: {
                      ...chartOptions.scales,
                      y: {
                        ...chartOptions.scales.y,
                        min: 0,
                        max: 100,
                        ticks: {
                          callback: function(value) {
                            return value + '%';
                          }
                        }
                      }
                    }
                  }} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </Layout>
  );
}