import React from "react";
import { 
  FaWhatsapp,
  FaYoutube,
  FaInstagram,
  FaFacebook,
  FaTelegram,
  FaDiscord,
  FaGithub,
  FaLinkedin,
  FaMapMarkerAlt,
  FaPhone,
  FaEnvelope,
  FaGraduationCap,
  FaChalkboardTeacher,
  FaUserGraduate,
  FaShieldAlt,
  FaBookOpen
} from "react-icons/fa";
import { 
  AcademicCapIcon,
  BuildingLibraryIcon,
  GlobeAltIcon,
  DevicePhoneMobileIcon 
} from "@heroicons/react/24/outline";
import { FaClockRotateLeft } from "react-icons/fa6";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const collegeName = "SGS College of Technology & Management";
  const systemName = "Smart College System";
  
  // Social media links data
  const socialLinks = [
    {
      name: "Facebook",
      href: "https://www.facebook.com/profile.php?id=61570435445258",
      icon: FaFacebook,
      color: "hover:bg-blue-600",
      bgColor: "bg-blue-100",
      iconColor: "text-blue-600"
    },
    {
      name: "Instagram",
      href: "https://www.instagram.com/softgamestudioofficial/",
      icon: FaInstagram,
      color: "hover:bg-pink-600",
      bgColor: "bg-pink-100",
      iconColor: "text-pink-600"
    },
    {
      name: "YouTube",
      href: "https://www.youtube.com/@SoftGameStudioOfficial",
      icon: FaYoutube,
      color: "hover:bg-red-600",
      bgColor: "bg-red-100",
      iconColor: "text-red-600"
    },
    {
      name: "WhatsApp",
      href: "https://whatsapp.com/channel/0029VaeXVLD4SpkEzB372n2B",
      icon: FaWhatsapp,
      color: "hover:bg-green-600",
      bgColor: "bg-green-100",
      iconColor: "text-green-600"
    },
    {
      name: "Telegram",
      href: "https://t.me/softgamestudio",
      icon: FaTelegram,
      color: "hover:bg-blue-500",
      bgColor: "bg-blue-100",
      iconColor: "text-blue-500"
    },
    {
      name: "GitHub",
      href: "https://github.com/SOFTGAMESTUDIO",
      icon: FaGithub,
      color: "hover:bg-gray-800",
      bgColor: "bg-gray-100",
      iconColor: "text-gray-800"
    },
    {
      name: "Discord",
      href: "https://discord.com/invite/p5mzsy6r",
      icon: FaDiscord,
      color: "hover:bg-indigo-600",
      bgColor: "bg-indigo-100",
      iconColor: "text-indigo-600"
    },
    {
      name: "LinkedIn",
      href: "https://www.linkedin.com/company/soft-game-studio/",
      icon: FaLinkedin,
      color: "hover:bg-blue-700",
      bgColor: "bg-blue-100",
      iconColor: "text-blue-700"
    },
  ];

  // Quick links
  const quickLinks = [
    { name: "Home", href: "/" },
    { name: "About College", href: "/about" },
    { name: "Admissions", href: "#" },
    { name: "Academic Calendar", href: "#" },
    { name: "Faculty Directory", href: "#" },
    { name: "Student Portal", href: "#" },
    { name: "Faculty Portal", href: "#" },
    { name: "Admin Portal", href: "#" },
    { name: "Library", href: "#" },
    { name: "Career Services", href: "#" },
    { name: "Contact Us", href: "#" },
    { name: "Privacy Policy", href: "#" },
  ];

  // Contact information
  const contactInfo = [
    {
      icon: FaMapMarkerAlt,
      text: "SGS College Campus, Academic Road, Technology District, City, State - 152116",
      url: "https://www.google.com/maps/place/SGS+College",
      bgColor: "bg-blue-50",
      iconColor: "text-blue-600"
    },
    {
      icon: FaPhone,
      text: "+91 9876543210 (Admissions)",
      url: "tel:+911234567890",
      bgColor: "bg-emerald-50",
      iconColor: "text-emerald-600"
    },
    {
      icon: FaPhone,
      text: "+91 9876543210 (Administration)",
      url: "tel:+911234567890",
      bgColor: "bg-emerald-50",
      iconColor: "text-emerald-600"
    },
    {
      icon: FaEnvelope,
      text: "admissions@sgscollege.edu",
      url: "mailto:admissions@sgscollege.edu",
      bgColor: "bg-red-50",
      iconColor: "text-red-600"
    },
    {
      icon: FaEnvelope,
      text: "support@sgscollege.edu",
      url: "mailto:support@sgscollege.edu",
      bgColor: "bg-red-50",
      iconColor: "text-red-600"
    },
  ];

  // System features
  const systemFeatures = [
    { icon: FaGraduationCap, text: "Student Management", color: "text-blue-600" },
    { icon: FaChalkboardTeacher, text: "Faculty Portal", color: "text-purple-600" },
    { icon: FaUserGraduate, text: "Attendance Tracking", color: "text-green-600" },
    { icon: FaBookOpen, text: "Academic Records", color: "text-amber-600" },
    { icon: FaShieldAlt, text: "Secure Access", color: "text-red-600" },
    { icon: FaClockRotateLeft, text: "Digital Reports", color: "text-indigo-600" },
  ];

  return (
    <footer className="bg-gradient-to-b from-gray-900 to-gray-950 text-white" role="contentinfo">
      {/* Top Section - Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mb-12">
          
          {/* College Info & Logo */}
          <div className="lg:col-span-2">
            <div className="flex items-start space-x-4 mb-6">
              <div className="bg-gradient-to-r from-blue-600 to-cyan-500 p-3 rounded-xl">
                <AcademicCapIcon className="h-10 w-10 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">{collegeName}</h2>
                <p className="text-blue-300 font-semibold">{systemName}</p>
                <p className="text-gray-400 text-sm mt-2">NAAC 'A' Grade Accredited</p>
              </div>
            </div>
            <p className="text-gray-300 mb-6">
              Transforming education through innovative technology and comprehensive 
              digital solutions. Our Smart College System provides seamless management 
              of academic processes, attendance tracking, and student-faculty collaboration.
            </p>
            
            {/* System Features */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {systemFeatures.map((feature, index) => (
                <div key={index} className="flex items-center space-x-2 bg-white/5 p-3 rounded-lg">
                  <feature.icon className={`h-5 w-5 ${feature.color}`} />
                  <span className="text-sm text-gray-300">{feature.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xl font-bold mb-6 pb-3 border-b border-blue-700/50">
              <BuildingLibraryIcon className="h-6 w-6 inline-block mr-2" />
              Quick Links
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {quickLinks.map((link, index) => (
                <a
                  key={index}
                  href={link.href}
                  className="text-gray-400 hover:text-white hover:bg-white/5 p-2 rounded-lg transition-colors duration-200 text-sm"
                >
                  {link.name}
                </a>
              ))}
            </div>
          </div>

          {/* Contact Information */}
          <div>
            <h3 className="text-xl font-bold mb-6 pb-3 border-b border-blue-700/50">
              <GlobeAltIcon className="h-6 w-6 inline-block mr-2" />
              Contact Information
            </h3>
            <div className="space-y-4">
              {contactInfo.map((item, index) => {
                const Icon = item.icon;
                return (
                  <a 
                    key={index}
                    href={item.url} 
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex items-start p-3 ${item.bgColor} rounded-lg hover:opacity-90 transition-all duration-200 group`}
                  >
                    <Icon className={`mr-3 flex-shrink-0 mt-1 ${item.iconColor}`} />
                    <span className="text-sm text-gray-800 font-medium">{item.text}</span>
                  </a>
                );
              })}
            </div>
          </div>
        </div>

        {/* Social Media & Newsletter */}
        <div className="border-t border-gray-800 pt-8">
          <div className="flex flex-col lg:flex-row justify-between items-center gap-6">
            <div>
              <h3 className="text-lg font-bold mb-4">Stay Connected</h3>
              <div className="flex flex-wrap gap-3">
                {socialLinks.map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <a
                      key={idx}
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`Follow us on ${item.name}`}
                      className={`${item.bgColor} p-3 rounded-full text-gray-800 ${item.color} hover:text-white transition-all duration-300 transform hover:scale-110 hover:shadow-lg`}
                      title={item.name}
                    >
                      <Icon className="text-lg" />
                    </a>
                  );
                })}
              </div>
            </div>

            {/* Mobile App Badges */}
            <div className="text-center lg:text-right">
              <h3 className="text-lg font-bold mb-4">Download Mobile App</h3>
              <div className="flex gap-4 justify-center lg:justify-end">
                <button className="bg-gray-800 hover:bg-gray-700 text-white px-6 py-3 rounded-lg flex items-center space-x-2 transition-colors">
                  <DevicePhoneMobileIcon className="h-5 w-5" />
                  <div className="text-left">
                    <div className="text-xs">GET IT ON</div>
                    <div className="font-bold">Google Play</div>
                  </div>
                </button>
                <button className="bg-gray-800 hover:bg-gray-700 text-white px-6 py-3 rounded-lg flex items-center space-x-2 transition-colors">
                  <DevicePhoneMobileIcon className="h-5 w-5" />
                  <div className="text-left">
                    <div className="text-xs">Download on the</div>
                    <div className="font-bold">App Store</div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="bg-gradient-to-r from-blue-900 to-blue-950 py-6 border-t border-blue-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            {/* Copyright */}
            <div className="text-center md:text-left">
              <p className="text-gray-400 text-sm">
                © {currentYear} {collegeName}. All rights reserved.
              </p>
              <p className="text-gray-500 text-xs mt-1">
                UGC Recognized | AICTE Approved | NBA Accredited Programs
              </p>
            </div>

            {/* Legal Links */}
            <div className="flex flex-wrap justify-center gap-6">
              <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">
                Terms of Service
              </a>
              <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">
                Accessibility
              </a>
              <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">
                Sitemap
              </a>
              <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">
                Contact Webmaster
              </a>
            </div>

            {/* Visitor Counter */}
            <div className="text-center md:text-right">
              <div className="text-xs text-gray-500">
                <span className="text-blue-300 font-mono">1000+</span> Active Users
              </div>
              <div className="text-xs text-gray-500">
                Last Updated: {new Date().toLocaleDateString('en-IN')}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Development Credit */}
      <div className="bg-gray-950 py-3 text-center border-t border-gray-900">
        <p className="text-xs text-gray-600">
          Developed by <a href="https://softgamestudios.web.app" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">
            Soft Game Studio
          </a> • Powered by Firebase Cloud Services
        </p>
      </div>
    </footer>
  );
};

export default Footer;