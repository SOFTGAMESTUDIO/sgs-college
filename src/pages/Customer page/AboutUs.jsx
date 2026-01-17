import React from "react";
import { useNavigate } from "react-router-dom";
import {
  AcademicCapIcon,
  UserGroupIcon,
  BuildingLibraryIcon,
  TrophyIcon,
  GlobeAltIcon,
  CalendarIcon,
  BookOpenIcon,
  ChartBarIcon,
  HeartIcon,
  LightBulbIcon,
  ShieldCheckIcon,
  StarIcon,
  ClockIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
} from "@heroicons/react/24/outline";
import {
  FaGraduationCap,
  FaChalkboardTeacher,
  FaUserGraduate,
  FaAward,
  FaHandshake,
  FaUsers,
  FaBookReader,
  FaLaptopCode,
  FaMicroscope,
  FaBalanceScale,
} from "react-icons/fa";
import { UserCircleIcon } from "lucide-react";

const AboutPage = () => {
  const navigate = useNavigate();

  // College Statistics
  const collegeStats = [
    { value: "1995", label: "Established Since", icon: CalendarIcon, color: "text-blue-600", bgColor: "bg-blue-100" },
    { value: "5000+", label: "Students Enrolled", icon: UserGroupIcon, color: "text-green-600", bgColor: "bg-green-100" },
    { value: "250+", label: "Expert Faculty", icon: AcademicCapIcon, color: "text-purple-600", bgColor: "bg-purple-100" },
    { value: "50+", label: "Academic Programs", icon: BookOpenIcon, color: "text-amber-600", bgColor: "bg-amber-100" },
    { value: "96%", label: "Placement Rate", icon: TrophyIcon, color: "text-red-600", bgColor: "bg-red-100" },
    { value: "25+", label: "Industry Partners", icon: HandshakeIcon, color: "text-indigo-600", bgColor: "bg-indigo-100" },
  ];

  // Core Values
  const coreValues = [
    {
      title: "Excellence in Education",
      description: "Committed to delivering highest quality education through innovative teaching methods",
      icon: FaGraduationCap,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Student-Centric Approach",
      description: "Focus on holistic development and personalized attention for every student",
      icon: FaUserGraduate,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Industry Integration",
      description: "Strong industry-academia collaboration for real-world learning experiences",
      icon: FaLaptopCode,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      title: "Research & Innovation",
      description: "Promoting research culture and innovative thinking across disciplines",
      icon: FaMicroscope,
      color: "text-amber-600",
      bgColor: "bg-amber-50",
    },
    {
      title: "Ethical Leadership",
      description: "Developing responsible citizens and ethical leaders for tomorrow",
      icon: FaBalanceScale,
      color: "text-red-600",
      bgColor: "bg-red-50",
    },
    {
      title: "Global Perspective",
      description: "Preparing students for global opportunities and challenges",
      icon: GlobeAltIcon,
      color: "text-indigo-600",
      bgColor: "bg-indigo-50",
    },
  ];

  // Accreditation & Recognition
  const accreditations = [
    "NAAC 'A' Grade Accredited",
    "UGC Recognized",
    "AICTE Approved",
    "NBA Accredited Programs",
    "ISO 9001:2015 Certified",
    "Ranked Among Top 100 Colleges in India",
  ];

  // Leadership Team
  const leadershipTeam = [
    {
      name: "Dr. Rajesh Kumar",
      position: "Principal",
      qualification: "Ph.D. in Computer Science, IIT Delhi",
      experience: "25+ years in academia",
      imgColor: "bg-blue-100",
    },
    {
      name: "Prof. Meena Sharma",
      position: "Dean - Academics",
      qualification: "Ph.D. in Electronics, NIT Trichy",
      experience: "20+ years of teaching experience",
      imgColor: "bg-green-100",
    },
    {
      name: "Prof. Amit Patel",
      position: "Dean - Student Affairs",
      qualification: "Ph.D. in Management, IIM Ahmedabad",
      experience: "18+ years in student development",
      imgColor: "bg-purple-100",
    },
    {
      name: "Dr. Priya Singh",
      position: "Dean - Research",
      qualification: "Ph.D. in Biotechnology, IISc Bangalore",
      experience: "22+ years in research",
      imgColor: "bg-amber-100",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* College Header */}
      <div className="bg-gradient-to-r from-blue-900 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigate("/")}>
              <AcademicCapIcon className="h-10 w-10 text-blue-300" />
              <div>
                <h1 className="text-2xl font-bold tracking-tight">SGS College</h1>
                <p className="text-sm text-blue-200">Excellence in Education Since 1995</p>
              </div>
            </div>
            <button
              onClick={() => navigate("/admissions")}
              className="bg-white text-blue-800 font-semibold px-6 py-2 rounded-lg hover:bg-blue-50 transition-colors"
            >
              Apply Now
            </button>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="py-16 text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            About <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-blue-900">SGS College</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto mb-8">
            Pioneering Excellence in Higher Education and Innovation for over 25 Years
          </p>
         
        </div>

        {/* College Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-16">
          {collegeStats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="bg-white rounded-xl shadow-lg p-6 text-center border border-gray-100">
                <div className={`inline-flex p-3 rounded-lg ${stat.bgColor} ${stat.color} mb-4`}>
                  <Icon className="h-8 w-8" />
                </div>
                <div className="text-3xl font-bold text-gray-900">{stat.value}</div>
                <div className="text-sm font-semibold text-gray-700 mt-1">{stat.label}</div>
              </div>
            );
          })}
        </div>

        {/* Mission & Vision */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20">
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-10">
            <div className="flex items-center mb-6">
              <div className="bg-blue-600 p-3 rounded-xl">
                <LightBulbIcon className="h-10 w-10 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 ml-4">Our Vision</h2>
            </div>
            <p className="text-gray-700 text-lg leading-relaxed">
              To be a globally recognized institution of excellence that transforms lives through innovative education, 
              cutting-edge research, and sustainable development. We envision creating leaders who will shape the future 
              with integrity, creativity, and social responsibility.
            </p>
            <div className="mt-8 grid grid-cols-2 gap-4">
              {["Global Recognition", "Innovation Hub", "Leadership Development", "Social Impact"].map((item, idx) => (
                <div key={idx} className="flex items-center bg-white/50 p-3 rounded-lg">
                  <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />
                  <span className="font-medium">{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl p-10">
            <div className="flex items-center mb-6">
              <div className="bg-emerald-600 p-3 rounded-xl">
                <TargetIcon className="h-10 w-10 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 ml-4">Our Mission</h2>
            </div>
            <p className="text-gray-700 text-lg leading-relaxed">
              To provide accessible, high-quality education that fosters intellectual growth, critical thinking, 
              and ethical values. We are committed to creating an inclusive learning environment that prepares 
              students for successful careers and meaningful contributions to society.
            </p>
            <div className="mt-8 grid grid-cols-2 gap-4">
              {["Quality Education", "Inclusive Learning", "Career Success", "Community Service"].map((item, idx) => (
                <div key={idx} className="flex items-center bg-white/50 p-3 rounded-lg">
                  <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />
                  <span className="font-medium">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Core Values */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Core Values</h2>
            <p className="text-gray-600 max-w-3xl mx-auto">
              The guiding principles that define our educational philosophy and institutional culture
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {coreValues.map((value, index) => {
              const Icon = value.icon;
              return (
                <div key={index} className="bg-white rounded-xl shadow-lg p-8 border border-gray-100 hover:shadow-xl transition-shadow duration-300">
                  <div className={`inline-flex p-4 rounded-xl ${value.bgColor} ${value.color} mb-6`}>
                    <Icon className="h-10 w-10" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{value.title}</h3>
                  <p className="text-gray-600">{value.description}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Accreditation & Recognition */}
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl text-white p-12 mb-20">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold mb-4">Accreditation & Recognition</h2>
            <p className="text-gray-300 max-w-2xl mx-auto">
              Our commitment to quality education is validated by prestigious accreditations and rankings
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {accreditations.map((item, index) => (
              <div key={index} className="bg-white/10 backdrop-blur-sm p-4 rounded-xl text-center hover:bg-white/20 transition-colors">
                <ShieldCheckIcon className="h-8 w-8 text-blue-300 mx-auto mb-3" />
                <span className="text-sm font-medium">{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Leadership Team */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Leadership Team</h2>
            <p className="text-gray-600 max-w-3xl mx-auto">
              Experienced academic leaders guiding our institution towards excellence
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {leadershipTeam.map((member, index) => (
              <div key={index} className="bg-white rounded-xl shadow-lg p-6 text-center border border-gray-100 hover:shadow-xl transition-shadow">
                <div className={`w-24 h-24 rounded-full mx-auto mb-4 ${member.imgColor} flex items-center justify-center`}>
                  <UserCircleIcon className="h-16 w-16 text-gray-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-1">{member.name}</h3>
                <p className="text-blue-600 font-semibold mb-3">{member.position}</p>
                <p className="text-sm text-gray-600 mb-2">{member.qualification}</p>
                <p className="text-xs text-gray-500">{member.experience}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Campus Facilities */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">World-Class Campus Facilities</h2>
            <p className="text-gray-600 max-w-3xl mx-auto">
              State-of-the-art infrastructure supporting academic excellence and holistic development
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: "Digital Library",
                description: "Extensive collection of books, journals, and digital resources with 24/7 access",
                icon: BookOpenIcon,
                color: "text-blue-600",
              },
              {
                title: "Advanced Labs",
                description: "Well-equipped laboratories for engineering, science, and research activities",
                icon: FaMicroscope,
                color: "text-green-600",
              },
              {
                title: "Smart Classrooms",
                description: "Technology-enabled classrooms with interactive learning tools",
                icon: FaChalkboardTeacher,
                color: "text-purple-600",
              },
              {
                title: "Sports Complex",
                description: "Modern sports facilities including gymnasium, courts, and fields",
                icon: TrophyIcon,
                color: "text-red-600",
              },
              {
                title: "Hostel Facilities",
                description: "Comfortable accommodation with modern amenities for students",
                icon: BuildingLibraryIcon,
                color: "text-amber-600",
              },
              {
                title: "Innovation Center",
                description: "Dedicated space for startups, research, and innovation projects",
                icon: LightBulbIcon,
                color: "text-indigo-600",
              },
            ].map((facility, index) => {
              const Icon = facility.icon;
              return (
                <div key={index} className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
                  <div className="flex items-start space-x-4">
                    <div className={`p-3 rounded-lg bg-gray-50 ${facility.color}`}>
                      <Icon className="h-8 w-8" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-2">{facility.title}</h3>
                      <p className="text-gray-600">{facility.description}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Call to Action */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl text-white p-12 mb-20 text-center">
          <h2 className="text-3xl font-bold mb-6">Begin Your Journey at SGS College</h2>
          <p className="text-blue-100 text-lg mb-8 max-w-2xl mx-auto">
            Join our community of learners, innovators, and future leaders. Apply now for the upcoming academic year.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate("/admissions")}
              className="bg-white text-blue-700 font-bold px-8 py-4 rounded-xl hover:bg-blue-50 text-lg flex items-center justify-center"
            >
              Apply for Admission
              <ArrowRightIcon className="ml-2 h-5 w-5" />
            </button>
            
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-10 border border-gray-100">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Contact Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-50 p-4 rounded-xl inline-flex mb-4">
                <MapPinIcon className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Campus Address</h3>
              <p className="text-gray-600">
                SGS College Campus<br />
                Academic Road, Technology District<br />
                City, State - 152116
              </p>
            </div>
            <div className="text-center">
              <div className="bg-green-50 p-4 rounded-xl inline-flex mb-4">
                <PhoneIcon className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Phone Numbers</h3>
              <p className="text-gray-600">
                Admissions: +91 9876543210<br />
                Administration: +91 9876543210<br />
                Helpline: 1800-123-4567
              </p>
            </div>
            <div className="text-center">
              <div className="bg-red-50 p-4 rounded-xl inline-flex mb-4">
                <EnvelopeIcon className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Email Addresses</h3>
              <p className="text-gray-600">
                admissions@sgscollege.edu<br />
                info@sgscollege.edu<br />
                support@sgscollege.edu
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <AcademicCapIcon className="h-8 w-8 text-blue-400" />
              <div>
                <div className="font-bold text-lg">SGS College</div>
                <div className="text-sm text-gray-400">Excellence in Education Since 1995</div>
              </div>
            </div>
            <div className="text-sm text-gray-400">
              © {new Date().getFullYear()} SGS College of Technology & Management. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

// Custom TargetIcon component
const TargetIcon = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    {...props}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
    />
  </svg>
);

// Custom HandshakeIcon component
const HandshakeIcon = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    {...props}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
    />
  </svg>
);

export default AboutPage;