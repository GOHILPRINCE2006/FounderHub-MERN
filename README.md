# FounderHub

**Where Student Startups Find Their Team.**

A full-stack MERN platform where student founders build startup teams, manage work, and connect with mentors and investors. It has five user roles, real-time chat, role-based access control, admin moderation, and Razorpay payments (test mode).

## 🌐 Live Demo

- **Frontend:** https://founder-hub-mern.vercel.app

## ✨ Features

**Founder**
- Create and manage **multiple startups** from one account, each with its own workspace (`/founder/:startupId/*`) and a workspace switcher in the top bar
- Post open roles, review applications, accept or reject applicants (accepted applicants join the team)
- Kanban task board with assignment (To-Do, In Progress, Done)
- Real-time team chat
- Browse verified mentors, send a request with a challenge and goals, and pay after the mentor accepts
- Browse verified investors, send an investment request with a pitch, proposed amount and equity
- Per-startup progress dashboard: task completion, team contribution, recruitment stats, funding ledger

**Developer**
- Browse and search startups, apply to roles, track application status
- View assigned tasks and update their progress
- Chat with the team of any startup they belong to

**Mentor**
- Profile with role, company, expertise, experience and session price
- Visible in the marketplace only after **admin verification**
- Accept or decline requests, then mark paid sessions as completed

**Investor**
- Profile with company, investment focus and ticket size, visible after **admin verification**
- Accept or decline investment requests, pay through Razorpay, mark deals as completed

**Admin**
- Platform statistics dashboard
- Block, unblock and delete users
- Hide, unhide and delete startups
- Approve or revoke mentor and investor verification

## 🛠️ Tech Stack

**Frontend**
- React 19 with Vite
- Redux Toolkit and React Redux
- React Router 7
- Tailwind CSS 4
- Axios and React Hook Form
- Socket.IO Client

**Backend**
- Node.js (20.19+) and Express 5
- MongoDB Atlas with Mongoose 9
- JWT in HTTP-only cookies, bcrypt password hashing
- Socket.IO
- Multer and Cloudinary (image uploads)
- Razorpay SDK (payments)

## 🧠 Engineering Highlights

- **Multi-startup workspaces.** A founder can own many startups. Every startup's data (tasks, posts, applications, chat, requests) is stored against a `startup` id, and the backend checks ownership or team membership on each request. The URL alone grants no access.
- **Secure authentication.** The JWT lives in an HTTP-only cookie (`Secure` and `SameSite=None` in production), so JavaScript cannot read it. A `protect` middleware loads the user on every request and rejects deactivated accounts. An `authorizeRoles` middleware enforces roles.
- **Real-time with Socket.IO.** Sockets are authenticated with the same cookie. Users join a per-startup chat room (founder or team member only) and a personal room for notifications. The server emits `newMessage`, `newNotification` and `dataUpdated`. On `dataUpdated` the frontend refetches the lists for the user's role, so a mentor accepting a request updates the founder's screen without a reload.
- **Payment verification on the server.** The backend creates the Razorpay order, stores a `Payment` record, and after checkout recomputes the HMAC-SHA256 signature with a constant-time comparison before marking it paid. Verification is idempotent, and the secret never reaches the browser.
- **Trust and verification.** Mentors and investors are listed only after an admin approves them. Mentor approval requires a complete profile.
- **Privacy by design.** Private startup details (problem, solution, traction) are returned only to the founder, team, admins, and mentors or investors who have an active relationship with that startup. Mentor and founder contact details unlock only after payment or acceptance.
- **Data integrity.** A unique index allows one application per user per role. Deleting a startup cascades to its posts, applications, tasks, chat and requests, while payment records are kept as a ledger.
- **Safe profile updates.** Profile editing uses a field allow-list, so users cannot change their own role or verification status.

## 🚀 Local Development Setup

**Prerequisites:** Node.js 20.19+, a MongoDB Atlas database, a Cloudinary account, and Razorpay test keys.

**1. Clone the repository**

```bash
git clone https://github.com/GOHILPRINCE2006/FounderHub-MERN.git
cd FounderHub-MERN
```

**2. Start the backend**

```bash
cd backend
npm install
cp .env.example .env     # fill in your values
npm run dev              # http://localhost:5000
```

**3. Start the frontend** (in a new terminal)

```bash
cd frontend
npm install
npm run dev              # http://localhost:5173
```

The Vite dev server proxies `/api` and `/socket.io` to the backend, so no extra CORS setup is needed locally.

**4. Create an admin account** (from `backend/`)

```bash
ADMIN_EMAIL=you@example.com ADMIN_PASSWORD=YourStrongPass ADMIN_NAME="Admin" npm run seed:admin
```

Admins cannot register through the UI. Mentors and investors appear in the marketplaces only after the admin approves them.

## 🔑 Environment Variables

Set these in `backend/.env`. Never commit this file.

| Variable | Purpose |
|---|---|
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET`, `JWT_EXPIRES_IN` | Token signing secret and lifetime (for example `7d`) |
| `CLIENT_URL` | Allowed frontend origin(s), comma-separated, no trailing slash |
| `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` | Image uploads |
| `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET` | Payments (use test keys) |
| `PORT`, `NODE_ENV` | Optional. Default port is 5000. Use `production` when deployed. |

## 📡 API Overview

Base path: `/api/v1`

| Module | Examples |
|---|---|
| Auth | `POST /auth/register`, `POST /auth/login`, `POST /auth/logout`, `GET /auth/me` |
| Startups | `GET /startups`, `GET /startups/my-startups`, `POST /startups`, `PUT /startups/:id` |
| Recruitment and applications | `/recruitments`, `/applications` |
| Tasks and chat | `/tasks`, `/messages/startup/:startupId` |
| Mentors | `/mentors`, `/mentors/request`, `/mentors/queue` |
| Investors | `/investors`, `/investors/request`, `/investors/received` |
| Payments | `/payments/mentor/*`, `/payments/investment/*` (create-order, verify) |
| Notifications and progress | `/notifications`, `/progress/startup/:startupId` |
| Admin | `/admin/users`, `/admin/startups`, `/admin/verifications`, `/admin/stats` |

## ☁️ Deployment

- **Frontend:** Vercel
- **Backend:** separate Node web service
- **Database:** MongoDB Atlas
- **Images:** Cloudinary
- **Payments:** Razorpay (test mode)

For production, set `NODE_ENV=production` and `CLIENT_URL` to the frontend URL on the backend, and set `VITE_API_URL` to the backend URL when building the frontend. The backend can also serve the built frontend itself if `frontend/dist` exists.

## 🤝 Contributing

Issues and pull requests are welcome. Please keep changes focused and never commit secrets.
