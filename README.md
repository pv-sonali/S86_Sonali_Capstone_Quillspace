# Quillspace - Full-Stack Blogging Platform

Quillspace is a complete, modern, and production-ready blogging platform built with **React, Node.js, and MongoDB**. It features a custom dark theme inspired by Medium, token-based authentication, post management with SEO-friendly slugs, image upload capabilities, commenting, liking, rate-limiting, and robust security practices.

![Status](https://img.shields.io/badge/Status-Complete-brightgreen)
![Node](https://img.shields.io/badge/Node.js-16+-green)
![React](https://img.shields.io/badge/React-19-blue)
![MongoDB](https://img.shields.io/badge/MongoDB-4.4+-green)

---

## Features

### Core Blogging
- **User Authentication** – Registration, login, and secure sessions via JWT tokens (7-day expiry).
- **Post Management** – Create, read, update, and delete posts. Supports draft states.
- **SEO-Friendly Slugs** – Slug-based dynamic URLs (`/post/my-post-title`) for search engine optimization.
- **Full-Text Search** – Query and search posts by text in titles or content.
- **Media Uploads** – Multi-file and single-file image uploads using Multer (5MB file size limit).
- **Pagination** – Paginated home feed displaying 10 posts per page with controls.

### Engagement & Profiles
- **Like System** – Single-click like/unlike system with live count tracking.
- **Comment Threads** – Complete nested commenting system (threaded replies).
- **User Profiles** – Public user profiles displaying basic bio details and the user's publications.

### Security & Performance
- **JWT Token Authentication** – Token verification via backend middleware (`protect`).
- **Password Hashing** – Handled safely using `bcryptjs` with 10 salt rounds.
- **HTTP Headers Security** – Extra protection layers via `helmet` middleware.
- **Rate Limiting** – Limits client requests to a max of 120 per minute per IP to prevent DDoS.
- **Input Validation** – Comprehensive input validation and sanitization using `express-validator`.
- **CORS Protection** – Configured to allow secure requests only from designated origins.

### Design & Aesthetics
- **Sleek Dark Theme** – Custom dark-mode UI styled with Tailwind CSS.
- **Fully Responsive Layout** – Seamless navigation across mobile, tablet, and desktop views.
- **Interactive States** – Polished hover animations, active routes, and stateful transitions.

---

## Tech Stack

| Layer | Technology | Description |
| :--- | :--- | :--- |
| **Frontend** | React 19 + Vite | Rapid frontend development with Hot Module Replacement (HMR) |
| **Styling** | Tailwind CSS | Utility-first, responsive, and dark-theme tailored css classes |
| **Routing** | React Router DOM v6 | Flexible declarative routing for single-page applications |
| **HTTP Client**| Axios | Promised-based HTTP client for API communication |
| **Backend** | Node.js + Express 5 | High-performance server environment and API router |
| **Database** | MongoDB + Mongoose | Schema-based ODM modeling for application data structures |
| **Auth & Crypt**| JWT + bcryptjs | Secure authentication tokens and hashed passwords |
| **Uploads** | Multer | Node.js middleware for handling multipart/form-data upload |
| **Security** | Helmet + Rate-Limit | HTTP security headers and API request throttling |

---

## Project Structure

```
QuillSpace/
├── backend/                  # Node.js + Express API
│   ├── config/              # Configuration files (database connection, etc.)
│   ├── controllers/         # API route controllers (business logic)
│   ├── middleware/          # Security, auth, and validation middleware
│   ├── models/              # MongoDB schemas (User, Post, Comment)
│   ├── routes/              # Express API route declarations
│   ├── services/            # File upload & other services
│   ├── uploads/             # Directory for uploaded media files
│   ├── utils/               # Helper utilities
│   └── server.js            # Express entry point
│
├── client/                  # React + Vite frontend
│   ├── public/              # Static assets (favicons, logos, etc.)
│   ├── src/
│   │   ├── assets/          # Styling assets and images
│   │   ├── components/      # Reusable UI components (Navbar, buttons, etc.)
│   │   ├── context/         # React context providers (AuthContext)
│   │   ├── hooks/           # Custom React hooks (useAuth)
│   │   ├── layouts/         # Layout components (Navbar, Sidebar, etc.)
│   │   ├── pages/           # Application views (Home, Login, Profile, etc.)
│   │   ├── routes/          # Frontend routing configuration
│   │   ├── services/        # API service clients (Axios configs)
│   │   ├── utils/           # Utility helpers
│   │   ├── App.css          # Core CSS overrides
│   │   ├── App.jsx          # Root component & routing layout
│   │   ├── index.css        # Main tailwind imports and styling tokens
│   │   └── main.jsx         # App bootstrapping
│   ├── eslint.config.js     # Linter configuration
│   ├── index.html           # Main entry HTML
│   ├── postcss.config.cjs   # PostCSS settings
│   ├── tailwind.config.cjs  # Tailwind styling configurations
│   └── vite.config.js       # Vite build configurations
│
└── README.md                # Project documentation (this file)
```

---

## Setup & Installation (Local Development)

### Prerequisites
Make sure you have the following installed on your machine:
- **Node.js** (v16.0.0 or higher)
- **MongoDB** (Running locally or an Atlas connection URI)

---

### 1. Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the root of the `backend` folder:
   ```env
   PORT=3000
   NODE_ENV=development
   MONGO_URI=mongodb://localhost:27017/quillspace
   JWT_SECRET=dev-secret-key-change-in-production
   JWT_EXPIRES_IN=7d
   ```
   *(Note: Replace `MONGO_URI` with your MongoDB Atlas connection string if using a cloud database).*
4. Start the server:
   ```bash
   # Run in production / standard mode:
   npm start
   
   # Run in development mode (with nodemon hot-reload):
   npm run dev
   ```
   The backend should now be running at `http://localhost:3000`.

---

### 2. Frontend Setup
1. Open a new terminal and navigate to the client directory:
   ```bash
   cd client
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   The frontend should now be running at `http://localhost:5173`.

---

## Production Deployment & Hosting

When moving Quillspace into production, the backend API and frontend client are designed to be deployed as decoupled, separate services. Follow these configuration guidelines:

### 1. Production Database (MongoDB Atlas)
1. Set up a free or paid cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Whitelist the IP address of your production backend server in Atlas network access rules.
3. Obtain the connection URI (e.g., `mongodb+srv://<user>:<password>@cluster.mongodb.net/quillspace`).

---

### 2. Backend API Deployment (e.g., Render, Railway, Heroku, or VPS)
Deploy the `backend` subdirectory to your hosting platform and configure the following environment variables:

| Variable | Recommended Value | Description |
| :--- | :--- | :--- |
| `NODE_ENV` | `production` | Enables performance optimizations and disables verbose stack logs |
| `PORT` | `3000` (or host-assigned) | The port the backend server listens on |
| `MONGO_URI` | `mongodb+srv://...` | Secure connection URI pointing to your MongoDB Atlas cluster |
| `JWT_SECRET` | *(generate a long random key)* | Strong, secure secret key used to sign and verify session JWTs |
| `JWT_EXPIRES_IN` | `7d` (or shorter) | Duration before JWT session expires |
| `ALLOWED_ORIGINS` | `https://quillspace.yourdomain.com` | Comma-separated list of your frontend production domain(s) |

#### Start Command on Server:
Ensure your deployment platform executes the start script:
```bash
npm start
```

---

### 3. Frontend Client Deployment (e.g., Vercel, Netlify, or Static Hosting)
Deploy the `client` subdirectory as a static application:
1. Configure your build command:
   ```bash
   npm run build
   ```
2. Configure the output directory to be deployed:
   ```
   client/dist
   ```

#### API Routing & Proxy Config
Since the Axios client uses `/api` and `/uploads` routes locally, you must configure a reverse proxy or routing rules on your static host to direct those requests to your deployed backend domain without triggering CORS issues or 404s.

**Vercel Configuration (`vercel.json` in the frontend root):**
```json
{
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "https://your-backend-api.onrender.com/api/:path*"
    },
    {
      "source": "/uploads/:path*",
      "destination": "https://your-backend-api.onrender.com/uploads/:path*"
    },
    {
      "source": "/(.*)",
      "destination": "/"
    }
  ]
}
```

**Netlify Configuration (`_redirects` file in the frontend build output folder):**
```text
/api/*  https://your-backend-api.onrender.com/api/:splat  200
/uploads/*  https://your-backend-api.onrender.com/uploads/:splat  200
/*  /index.html  200
```

---

## API Endpoints

### Authentication
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `POST` | `/api/auth/register` | Register a new user account | No |
| `POST` | `/api/auth/login` | Login and retrieve JWT token | No |
| `GET` | `/api/auth/me` | Fetch active user credentials | **Yes** |

### Posts
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `GET` | `/api/posts` | Fetch paginated feed (10 posts/page) | No |
| `POST` | `/api/posts` | Create a new blog post | **Yes** |
| `GET` | `/api/posts/:id` | Fetch post details by MongoDB ID | No |
| `GET` | `/api/posts/slug/:slug` | Fetch post details by URL slug | No |
| `PUT` | `/api/posts/:id` | Edit an existing post | **Yes** |
| `DELETE` | `/api/posts/:id` | Delete a post | **Yes** |
| `PUT` | `/api/posts/:id/like` | Toggle like/unlike status of post | **Yes** |

### Comments
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `POST` | `/api/comments` | Post a comment or threaded reply | **Yes** |
| `GET` | `/api/comments/:postId` | Fetch all comments for a post | No |
| `PUT` | `/api/comments/:id` | Edit a comment | **Yes** |
| `DELETE` | `/api/comments/:id` | Delete a comment | **Yes** |

### Users & Profiles
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `GET` | `/api/users/:id` | Fetch user profile detail | No |
| `PUT` | `/api/users/:id` | Update profile information | **Yes** |
| `DELETE` | `/api/users/:id` | Permanently delete user account | **Yes** |

### Uploads
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `POST` | `/api/upload` | Upload single image (5MB limit) | **Yes** |
| `POST` | `/api/upload/multiple` | Upload multiple images (up to 5) | **Yes** |

---

## Theme Configuration

The interface inherits a custom dark theme built inside `client/tailwind.config.cjs`:

```javascript
// Color palette mapping:
--bg:       #0f172a (Main slate background)
--surface:  #0b1220 (Cards and overlays background)
--text:     #e6eef8 (Primary text color)
--muted:    #94a3b8 (Muted/secondary text color)
--primary:  #7c3aed (Accent violet color)
```

---

## Troubleshooting

### Backend fails to start:
- Check if local MongoDB is running: `mongod` or run the service via system manager.
- Verify that port `3000` is not in use by other processes.

### Frontend API connection issues:
- Verify that the backend is active at `http://localhost:3000`.
- Ensure proxy settings in `vite.config.js` point to your running backend server.
- Clear browser cache and local storage if token issues persist.

---

## License

This project is licensed under the MIT License. Feel free to use it for personal or educational purposes.
