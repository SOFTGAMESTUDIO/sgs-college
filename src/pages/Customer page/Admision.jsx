import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AcademicCapIcon,
  UserCircleIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  CalendarIcon,
  BookOpenIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  XMarkIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";

const AdmissionsPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    dob: "",
    gender: "",
    program: "",
    specialization: "",
    previousEducation: "",
    percentage: "",
    yearOfPassing: "",
    emergencyContact: "",
    message: "",
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errors, setErrors] = useState({});

  // Available programs
  const programs = [
    "Bachelor of Technology (B.Tech)",
    "Bachelor of Computer Applications (BCA)",
    "Bachelor of Science (B.Sc)",
    "Bachelor of Commerce (B.Com)",
    "Bachelor of Business Administration (BBA)",
    "Master of Technology (M.Tech)",
    "Master of Computer Applications (MCA)",
    "Master of Science (M.Sc)",
    "Master of Business Administration (MBA)",
    "Ph.D. Programs",
  ];

  // Specializations by program
  const specializations = {
    "Bachelor of Technology (B.Tech)": [
      "Computer Science & Engineering",
      "Information Technology",
      "Electronics & Communication",
      "Mechanical Engineering",
      "Civil Engineering",
      "Electrical Engineering",
    ],
    "Bachelor of Computer Applications (BCA)": [
      "Software Development",
      "Data Science",
      "Cyber Security",
      "Web Technologies",
    ],
    "Bachelor of Science (B.Sc)": [
      "Mathematics",
      "Physics",
      "Chemistry",
      "Computer Science",
      "Biotechnology",
    ],
    "Master of Technology (M.Tech)": [
      "Artificial Intelligence",
      "Machine Learning",
      "Data Science",
      "Cyber Security",
      "VLSI Design",
    ],
    "Master of Business Administration (MBA)": [
      "Finance",
      "Marketing",
      "Human Resources",
      "Operations",
      "International Business",
    ],
    "Other": ["General"],
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Required fields validation
    if (!formData.firstName.trim()) newErrors.firstName = "First name is required";
    if (!formData.lastName.trim()) newErrors.lastName = "Last name is required";
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }
    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^[0-9]{10}$/.test(formData.phone)) {
      newErrors.phone = "Invalid phone number (10 digits required)";
    }
    if (!formData.dob) newErrors.dob = "Date of birth is required";
    if (!formData.program) newErrors.program = "Program selection is required";
    if (!formData.previousEducation) newErrors.previousEducation = "Previous education is required";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      // Scroll to first error
      const firstError = Object.keys(errors)[0];
      if (firstError) {
        document.getElementById(firstError)?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }
      return;
    }
    
    setIsSubmitting(true);
    
    // Simulate API call delay
    setTimeout(() => {
      // In a real application, you would send the data to a server here
      console.log("Form submitted locally:", formData);
      
      // Show success message
      setShowSuccess(true);
      setIsSubmitting(false);
      
      // Reset form
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        address: "",
        city: "",
        state: "",
        pincode: "",
        dob: "",
        gender: "",
        program: "",
        specialization: "",
        previousEducation: "",
        percentage: "",
        yearOfPassing: "",
        emergencyContact: "",
        message: "",
      });
      
      // Auto-hide success message after 5 seconds
      setTimeout(() => {
        setShowSuccess(false);
      }, 5000);
    }, 1500);
  };

  const handlePrintApplication = () => {
    window.print();
  };

  // Success Popup Component
  const SuccessPopup = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full animate-in slide-in-from-bottom-5">
        <div className="p-8">
          <div className="flex justify-center mb-6">
            <div className="h-20 w-20 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircleIcon className="h-12 w-12 text-green-600" />
            </div>
          </div>
          
          <h3 className="text-2xl font-bold text-gray-900 text-center mb-4">
            Application Submitted Successfully!
          </h3>
          
          <p className="text-gray-600 text-center mb-6">
            Thank you for applying to SGS College. Your application has been received.
            Our admissions team will review your application and contact you within 
            5-7 working days.
          </p>
          
          <div className="bg-blue-50 rounded-xl p-4 mb-6">
            <div className="flex items-start space-x-3">
              <InformationCircleIcon className="h-6 w-6 text-blue-500 flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-semibold text-blue-900 mb-1">What's Next?</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Check your email for application confirmation</li>
                  <li>• Prepare required documents for verification</li>
                  <li>• Await invitation for counseling session</li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="flex space-x-4">
            <button
              onClick={() => setShowSuccess(false)}
              className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700"
            >
              Close
            </button>
            <button
              onClick={handlePrintApplication}
              className="flex-1 border-2 border-blue-600 text-blue-600 py-3 rounded-lg font-medium hover:bg-blue-50"
            >
              Print Application
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-900 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigate("/")}>
              <AcademicCapIcon className="h-10 w-10 text-blue-300" />
              <div>
                <h1 className="text-2xl font-bold tracking-tight">SGS College</h1>
                <p className="text-sm text-blue-200">Admissions</p>
              </div>
            </div>
            <button
              onClick={() => navigate("/")}
              className="bg-white/10 hover:bg-white/20 text-white font-medium px-6 py-2 rounded-lg transition-colors"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Apply for <span className="text-blue-700">Admissions</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Begin your academic journey at SGS College. Fill out the application form below and take the first step toward excellence.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-4">
            <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-medium">
              Last Date: June 30, 2024
            </div>
            <div className="bg-green-50 text-green-700 px-4 py-2 rounded-full text-sm font-medium">
              Entrance Test: July 15, 2024
            </div>
            <div className="bg-purple-50 text-purple-700 px-4 py-2 rounded-full text-sm font-medium">
              Counseling: August 1-10, 2024
            </div>
          </div>
        </div>

        {/* Application Form */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden mb-12">
          {/* Form Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <DocumentTextIcon className="h-8 w-8" />
                <div>
                  <h2 className="text-2xl font-bold">Admission Application Form</h2>
                  <p className="text-blue-200 text-sm">Fill all fields carefully. * indicates required field.</p>
                </div>
              </div>
              <div className="hidden md:block text-right">
                <p className="text-sm text-blue-200">Application ID: <span className="font-mono">SGS-{Date.now().toString().slice(-6)}</span></p>
                <p className="text-sm text-blue-200">Date: {new Date().toLocaleDateString()}</p>
              </div>
            </div>
          </div>

          {/* Form Content */}
          <div className="p-6 md:p-8">
            <form onSubmit={handleSubmit}>
              {/* Personal Details Section */}
              <div className="mb-12">
                <div className="flex items-center mb-6 pb-4 border-b border-gray-200">
                  <UserCircleIcon className="h-6 w-6 text-blue-600 mr-3" />
                  <h3 className="text-xl font-bold text-gray-900">Personal Details</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* First Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      First Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="firstName"
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.firstName ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="Enter your first name"
                    />
                    {errors.firstName && (
                      <p className="mt-2 text-sm text-red-600">{errors.firstName}</p>
                    )}
                  </div>

                  {/* Last Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Last Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="lastName"
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.lastName ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="Enter your last name"
                    />
                    {errors.lastName && (
                      <p className="mt-2 text-sm text-red-600">{errors.lastName}</p>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="email"
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className={`w-full pl-10 px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          errors.email ? "border-red-500" : "border-gray-300"
                        }`}
                        placeholder="student@example.com"
                      />
                    </div>
                    {errors.email && (
                      <p className="mt-2 text-sm text-red-600">{errors.email}</p>
                    )}
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <PhoneIcon className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="phone"
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className={`w-full pl-10 px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          errors.phone ? "border-red-500" : "border-gray-300"
                        }`}
                        placeholder="9876543210"
                      />
                    </div>
                    {errors.phone && (
                      <p className="mt-2 text-sm text-red-600">{errors.phone}</p>
                    )}
                  </div>

                  {/* Date of Birth */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date of Birth <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <CalendarIcon className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="dob"
                        type="date"
                        name="dob"
                        value={formData.dob}
                        onChange={handleInputChange}
                        className={`w-full pl-10 px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          errors.dob ? "border-red-500" : "border-gray-300"
                        }`}
                      />
                    </div>
                    {errors.dob && (
                      <p className="mt-2 text-sm text-red-600">{errors.dob}</p>
                    )}
                  </div>

                  {/* Gender */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Gender
                    </label>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select Gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                      <option value="prefer-not-to-say">Prefer not to say</option>
                    </select>
                  </div>

                  {/* Address */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Address
                    </label>
                    <div className="relative">
                      <div className="absolute top-3 left-0 pl-3 flex items-center pointer-events-none">
                        <MapPinIcon className="h-5 w-5 text-gray-400" />
                      </div>
                      <textarea
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        rows="3"
                        className="w-full pl-10 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter your complete address"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Academic Details Section */}
              <div className="mb-12">
                <div className="flex items-center mb-6 pb-4 border-b border-gray-200">
                  <BookOpenIcon className="h-6 w-6 text-blue-600 mr-3" />
                  <h3 className="text-xl font-bold text-gray-900">Academic Details</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Program Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Program Applied For <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="program"
                      name="program"
                      value={formData.program}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.program ? "border-red-500" : "border-gray-300"
                      }`}
                    >
                      <option value="">Select Program</option>
                      {programs.map((program) => (
                        <option key={program} value={program}>
                          {program}
                        </option>
                      ))}
                    </select>
                    {errors.program && (
                      <p className="mt-2 text-sm text-red-600">{errors.program}</p>
                    )}
                  </div>

                  {/* Specialization */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Specialization (if applicable)
                    </label>
                    <select
                      name="specialization"
                      value={formData.specialization}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      disabled={!formData.program}
                    >
                      <option value="">Select Specialization</option>
                      {(specializations[formData.program] || specializations.Other).map((spec) => (
                        <option key={spec} value={spec}>
                          {spec}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Previous Education */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Previous Education <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="previousEducation"
                      type="text"
                      name="previousEducation"
                      value={formData.previousEducation}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.previousEducation ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="e.g., 12th Grade / Bachelor's Degree"
                    />
                    {errors.previousEducation && (
                      <p className="mt-2 text-sm text-red-600">{errors.previousEducation}</p>
                    )}
                  </div>

                  {/* Percentage/GPA */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Percentage / GPA
                    </label>
                    <input
                      type="text"
                      name="percentage"
                      value={formData.percentage}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., 85% or 3.5"
                    />
                  </div>
                </div>
              </div>

              {/* Additional Information */}
              <div className="mb-12">
                <div className="flex items-center mb-6 pb-4 border-b border-gray-200">
                  <InformationCircleIcon className="h-6 w-6 text-blue-600 mr-3" />
                  <h3 className="text-xl font-bold text-gray-900">Additional Information</h3>
                </div>
                
                <div className="grid grid-cols-1 gap-6">
                  {/* Emergency Contact */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Emergency Contact Number
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <PhoneIcon className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="tel"
                        name="emergencyContact"
                        value={formData.emergencyContact}
                        onChange={handleInputChange}
                        className="w-full pl-10 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Emergency contact number"
                      />
                    </div>
                  </div>

                  {/* Additional Message */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Additional Message (Optional)
                    </label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      rows="4"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Any additional information or questions..."
                    />
                  </div>
                </div>
              </div>

              {/* Terms and Conditions */}
              <div className="mb-8 p-6 bg-gray-50 rounded-xl">
                <div className="flex items-start">
                  <input
                    type="checkbox"
                    id="terms"
                    required
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-1"
                  />
                  <label htmlFor="terms" className="ml-3 text-sm text-gray-600">
                    I hereby declare that all the information provided in this application form is true, 
                    complete, and correct to the best of my knowledge. I understand that any false 
                    statement may lead to the rejection of my application or cancellation of admission.
                  </label>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-gradient-to-r from-blue-700 to-blue-800 text-white py-4 px-8 rounded-xl font-bold text-lg hover:from-blue-800 hover:to-blue-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing Application...
                    </span>
                  ) : (
                    "Submit Application"
                  )}
                </button>
                
                <button
                  type="button"
                  onClick={() => {
                    setFormData({
                      firstName: "",
                      lastName: "",
                      email: "",
                      phone: "",
                      address: "",
                      city: "",
                      state: "",
                      pincode: "",
                      dob: "",
                      gender: "",
                      program: "",
                      specialization: "",
                      previousEducation: "",
                      percentage: "",
                      yearOfPassing: "",
                      emergencyContact: "",
                      message: "",
                    });
                    setErrors({});
                  }}
                  className="flex-1 border-2 border-gray-300 text-gray-700 py-4 px-8 rounded-xl font-bold text-lg hover:bg-gray-50 transition-colors"
                >
                  Clear Form
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Important Information */}
        <div className="bg-blue-50 rounded-2xl p-8 mb-12">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Admission Process & Requirements
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="text-blue-600 text-3xl font-bold mb-3">01</div>
              <h4 className="font-bold text-gray-900 mb-2">Fill Application</h4>
              <p className="text-gray-600 text-sm">Complete the online application form with accurate details.</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="text-blue-600 text-3xl font-bold mb-3">02</div>
              <h4 className="font-bold text-gray-900 mb-2">Document Verification</h4>
              <p className="text-gray-600 text-sm">Submit required documents for verification process.</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="text-blue-600 text-3xl font-bold mb-3">03</div>
              <h4 className="font-bold text-gray-900 mb-2">Entrance Test</h4>
              <p className="text-gray-600 text-sm">Appear for entrance examination (if applicable).</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="text-blue-600 text-3xl font-bold mb-3">04</div>
              <h4 className="font-bold text-gray-900 mb-2">Counseling & Admission</h4>
              <p className="text-gray-600 text-sm">Attend counseling session and complete admission formalities.</p>
            </div>
          </div>
        </div>

        {/* Contact for Help */}
        <div className="text-center bg-white rounded-2xl shadow-sm p-8 border border-gray-100">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Need Help with Application?</h3>
          <p className="text-gray-600 mb-6">
            Our admission counselors are available to assist you with the application process.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="tel:+919876543210" className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              <PhoneIcon className="h-5 w-5 mr-2" />
              Call Admission Helpline
            </a>
            <a href="mailto:admissions@sgscollege.edu" className="inline-flex items-center justify-center px-6 py-3 border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50">
              <EnvelopeIcon className="h-5 w-5 mr-2" />
              Email Admissions Office
            </a>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <AcademicCapIcon className="h-8 w-8 text-blue-400" />
              <div>
                <div className="font-bold text-lg">SGS College Admissions</div>
                <div className="text-sm text-gray-400">Academic Year 2024-25</div>
              </div>
            </div>
            <div className="text-sm text-gray-400">
              © {new Date().getFullYear()} SGS College. All rights reserved.
            </div>
          </div>
        </div>
      </footer>

      {/* Success Popup */}
      {showSuccess && <SuccessPopup />}
    </div>
  );
};

export default AdmissionsPage;