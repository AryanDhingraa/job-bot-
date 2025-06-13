# 🎓 TeachTeam — Course Management App

A full-stack web app that helps manage **courses**, **users**, and **applications** in a school or university. It supports three types of users:  
👤 Candidates → Apply for courses  
🎓 Lecturers → View & manage courses  
🧑‍💼 Admins → Create courses & manage users

Built using **React, Next.js, TypeScript, Express, PostgreSQL, and GraphQL**, this project runs from one codebase using a **monorepo** powered by `npm workspaces`.

---

## 🛠️ What’s Inside?

### 🔗 Tech Stack
- **Frontend (User & Admin):** Next.js + Tailwind CSS
- **Backend:** Node.js + Express + GraphQL + PostgreSQL
- **Auth:** JWT
- **Database:** PostgreSQL
- **Monorepo:** npm workspaces

---

## 🗂️ Project Structure

```
/
├── frontend/           → Main website (candidates + lecturers)
├── admin-frontend/     → Admin dashboard
├── backend/            → API server
├── components/         → Shared UI components
└── package.json        → Root file for managing all apps
```

> This setup lets everything share dependencies and makes dev life easier.

---

## ⚙️ Getting Started

### ✅ What You Need

- Node.js v18.18 or higher
- npm v7 or higher
- PostgreSQL installed and running

---

### 1️⃣ Set Up the Database

1. Open your MySQL Cloud "https://getmysql.com".
2. Create a new database called `teachteam_db` (or any name).
3. Save your database **host**, **port**, **username**, and **password** — you’ll need these soon.

---

### 2️⃣ Add Environment Files

You'll need to create `.env` files for the backend and both frontends.

#### 🔐 `backend/.env`
```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=your_db_username
DB_PASSWORD=your_db_password
DB_NAME=teachteam_db

JWT_SECRET=some_super_secure_key
```

#### 🌐 `frontend/.env.local` and `admin-frontend/.env.local`
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:5001
```

> These tell the frontend where to find the backend API.

---

### 3️⃣ Install Everything

From the root folder:

```bash
npm install
```

This sets up **all workspaces** in one shot.

---

### 4️⃣ Run the App

```bash
npm run dev
```

This starts:

- Backend API → [http://localhost:5001](http://localhost:5001)
- Main Website → [http://localhost:3000](http://localhost:3000)
- Admin Dashboard → [http://localhost:3001](http://localhost:3001)

You’ll see separate logs in your terminal for each one.

---

### 5️⃣ Create Admin Account

To test admin features:

1. Go to [http://localhost:3000/sign-up](http://localhost:3000/sign-up)
2. Sign up with:
   - **Username:** `admin`
   - **Email:** `admin@team.com`
   - **Password:** `password123`
   - **Role:** `Admin`

---

## 💻 How to Access Everything

| Section          | URL                           |
|------------------|-------------------------------|
| Main Website     | http://localhost:3000         |
| Admin Dashboard  | http://localhost:3001         |
| GraphQL API      | http://localhost:5001/graphql |

---

## 📦 GitHub Repo

Here’s the full code on GitHub:  
🔗 https://github.com/rmit-fsd-2025-s1/s4088281-s4088281-a2.git

---

## 🧠 Tools + Credits

- **lovable.dev** → design inspo  
- **RMIT Canvas** → base UI structure  
- **Cursor IDE** → helped clean up some code  
- **ChatGP** → placeholder content & logic support  
- **VS Code Extensions**: Tailwind IntelliSense, ESLint, Prettier

---

> Made with way too many coffees, late nights,some solid vibes and all by myself 😎


Pages are majorly deveoped in app instead of src file for ease of use and better understanding of the project.
## Note: Major code has been pushed at the end, because a wrong file was selected earlier due to system crash.

## Node Modules used for development
Main Dependencies:
react (v19.0.0) - The core React library
react-dom (v19.0.0) - React's DOM and server rendering
next (v15.3.0) - Next.js framework for React applications

Development Dependencies:
typescript (v5.x) - TypeScript for type checking
@types/node (v20.x) - TypeScript type definitions for Node.js
@types/react (v19.x) - TypeScript type definitions for React
@types/react-dom (v19.x) - TypeScript type definitions for React DOM
@tailwindcss/postcss (v4.x) - PostCSS plugin for Tailwind CSS
tailwindcss (v4.x) - Utility-first CSS framework
eslint (v9.x) - JavaScript/TypeScript linter
eslint-config-next (v15.3.0) - ESLint configuration for Next.js
@eslint/eslintrc (v3.x) - ESLint configuration utilities

Styling and CSS:
tailwindcss (v4.x) - Utility-first CSS framework
postcss - CSS transformer
styled-jsx - CSS-in-JS solution
lightningcss - Fast CSS parser/transformer
Type Definitions:
@types/node
@types/react
@types/react-dom

Development Tools:
eslint (v9.x) - JavaScript/TypeScript linter
eslint-config-next - Next.js ESLint configuration
Various ESLint plugins:
eslint-plugin-react
eslint-plugin-jsx-a11y
eslint-plugin-import
eslint-plugin-react-hooks
# s4088281-s4088281-a2
# s4088281-s4088281-a2

