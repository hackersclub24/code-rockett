# Code Rocket 🚀

Production-ready MVP for a scalable learning platform built with Next.js, FastAPI, PostgreSQL, and Firebase.

## Prerequisites
- Node.js 18+
- Python 3.10+
- PostgreSQL database
- Firebase project (Authentication enabled with Google Sign-in)
  - Get a Service Account JSON file for backend verification
  - Get Web config for frontend

## 1. Backend Setup

1. Open a terminal and navigate to the `backend` directory:
   ```bash
   cd d:\Asha_work\code-rockett\backend
   ```
2. Create and activate a Python virtual environment:
   ```bash
   python -m venv venv
   # On Windows:
   .\venv\Scripts\activate
   # On Mac/Linux:
   source venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Set Environment Variables:
   Open `backend/app/core/config.py` and modify the `DATABASE_URL` or create a `.env` file in the `backend/` directory:
   ```env
   DATABASE_URL=postgresql+asyncpg://user:password@localhost:5432/coderocket
   ```
   **Important**: Make sure to place your downloaded Firebase Service Account JSON file as `firebase-adminsdk.json` in the `backend/` folder.

5. Initialize the Database:
   ```bash
   python init_db.py
   ```

6. Start the API server:
   ```bash
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```
   The API will be available at `http://localhost:8000` (Swagger UI at `/api/openapi.json`).

## 2. Frontend Setup

1. Open a second terminal and navigate to the `frontend` directory:
   ```bash
   cd d:\Asha_work\code-rockett\frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set Environment Variables:
   Open `frontend/.env.local` and replace the placeholder Firebase config values with your actual Firebase Web config parameters from the Firebase Console.
   Ensure `NEXT_PUBLIC_API_URL` points to your backend instance (default is `http://localhost:8000/api`).

4. Start the Development Server:
   ```bash
   npm run dev
   ```
5. Open your browser and navigate to `http://localhost:3000`.

## Features
- **Public Course List & Detail**: Unauthenticated users can view and read about courses.
- **Google Authentication**: Using Firebase Auth.
- **Enrollments**: Users securely enroll.
- **User Dashboard**: Enrolled courses and links to live classes.
- **Admin Panel**: Specific admin users can create courses and live `google meet` classes. Ensure you replace `"your-email@gmail.com"` in `backend/app/core/security.py` and front-end `Navbar.tsx` & `admin/page.tsx` with your actual admin email.
