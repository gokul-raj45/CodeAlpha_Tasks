# 🔐 Authentication & Animations - TechCart

## ✅ Features Added

### 1. **Admin Login System** 🔑
- ✅ User authentication with username and password
- ✅ Session-based authentication
- ✅ Admin role protection
- ✅ User registration
- ✅ Default admin user created automatically

### 2. **User Management** 👥
- ✅ User entity with roles (ADMIN/USER)
- ✅ User repository and service
- ✅ Admin dashboard to manage users
- ✅ User list view
- ✅ Delete users functionality

### 3. **Animated Web Pages** ✨
- ✅ Login page with floating background animations
- ✅ Register page with smooth transitions
- ✅ Home page with product card animations
- ✅ Cart icon pulse animation
- ✅ Button hover effects with ripple
- ✅ Fade-in and slide animations
- ✅ Admin dashboard with animated stats

---

## 🔐 Default Login Credentials

### Admin Account
- **Username:** `admin`
- **Password:** `admin123`
- **Role:** ADMIN

### Regular User Account
- **Username:** `user`
- **Password:** `user123`
- **Role:** USER

> These accounts are automatically created when the application starts.

---

## 📁 New Files Created

### Backend
```
src/main/java/com/techcart/
├── model/
│   └── User.java                    (NEW - User entity)
├── repository/
│   └── UserRepository.java          (NEW - User data access)
├── service/
│   └── UserService.java             (NEW - User business logic)
├── controller/
│   └── AuthController.java          (NEW - Login/Register/Logout)
├── config/
│   └── DataInitializer.java         (NEW - Creates default users)
└── controller/
    └── AdminController.java         (UPDATED - Added auth protection)
```

### Frontend
```
src/main/resources/templates/
├── login.html                       (NEW - Login page with animations)
├── register.html                    (NEW - Registration page)
├── admin/
│   ├── dashboard.html              (NEW - Admin dashboard)
│   └── users.html                   (NEW - User management)
└── index.html                       (UPDATED - Added animations)
```

---

## 🎨 Animation Features

### **Login/Register Pages**
- ✨ Floating background particles
- ✨ Slide-in container animation
- ✨ Shine effect on container
- ✨ Bouncing logo
- ✨ Fade-in form fields with staggered delays
- ✨ Ripple effect on button hover
- ✨ Shake animation for error messages

### **Home Page**
- ✨ Slide-down navbar animation
- ✨ Fade-in search section
- ✨ Product cards fade-in with scale effect
- ✨ Staggered card animations
- ✨ Pulse animation on cart icon
- ✨ Ripple effect on "Add to Cart" buttons
- ✨ Smooth hover transitions

### **Admin Dashboard**
- ✨ Fade-in header
- ✨ Slide-up stat cards
- ✨ Pulse animation on icons
- ✨ Fade-in action cards with delays
- ✨ Hover scale effects

### **User Management Page**
- ✨ Fade-in table rows
- ✨ Smooth hover effects
- ✨ Slide-in animations

---

## 🔒 Authentication Flow

### **1. Login Process**
```
User visits /login
  ↓
Enters username and password
  ↓
AuthController.authenticate()
  ↓
UserService.authenticate()
  ↓
Session created with user data
  ↓
Redirect to /admin/dashboard (if admin) or / (if user)
```

### **2. Admin Protection**
```
User tries to access /admin/*
  ↓
AdminController checks session
  ↓
If not admin → Redirect to /login
  ↓
If admin → Show admin page
```

### **3. Registration**
```
User visits /register
  ↓
Fills registration form
  ↓
AuthController.register()
  ↓
UserService.createUser()
  ↓
User saved to database
  ↓
Redirect to /login
```

---

## 🎯 API Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/login` | Show login page | No |
| POST | `/login` | Process login | No |
| GET | `/register` | Show register page | No |
| POST | `/register` | Process registration | No |
| GET | `/logout` | Logout user | No |
| GET | `/admin/dashboard` | Admin dashboard | Yes (Admin) |
| GET | `/admin/users` | Manage users | Yes (Admin) |
| GET | `/admin/add-product` | Add product form | Yes (Admin) |
| GET | `/admin/users/delete/{id}` | Delete user | Yes (Admin) |

---

## 🎨 CSS Animation Types Used

### **1. Keyframe Animations**
- `@keyframes slideDown` - Navbar slide from top
- `@keyframes fadeInUp` - Elements fade in from bottom
- `@keyframes fadeInScale` - Elements fade in with scale
- `@keyframes float` - Floating background particles
- `@keyframes pulse` - Pulsing icons
- `@keyframes bounce` - Bouncing logo
- `@keyframes shake` - Error message shake
- `@keyframes shine` - Container shine effect

### **2. Transitions**
- `transition: all 0.3s` - Smooth property changes
- `transition: transform 0.2s` - Transform animations
- `transition: background 0.3s` - Background color changes

### **3. Hover Effects**
- Scale transformations
- Shadow changes
- Color transitions
- Ripple effects (using ::before pseudo-element)

---

## 🚀 How to Use

### **1. Login as Admin**
1. Visit: `http://localhost:8080/login`
2. Enter:
   - Username: `admin`
   - Password: `admin123`
3. Click "Login"
4. You'll be redirected to Admin Dashboard

### **2. Register New User**
1. Visit: `http://localhost:8080/register`
2. Fill in:
   - Username
   - Email
   - Password
   - Account Type (USER or ADMIN)
3. Click "Register"
4. Login with new credentials

### **3. Access Admin Features**
- After login as admin, you can:
  - View dashboard: `/admin/dashboard`
  - Add products: `/admin/add-product`
  - Manage users: `/admin/users`
  - Delete products/users

### **4. View Animations**
- All pages have smooth animations
- Hover over buttons to see effects
- Watch product cards fade in
- See cart icon pulse animation

---

## 📊 Database Schema

### Users Table
```sql
CREATE TABLE users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,
    email VARCHAR(255) NOT NULL
);
```

---

## ✅ Security Features

- ✅ Session-based authentication
- ✅ Password protection (stored in database)
- ✅ Role-based access control (ADMIN/USER)
- ✅ Admin routes protected
- ✅ Session invalidation on logout
- ✅ Automatic redirect to login if unauthorized

---

## 🎨 Animation Examples

### **Login Page**
- Background particles float upward
- Container slides in from top
- Logo bounces on load
- Form fields fade in sequentially
- Buttons have ripple effect on hover

### **Home Page**
- Navbar slides down smoothly
- Search section fades in
- Product cards appear with scale effect
- Cart icon pulses continuously
- Buttons have hover animations

### **Admin Dashboard**
- Stats cards slide up with delays
- Icons pulse continuously
- Action cards fade in sequentially
- Hover effects on all interactive elements

---

## 🔧 Configuration

### **Default Users Created**
The `DataInitializer` class automatically creates:
1. Admin user (username: admin, password: admin123)
2. Regular user (username: user, password: user123)

These are created on application startup if they don't exist.

---

## 📝 Summary

✅ **Complete Authentication System**
- Login/Register pages
- Session management
- Role-based access control
- User management

✅ **Beautiful Animations**
- Smooth page transitions
- Interactive hover effects
- Staggered element animations
- Professional UI/UX

✅ **Admin Features**
- Protected admin routes
- User management
- Dashboard with stats
- Product management

**TechCart now has a complete authentication system with beautiful animations!** 🎉
