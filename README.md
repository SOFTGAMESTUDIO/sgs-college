# Student Attendance System

![React](https://img.shields.io/badge/-React-blue?logo=react&logoColor=white)
![Firebase](https://img.shields.io/badge/-Firebase-orange?logo=firebase&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/-TailwindCSS-38B2AC?logo=tailwind-css&logoColor=white)

## 📝 Overview

The Student Attendance System is a comprehensive web-based platform designed to streamline academic management for educational institutions. Built with modern web technologies, it provides role-based access for administrators, teachers, and students to manage attendance, marks, and library resources efficiently.

## ✨ Features

### For Administrators
- **Dashboard Overview**: Real-time statistics of teachers, students, and subjects
- **User Management**: Add, edit, and remove teachers and students
- **Subject Management**: Create and manage subjects with teacher and student assignments
- **Library Administration**: Manage book inventory, track issued books, and monitor fines
- **Comprehensive Reports**: Access system-wide attendance and performance analytics

### For Teachers
- **Personalized Dashboard**: View assigned subjects and quick access to common tasks
- **Attendance Tracking**: Mark student attendance with Present/Absent/Leave status
- **Marks Management**: Record and manage student marks for assessments
- **Attendance Reports**: View detailed attendance summaries for each subject
- **Library Access**: Issue and return books to students

### For Students
- **Subject Overview**: View all enrolled subjects in one place
- **Attendance Monitoring**: Track personal attendance records by subject
- **Marks Viewing**: Access assessment scores and performance charts
- **Library Dashboard**: View borrowed books, due dates, and outstanding fines

### Library Management System
- **Book Catalog**: Comprehensive book management with categories, authors, and availability tracking
- **Issue/Return System**: Streamlined book lending and return process
- **Fine Management**: Automated fine calculation for overdue books
- **Advanced Search**: Filter books by title, author, category, and availability
- **Bulk Upload**: Import multiple books at once via CSV or manual entry

## 🛠️ Tech Stack

- **Frontend**: React 19 with React Router for navigation
- **Styling**: Tailwind CSS 4 for modern, responsive design
- **Backend**: Firebase (Firestore database, Authentication, Storage)
- **Icons**: Lucide React, Hero Icons, React Icons
- **Animations**: Framer Motion for smooth transitions
- **Data Visualization**: Chart.js for attendance and marks charts

## 📦 Dependencies

```json
{
  "@heroicons/react": "^2.2.0",
  "@tailwindcss/vite": "^4.1.12",
  "chart.js": "^4.5.1",
  "firebase": "^12.1.0",
  "framer-motion": "^12.23.12",
  "lucide-react": "^0.542.0",
  "react": "^19.1.1",
  "react-chartjs-2": "^5.3.1",
  "react-dom": "^19.1.1",
  "react-icons": "^5.5.0",
  "react-router-dom": "^7.8.2",
  "react-toastify": "^11.0.5",
  "tailwindcss": "^4.1.12"
}
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn package manager
- Firebase account and project

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/SOFTGAMESTUDIO/Attendenc-System.git
   cd Attendenc-System
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Firebase**
   
   Create a `.env` file in the root directory with your Firebase credentials:
   ```env
   VITE_FIREBASE_API_KEY_SGS=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN_SGS=your_auth_domain
   VITE_FIREBASE_PROJECT_ID_SGS=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET_SGS=your_storage_bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID_SGS=your_messaging_sender_id
   VITE_FIREBASE_APP_ID_SGS=your_app_id
   VITE_FIREBASE_MEASURENT_ID=your_measurement_id
   VITE__ADMIN_EMAIL_SGS=admin@example.com
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Build for production**
   ```bash
   npm run build
   ```

6. **Preview production build**
   ```bash
   npm run preview
   ```

## 📁 Project Structure

```
.
├── src/
│   ├── auth/             # Authentication context and providers
│   ├── components/       # Reusable UI components (Layout, Navbar, Footer)
│   ├── constants/        # Application constants and configuration
│   ├── db/              # Firebase configuration
│   ├── hooks/           # Custom React hooks (useLibrary)
│   ├── models/          # Data models for Firestore operations
│   └── pages/
│       ├── Admin/       # Admin dashboard and management pages
│       ├── Teacher/     # Teacher-specific pages
│       ├── Student/     # Student-specific pages
│       ├── Library/     # Library management components
│       ├── Registration/# Login and authentication pages
│       ├── Home/        # Landing page
│       └── NoPage/      # 404 error page
├── public/              # Static assets
├── .env                 # Environment variables (not in repo)
└── vite.config.js       # Vite configuration
```

## 🔐 Authentication & Authorization

The system implements role-based access control (RBAC):

- **Admin**: Full system access via designated email address
- **Teachers**: Access to teaching-related features (attendance, marks)
- **Students**: Read-only access to personal data

Authentication is handled via Firebase Authentication with email/password.

## 📊 Firestore Collections

- `teachers` - Teacher profiles and credentials
- `students` - Student information
- `subjects` - Subject details with teacher and student assignments
- `subjects/{subjectId}/attendance` - Attendance records per subject
- `books` - Library book catalog
- `issuedBooks` - Currently borrowed books
- `fines` - Library fine records

## 🎨 Features in Detail

### Attendance Management
- Mark attendance with three statuses: Present, Leave, Absent
- View attendance history by date and subject
- Generate attendance reports and analytics

### Marks Management
- Record marks for various assessments
- Visualize student performance with charts
- Track marks history over time

### Library System
- Complete CRUD operations for books
- Track book availability in real-time
- Automatic fine calculation for overdue returns
- Bulk book upload functionality

## 🐛 Troubleshooting

**Issue**: Firebase connection errors  
**Solution**: Verify `.env` file contains correct Firebase credentials

**Issue**: Build fails  
**Solution**: Clear `node_modules` and reinstall: `rm -rf node_modules && npm install`

**Issue**: Pages not loading  
**Solution**: Check browser console for routing errors and verify user authentication

## 👥 Contributing

Contributions are welcome! To contribute:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -am 'Add new feature'`
4. Push to the branch: `git push origin feature/your-feature`
5. Open a Pull Request

Please ensure your code:
- Follows the existing code style
- Includes appropriate JSDoc comments
- Has been tested thoroughly
- Updates documentation as needed

## 📄 License

This project is open source and available for educational purposes.

## 🙏 Acknowledgments

- Built with [React](https://react.dev/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)
- Backend powered by [Firebase](https://firebase.google.com/)

---

**Developed with ❤️ for Educational Institutions**