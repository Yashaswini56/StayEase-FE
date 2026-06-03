# StayEase - Hotel Management System

A modern React-based hotel management system with a beautiful, responsive login page featuring role-based authentication.

## 🎨 Features

- **Beautiful Login Page**: Gradient purple/blue UI with smooth animations
- **Role-based Authentication**: Support for User, Admin, and Manager roles
- **Email & Password Validation**: Client-side form validation with error messages
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **TypeScript Support**: Full type safety for better development experience
- **Navigation Bar**: Header with navigation links for Hotel Management system
- **Modern Stack**: Built with React, Vite, and TypeScript

## 🚀 Quick Start

### Prerequisites
- Node.js 16 or higher
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser and navigate to `http://localhost:5173`

### Build for Production

```bash
npm run build
```

## 📁 Project Structure

```
src/
├── components/
│   ├── LoginPage.tsx        # Login form component with validation
│   ├── Navigation.tsx        # Top navigation bar
├── styles/
│   ├── globals.css           # Global styles and resets
│   ├── Navigation.css        # Navigation styling
│   ├── LoginPage.css         # Login page styling
├── App.tsx                   # Main application component
├── main.tsx                  # Application entry point
├── App.css                   # App-level styles
```

## 🎯 Login Page Features

### Email & Password Validation
- Email format validation
- Password minimum length check (6 characters)
- Real-time error messages
- Visual feedback for invalid inputs

### Role Selection
- User role selection dropdown
- Options: User, Admin, Manager
- Default role: User

### User Experience
- Smooth animations on page load
- Hover effects on buttons and links
- Register link for new users
- Responsive form layout

## 🛠️ Technologies Used

- **React 18**: UI library
- **TypeScript**: Type safety
- **Vite**: Fast build tool
- **CSS3**: Styling with gradients and animations

## 📝 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🎨 Styling

The application uses a modern gradient color scheme:
- **Primary Gradient**: Purple (#667eea) to Violet (#764ba2)
- **Cards**: White with subtle shadows
- **Text**: Dark gray for readability
- **Accents**: Purple for interactive elements

## 📱 Responsive Breakpoints

- **Mobile**: Up to 480px
- **Tablet**: 481px to 768px
- **Desktop**: 769px and above

## 🔐 Form Validation

The login form includes:
- Email validation (proper email format check)
- Password validation (minimum 6 characters)
- Real-time error message display
- Prevents submission with invalid data

## 🚀 Future Enhancements

- Backend integration for authentication
- Hotel listing and booking management
- User profile management
- Reservation system
- Payment processing

## 📄 License

This project is open source and available under the MIT License.

---

Built with ❤️ for seamless hotel management
