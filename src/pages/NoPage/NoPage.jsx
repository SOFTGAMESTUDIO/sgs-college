import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  AcademicCapIcon, 
  HomeIcon, 
  ArrowLeftIcon,
  MagnifyingGlassIcon,
  ExclamationTriangleIcon 
} from '@heroicons/react/24/outline';

const NoPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-gray-50">
      {/* College Header */}
      <div className="bg-gradient-to-r from-blue-900 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigate("/")}>
            <AcademicCapIcon className="h-10 w-10 text-blue-300" />
            <div>
              <h1 className="text-2xl font-bold tracking-tight">SGS College</h1>
              <p className="text-sm text-blue-200">Smart College System</p>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          {/* Animated 404 Graphic */}
          <div className="relative mx-auto w-64 h-64 mb-8">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full opacity-20 animate-pulse"></div>
            <div className="absolute inset-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full opacity-30 animate-ping"></div>
            <div className="absolute inset-20 flex items-center justify-center">
              <div className="text-center">
                <div className="text-9xl font-bold text-blue-900">404</div>
                <div className="text-xl font-semibold text-gray-700 mt-4">Page Not Found</div>
              </div>
            </div>
            <ExclamationTriangleIcon className="absolute top-0 right-0 h-12 w-12 text-yellow-500 animate-bounce" />
          </div>

          {/* Error Message */}
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Oops! <span className="text-blue-700">Page Not Found</span>
          </h1>
          
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            The page you're looking for doesn't exist or has been moved. 
            Please check the URL or navigate back to our homepage.
          </p>

          {/* Error Details */}
          <div className="bg-white rounded-xl shadow-md p-6 max-w-lg mx-auto mb-12 border border-gray-100">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                  <MagnifyingGlassIcon className="h-6 w-6 text-red-600" />
                </div>
              </div>
              <div className="text-left">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Common Reasons</h3>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-center">
                    <div className="h-2 w-2 rounded-full bg-red-500 mr-3"></div>
                    Typo in the URL or broken link
                  </li>
                  <li className="flex items-center">
                    <div className="h-2 w-2 rounded-full bg-red-500 mr-3"></div>
                    Page has been moved or deleted
                  </li>
                  <li className="flex items-center">
                    <div className="h-2 w-2 rounded-full bg-red-500 mr-3"></div>
                    You may not have access to this page
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <button
              onClick={() => navigate("/")}
              className="group inline-flex items-center justify-center px-8 py-4 text-lg font-medium rounded-xl bg-gradient-to-r from-blue-700 to-blue-800 text-white hover:from-blue-800 hover:to-blue-900 shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <HomeIcon className="h-6 w-6 mr-3 group-hover:scale-110 transition-transform" />
              Back to Homepage
            </button>
            
            <button
              onClick={() => navigate(-1)}
              className="group inline-flex items-center justify-center px-8 py-4 text-lg font-medium rounded-xl bg-white text-blue-700 border-2 border-blue-700 hover:bg-blue-50 shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <ArrowLeftIcon className="h-6 w-6 mr-3 group-hover:-translate-x-1 transition-transform" />
              Go Back
            </button>
          </div>

          {/* Quick Links */}
          <div className="max-w-3xl mx-auto">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">You might be looking for:</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div 
                onClick={() => navigate("/login")}
                className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:border-blue-200 cursor-pointer transition-all duration-200"
              >
                <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center mb-4 mx-auto">
                  <AcademicCapIcon className="h-6 w-6 text-blue-600" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Login Portal</h4>
                <p className="text-sm text-gray-600">Access your dashboard</p>
              </div>
              
              <div 
                onClick={() => navigate("/about")}
                className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:border-blue-200 cursor-pointer transition-all duration-200"
              >
                <div className="h-12 w-12 rounded-lg bg-emerald-100 flex items-center justify-center mb-4 mx-auto">
                  <AcademicCapIcon className="h-6 w-6 text-emerald-600" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">About College</h4>
                <p className="text-sm text-gray-600">Learn about SGS College</p>
              </div>
              
              <div 
                onClick={() => navigate("/contact")}
                className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:border-blue-200 cursor-pointer transition-all duration-200"
              >
                <div className="h-12 w-12 rounded-lg bg-purple-100 flex items-center justify-center mb-4 mx-auto">
                  <AcademicCapIcon className="h-6 w-6 text-purple-600" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Contact Us</h4>
                <p className="text-sm text-gray-600">Get help & support</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Support Section */}
      <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Need Assistance?</h3>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Our technical support team is available to help you navigate the system.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate("/support")}
                className="px-6 py-3 bg-white border-2 border-blue-600 text-blue-600 font-medium rounded-lg hover:bg-blue-50"
              >
                Contact Support
              </button>
              <button
                onClick={() => navigate("/faq")}
                className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700"
              >
                View FAQs
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <AcademicCapIcon className="h-8 w-8 text-blue-400" />
              <div>
                <div className="font-bold text-lg">SGS College</div>
                <div className="text-sm text-gray-400">Smart College System</div>
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

export default NoPage;