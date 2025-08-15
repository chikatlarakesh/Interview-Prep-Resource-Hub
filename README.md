# Interview Hub - Full-Stack Application

A comprehensive interview preparation platform built with Node.js, Express, MongoDB, React, and TypeScript. Features include user authentication, Google Sign-In, resource management, and admin functionality.

## 🚀 Features

- **User Authentication**: Email/password login and registration with JWT tokens
- **Google Sign-In**: Seamless authentication using Firebase and Google OAuth
- **Resource Management**: Browse, search, and filter interview preparation resources
- **Admin Panel**: Admin users can delete resources and manage content
- **Responsive Design**: Mobile-friendly interface built with Tailwind CSS
- **Protected Routes**: Role-based access control for different user types
- **Production Ready**: Optimized build process and deployment configuration

## 📁 Project Structure

```
backend/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/      # Reusable React components
│   │   ├── contexts/        # React context providers
│   │   ├── pages/          # Page components
│   │   ├── api/            # API integration layer
│   │   └── config/         # Configuration files
│   ├── dist/               # Production build output
│   └── package.json        # Frontend dependencies
├── routes/                  # Express route handlers
├── models/                  # MongoDB/Mongoose models
├── middleware/              # Express middleware
├── scripts/                 # Build and development scripts
├── server.js               # Main server file
├── package.json            # Backend dependencies
├── .env.example            # Environment variables template
└── README.md               # This file
```

## 🛠️ Technology Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication tokens
- **Google Auth Library** - Google authentication
- **bcryptjs** - Password hashing
- **CORS** - Cross-origin resource sharing

### Frontend
- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling framework
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **Firebase** - Google authentication
- **React Hot Toast** - Notifications
- **Lucide React** - Icons

## 📋 Prerequisites

Before running this application, make sure you have the following installed:

- **Node.js** (v16 or higher)
- **npm** or **yarn**
- **MongoDB** (local installation or MongoDB Atlas)
- **Firebase Project** (for Google authentication)

## ⚙️ Installation & Setup

### 1. Clone and Navigate

```bash
# If you have the project files
cd backend
```

### 2. Install Dependencies

```bash
# Install backend dependencies
npm install

# Install frontend dependencies
npm run install:frontend
```

### 3. Environment Configuration

#### Backend Environment (.env)

Create a `.env` file in the root directory:

```env
MONGO_URI=mongodb://localhost:27017/interview_hub
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRES_IN=7d
PORT=5000
NODE_ENV=development
GOOGLE_CLIENT_ID=your_google_client_id_here
```

#### Frontend Environment (frontend/.env)

Create a `.env` file in the frontend directory:

```env
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### 4. Database Setup

#### Option A: Local MongoDB
1. Install MongoDB locally
2. Start MongoDB service
3. The application will create the database automatically

#### Option B: MongoDB Atlas
1. Create a MongoDB Atlas account
2. Create a new cluster
3. Get the connection string
4. Update `MONGO_URI` in your `.env` file

### 5. Firebase Setup (for Google Sign-In)

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or use existing one
3. Enable Authentication and add Google as a sign-in provider
4. Get your Firebase configuration
5. Update the frontend `.env` file with your Firebase credentials
6. Add your Google Client ID to the backend `.env` file

## 🚀 Running the Application

### Development Mode

#### Option 1: Run Both Servers Simultaneously
```bash
npm run dev:both
```

#### Option 2: Run Servers Separately

**Terminal 1 - Backend:**
```bash
npm run dev
```

**Terminal 2 - Frontend:**
```bash
npm run dev:frontend
```

The application will be available at:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000

### Production Mode

#### Build and Start
```bash
# Build frontend for production
npm run build:frontend

# Start production server
npm start
```

The application will be available at: http://localhost:5000

## 📝 Available Scripts

### Backend Scripts
- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm run build` - Run full production build
- `npm run dev:both` - Start both backend and frontend in development
- `npm run dev:frontend` - Start only frontend development server
- `npm run build:frontend` - Build only frontend for production
- `npm run install:frontend` - Install frontend dependencies

### Frontend Scripts (run from frontend/ directory)
- `npm run dev` - Start Vite development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally

## 🔐 Authentication Flow

### Email/Password Authentication
1. User registers with email, name, and password
2. Password is hashed using bcryptjs
3. JWT token is generated and returned
4. Token is stored in localStorage and sent with API requests

### Google Sign-In Authentication
1. User clicks "Continue with Google" button
2. Firebase handles Google OAuth flow
3. Google ID token is sent to backend
4. Backend verifies token with Google
5. User is created/found in database
6. JWT token is generated and returned

### Protected Routes
- Frontend routes are protected using `ProtectedRoute` component
- Backend routes use JWT middleware for authentication
- Admin routes require `isAdmin: true` in user object

## 🛡️ Security Features

- **Password Hashing**: bcryptjs with salt rounds
- **JWT Tokens**: Secure token-based authentication
- **CORS**: Configured for cross-origin requests
- **Input Validation**: Server-side validation for all inputs
- **Protected Routes**: Role-based access control
- **Environment Variables**: Sensitive data stored in .env files

## 🎨 UI/UX Features

- **Responsive Design**: Works on desktop, tablet, and mobile
- **Modern UI**: Clean design with Tailwind CSS
- **Loading States**: Spinners and loading indicators
- **Error Handling**: User-friendly error messages
- **Toast Notifications**: Success and error notifications
- **Form Validation**: Client-side and server-side validation

## 📊 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/google` - Google Sign-In

### User Management
- `GET /api/user/profile` - Get user profile (protected)
- `PUT /api/user/profile` - Update user profile (protected)

### Resources
- `GET /api/resources` - Get all resources
- `DELETE /api/admin/resource/:name` - Delete resource (admin only)

### Admin
- `GET /api/auth/users` - Get all users (admin only)

## 🚀 Deployment

### Heroku Deployment

1. **Prepare for Heroku:**
   ```bash
   # The package.json already includes heroku-postbuild script
   ```

2. **Create Heroku App:**
   ```bash
   heroku create your-app-name
   ```

3. **Set Environment Variables:**
   ```bash
   heroku config:set MONGO_URI=your_mongodb_atlas_uri
   heroku config:set JWT_SECRET=your_jwt_secret
   heroku config:set GOOGLE_CLIENT_ID=your_google_client_id
   heroku config:set NODE_ENV=production
   ```

4. **Deploy:**
   ```bash
   git push heroku main
   ```

### Other Platforms

The application can be deployed to any platform that supports Node.js:
- **Vercel**: Use the provided build scripts
- **Netlify**: Deploy frontend separately, backend as serverless functions
- **DigitalOcean**: Use App Platform or Droplets
- **AWS**: Use Elastic Beanstalk or EC2

## 🔧 Configuration

### CORS Configuration
The backend is configured to accept requests from any origin. For production, update the CORS configuration in `server.js`:

```javascript
app.use(cors({
  origin: ['https://yourdomain.com'],
  credentials: true
}));
```

### Database Configuration
Update MongoDB connection options in `server.js` if needed:

```javascript
mongoose.connect(process.env.MONGO_URI, {
  // Add any additional options here
});
```

## 🐛 Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Ensure MongoDB is running locally or Atlas connection string is correct
   - Check network connectivity and firewall settings

2. **Google Sign-In Not Working**
   - Verify Firebase configuration
   - Check Google Client ID in backend environment
   - Ensure domain is added to Firebase authorized domains

3. **Build Errors**
   - Clear node_modules and reinstall dependencies
   - Check Node.js version compatibility
   - Verify all environment variables are set

4. **CORS Errors**
   - Check CORS configuration in server.js
   - Verify frontend is making requests to correct backend URL

### Debug Mode

Enable debug logging by setting:
```env
NODE_ENV=development
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the ISC License.

## 🙏 Acknowledgments

- React team for the amazing framework
- Express.js for the robust backend framework
- MongoDB for the flexible database
- Firebase for authentication services
- Tailwind CSS for the utility-first CSS framework

---

For more information or support, please open an issue in the repository.

