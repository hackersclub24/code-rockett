# Product Requirements Document
## Coding Rocket — Instructor-Led Programming Education Platform

**Version:** 1.0
**Author:** Abhishek
**Status:** Draft
**Date:** April 2026

---

## 1. Executive Summary

Coding Rocket is a web-based platform for teaching programming to junior developers through approval-based enrollment, scheduled live classes (via Google Meet / Zoom), assignment tracking, and progress visibility. The v1.0 scope is built for a solo instructor with architecture designed to scale to multiple instructors and a larger student base without structural changes.

---

## 2. Goals & Success Metrics

| Goal | Metric |
|------|--------|
| Streamline student enrollment | Admin approves/rejects a student in under 2 minutes |
| Reliable class scheduling | Students see upcoming classes and join in one click |
| Track student progress | Instructor views attendance + assignment status per student |
| Scale to multiple instructors | Role architecture supports instructor accounts without redesign |

---

## 3. User Roles

| Role | Description |
|------|-------------|
| `admin` | Platform owner (Abhishek). Full access — approves students, manages classes, views all data |
| `instructor` | Future role. Can manage own classes and view own students' progress |
| `student` | Approved junior developer. Can view classes, join sessions, track own progress |

> v1.0 ships with `admin` and `student` only. The `instructor` role is scaffolded in the DB and auth layer but not exposed in the UI until v2.

---

## 4. Core Features — v1.0 Scope

### 4.1 Authentication & Enrollment

**Student sign-up flow:**
1. Student registers with: name, email, password, short intro (why they want to join)
2. Account created with status `pending_approval`
3. Admin sees badge on dashboard + receives Resend email notification
4. Admin approves or rejects from the admin panel
5. Student receives Resend email with decision
6. Approved students can log in and access the platform

**Auth:**
- JWT-based with access token (15 min) + refresh token (7 days)
- Refresh token stored in HttpOnly cookie
- Passwords hashed with bcrypt
- Role stored in JWT payload: `role: "admin" | "instructor" | "student"`

---

### 4.2 Class Scheduling

**Admin capabilities:**
- Create a class: title, description, date/time, duration, meeting link (Meet/Zoom URL), optional max capacity
- Edit or cancel a scheduled class
- View all upcoming and past classes

**Student capabilities:**
- View all upcoming classes
- See class details: title, description, scheduled time, instructor
- One-click "Join Class" button that opens the meeting link
- View past classes they were marked present for

---

### 4.3 Progress Tracking

**Tracked per student:**
- Attendance per class (present / absent / excused)
- Assignment status per task (assigned / reviewed)
- Overall attendance percentage

**Admin dashboard shows:**
- Student roster with attendance % and assignment completion rate
- Per-class attendance marking interface
- Individual student profile: full attendance + assignment history

**Student dashboard shows:**
- Personal attendance record and percentage
- Upcoming classes
- Assignment list and statuses

---

### 4.4 Assignments (Status Tracking Only — v1.0)

> Submission workflow (file upload, GitHub link) is deferred to v2.

**Admin capabilities:**
- Create assignment: title, description, due date, optionally linked to a class
- Assign to all enrolled students or specific students
- Manually update each student's assignment status
- Add review notes per student

**Student capabilities:**
- View all assigned tasks with due dates and descriptions
- See their own status per assignment

---

## 5. Page & Route Map

### Student-facing

| Route | Page |
|-------|------|
| `/` | Landing — platform intro + apply CTA |
| `/register` | Student sign-up form |
| `/login` | Login |
| `/dashboard` | Home: upcoming classes, attendance summary, pending assignments |
| `/classes` | All upcoming classes list |
| `/classes/[id]` | Class detail + Join button |
| `/assignments` | Assignment list with statuses |
| `/profile` | Student profile settings |

### Admin-facing

| Route | Page |
|-------|------|
| `/admin` | Dashboard: stats, pending approvals badge |
| `/admin/students` | Student roster + approval queue |
| `/admin/students/[id]` | Individual student: progress, attendance, assignments |
| `/admin/classes` | Class list + create/edit/cancel |
| `/admin/classes/[id]` | Class detail + attendance marking |
| `/admin/assignments` | Assignment management |

---

## 6. Database Schema (PostgreSQL)

### users
```sql
id            UUID PRIMARY KEY DEFAULT gen_random_uuid()
name          VARCHAR(100) NOT NULL
email         VARCHAR(255) UNIQUE NOT NULL
password_hash TEXT NOT NULL
role          VARCHAR(20) NOT NULL DEFAULT 'student'   -- admin | instructor | student
status        VARCHAR(20) NOT NULL DEFAULT 'pending'   -- pending | approved | rejected
intro         TEXT
created_at    TIMESTAMPTZ DEFAULT now()
updated_at    TIMESTAMPTZ DEFAULT now()
```

### classes
```sql
id             UUID PRIMARY KEY DEFAULT gen_random_uuid()
title          VARCHAR(200) NOT NULL
description    TEXT
scheduled_at   TIMESTAMPTZ NOT NULL
duration_mins  INTEGER NOT NULL DEFAULT 60
meeting_link   TEXT NOT NULL
instructor_id  UUID REFERENCES users(id)
max_capacity   INTEGER
status         VARCHAR(20) DEFAULT 'scheduled'   -- scheduled | cancelled | completed
created_at     TIMESTAMPTZ DEFAULT now()
updated_at     TIMESTAMPTZ DEFAULT now()
```

### enrollments
```sql
id           UUID PRIMARY KEY DEFAULT gen_random_uuid()
student_id   UUID REFERENCES users(id) ON DELETE CASCADE
class_id     UUID REFERENCES classes(id) ON DELETE CASCADE
enrolled_at  TIMESTAMPTZ DEFAULT now()
UNIQUE(student_id, class_id)
```

### attendance
```sql
id          UUID PRIMARY KEY DEFAULT gen_random_uuid()
class_id    UUID REFERENCES classes(id) ON DELETE CASCADE
student_id  UUID REFERENCES users(id) ON DELETE CASCADE
status      VARCHAR(20) NOT NULL DEFAULT 'absent'   -- present | absent | excused
marked_by   UUID REFERENCES users(id)
marked_at   TIMESTAMPTZ DEFAULT now()
UNIQUE(class_id, student_id)
```

### assignments
```sql
id           UUID PRIMARY KEY DEFAULT gen_random_uuid()
title        VARCHAR(200) NOT NULL
description  TEXT
class_id     UUID REFERENCES classes(id)   -- nullable (standalone)
due_date     TIMESTAMPTZ
created_by   UUID REFERENCES users(id)
created_at   TIMESTAMPTZ DEFAULT now()
updated_at   TIMESTAMPTZ DEFAULT now()
```

### student_assignments
```sql
id             UUID PRIMARY KEY DEFAULT gen_random_uuid()
assignment_id  UUID REFERENCES assignments(id) ON DELETE CASCADE
student_id     UUID REFERENCES users(id) ON DELETE CASCADE
status         VARCHAR(20) DEFAULT 'assigned'   -- assigned | reviewed
notes          TEXT
updated_at     TIMESTAMPTZ DEFAULT now()
UNIQUE(assignment_id, student_id)
```

### refresh_tokens
```sql
id          UUID PRIMARY KEY DEFAULT gen_random_uuid()
user_id     UUID REFERENCES users(id) ON DELETE CASCADE
token_hash  TEXT NOT NULL
expires_at  TIMESTAMPTZ NOT NULL
created_at  TIMESTAMPTZ DEFAULT now()
```

---

## 7. Tech Stack

| Layer | Technology | Notes |
|-------|-----------|-------|
| Frontend | Next.js 14 (App Router) | Vercel deployment |
| Styling | Tailwind CSS | |
| Backend | FastAPI (Python 3.11+) | Render deployment |
| Database | PostgreSQL 15 | Render managed DB |
| ORM | SQLAlchemy 2.0 (async) | |
| Migrations | Alembic | |
| Validation | Pydantic v2 | |
| Auth | JWT (python-jose) + bcrypt | |
| Email | Resend Python SDK | |
| HTTP Client | Axios (frontend) | |

---

## 8. Project Folder Structure

### Backend (FastAPI)

```
backend/
├── app/
│   ├── main.py                  # FastAPI app init, middleware, router registration
│   ├── config.py                # Settings loaded from .env via pydantic-settings
│   ├── database.py              # Async SQLAlchemy engine + session factory
│   │
│   ├── models/                  # SQLAlchemy ORM models
│   │   ├── __init__.py
│   │   ├── user.py
│   │   ├── class_.py
│   │   ├── enrollment.py
│   │   ├── attendance.py
│   │   ├── assignment.py
│   │   └── refresh_token.py
│   │
│   ├── schemas/                 # Pydantic request/response schemas
│   │   ├── __init__.py
│   │   ├── user.py
│   │   ├── class_.py
│   │   ├── attendance.py
│   │   └── assignment.py
│   │
│   ├── routers/                 # Route handlers grouped by domain
│   │   ├── __init__.py
│   │   ├── auth.py              # /auth/register, /auth/login, /auth/refresh, /auth/logout
│   │   ├── admin.py             # /admin/students, /admin/approve, etc.
│   │   ├── classes.py           # /classes CRUD + attendance
│   │   ├── assignments.py       # /assignments CRUD + status updates
│   │   └── students.py          # /students/me, /students/dashboard
│   │
│   ├── services/                # Business logic (decoupled from routers)
│   │   ├── __init__.py
│   │   ├── auth_service.py
│   │   ├── email_service.py     # Resend integration
│   │   ├── class_service.py
│   │   └── assignment_service.py
│   │
│   ├── dependencies/            # FastAPI dependency injection
│   │   ├── __init__.py
│   │   ├── auth.py              # get_current_user, require_admin, require_student
│   │   └── db.py                # get_db session dependency
│   │
│   └── utils/
│       ├── __init__.py
│       ├── security.py          # JWT encode/decode, password hash helpers
│       └── pagination.py        # Shared pagination helper
│
├── alembic/
│   ├── env.py
│   ├── script.py.mako
│   └── versions/                # Migration files
│
├── tests/
│   ├── conftest.py
│   ├── test_auth.py
│   ├── test_classes.py
│   └── test_assignments.py
│
├── .env                         # Local secrets (gitignored)
├── .env.example                 # Committed template (no real values)
├── alembic.ini
├── requirements.txt
└── Dockerfile
```

### Frontend (Next.js)

```
frontend/
├── app/
│   ├── layout.tsx               # Root layout
│   ├── page.tsx                 # Landing page
│   ├── login/page.tsx
│   ├── register/page.tsx
│   │
│   ├── dashboard/               # Student-facing (protected)
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── classes/
│   │   │   ├── page.tsx
│   │   │   └── [id]/page.tsx
│   │   ├── assignments/page.tsx
│   │   └── profile/page.tsx
│   │
│   └── admin/                   # Admin-facing (protected, role-gated)
│       ├── layout.tsx
│       ├── page.tsx
│       ├── students/
│       │   ├── page.tsx
│       │   └── [id]/page.tsx
│       ├── classes/
│       │   ├── page.tsx
│       │   └── [id]/page.tsx
│       └── assignments/page.tsx
│
├── components/
│   ├── ui/                      # Reusable primitives (Button, Input, Badge, Modal)
│   ├── layout/                  # Navbar, Sidebar, PageWrapper
│   ├── classes/                 # ClassCard, ClassForm, AttendanceTable
│   ├── students/                # StudentRow, ApprovalCard, ProgressBar
│   └── assignments/             # AssignmentCard, StatusBadge
│
├── lib/
│   ├── api.ts                   # Axios instance with base URL + interceptors
│   ├── auth.ts                  # Token helpers, role checks
│   └── utils.ts                 # Date formatting, string helpers
│
├── hooks/
│   ├── useAuth.ts
│   ├── useClasses.ts
│   └── useAssignments.ts
│
├── types/
│   └── index.ts                 # Shared TypeScript interfaces
│
├── middleware.ts                 # Next.js route protection (JWT check)
├── .env.local                   # Local secrets (gitignored)
├── .env.example                 # Committed template
└── next.config.ts
```

---

## 9. Environment Variables

### Backend — `.env.example`

```env
# ── App ──────────────────────────────────────────
APP_NAME=CodingRocket
APP_ENV=development                  # development | staging | production
DEBUG=true

# ── Database ─────────────────────────────────────
DATABASE_URL=postgresql+asyncpg://user:password@localhost:5432/coding_rocket
# For Render production:
# DATABASE_URL=postgresql+asyncpg://<render-db-url>

# ── Auth ─────────────────────────────────────────
SECRET_KEY=your-super-secret-key-change-this-in-production
ACCESS_TOKEN_EXPIRE_MINUTES=15
REFRESH_TOKEN_EXPIRE_DAYS=7
ALGORITHM=HS256

# ── CORS ─────────────────────────────────────────
ALLOWED_ORIGINS=http://localhost:3000,https://yourdomain.vercel.app

# ── Email (Resend) ────────────────────────────────
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxx
EMAIL_FROM=noreply@yourdomain.com
ADMIN_EMAIL=you@yourdomain.com

# ── Admin Seed (first-run setup) ──────────────────
ADMIN_EMAIL_SEED=admin@yourdomain.com
ADMIN_PASSWORD_SEED=change-this-immediately
```

### Frontend — `.env.example`

```env
# ── API ───────────────────────────────────────────
NEXT_PUBLIC_API_URL=http://localhost:8000
# For production:
# NEXT_PUBLIC_API_URL=https://your-backend.onrender.com

# ── App ───────────────────────────────────────────
NEXT_PUBLIC_APP_NAME=Coding Rocket
NEXT_PUBLIC_APP_ENV=development
```

> **Rules:**
> - Never commit `.env` or `.env.local` — both are in `.gitignore`
> - Always commit `.env.example` with dummy values and a comment per variable
> - `NEXT_PUBLIC_` prefix = exposed to the browser. Anything secret stays without it (server-side only)

---

## 10. API Endpoint Summary

### Auth
```
POST   /auth/register          Student sign-up (returns pending status)
POST   /auth/login             Returns access token + sets refresh cookie
POST   /auth/refresh           Rotate access token using refresh cookie
POST   /auth/logout            Invalidate refresh token
```

### Admin
```
GET    /admin/students                  All students with status filter
PATCH  /admin/students/{id}/approve     Approve student + send email
PATCH  /admin/students/{id}/reject      Reject student + send email
GET    /admin/students/{id}             Student detail + progress
```

### Classes
```
GET    /classes                 List upcoming classes (student view)
GET    /classes/{id}            Class detail
POST   /admin/classes           Create class
PATCH  /admin/classes/{id}      Edit class
DELETE /admin/classes/{id}      Cancel class
POST   /admin/classes/{id}/attendance   Mark attendance (bulk)
```

### Assignments
```
GET    /assignments                         Student's assignments
GET    /admin/assignments                   All assignments
POST   /admin/assignments                   Create assignment
PATCH  /admin/assignments/{id}              Edit assignment
PATCH  /admin/student-assignments/{id}      Update student assignment status
```

---

## 11. Scalability Considerations

| Concern | Decision |
|---------|----------|
| Multiple instructors | `instructor_id` on classes + `role` on users already supports this |
| Many students | Pagination on all list endpoints from day one |
| Async DB | SQLAlchemy async engine — no blocking calls |
| Email reliability | Resend handles retries; fire-and-forget pattern in services |
| Assignment submissions (v2) | `student_assignments` table has `notes` field ready; add `file_url` column in a migration |
| Frontend performance | Next.js server components for data-heavy pages; client components only where interactivity needed |

---

## 12. Out of Scope — v1.0

- Assignment file/GitHub submission (v2)
- In-app chat or discussion threads (v2)
- Payment / billing (not planned)
- Mobile app (web-responsive only)
- Video recording storage
- Multiple instructor UI (DB supports it; UI deferred to v2)

---

## 13. Milestones

| Milestone | Deliverable |
|-----------|-------------|
| M1 — Foundation | DB schema, Alembic migrations, FastAPI project scaffold, auth endpoints |
| M2 — Enrollment | Student register flow, admin approval, Resend emails |
| M3 — Classes | Class CRUD (admin), class list + detail (student), join link |
| M4 — Attendance | Attendance marking (admin), progress view (admin + student) |
| M5 — Assignments | Assignment creation + status tracking |
| M6 — Frontend | Next.js pages wired to all APIs, middleware-based route protection |
| M7 — Deploy | Vercel + Render deployment, env vars configured, smoke test |
