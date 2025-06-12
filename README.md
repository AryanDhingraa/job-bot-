# Course Management System

A full-stack application for managing courses, applications, and user roles in an educational institution.

## Code Structure

```
├── admin-frontend/                # Admin dashboard frontend
│   ├── app/                      # Next.js app directory
│   │   ├── page.tsx             # Main admin dashboard page
│   │   └── layout.tsx           # Admin layout component
│   ├── components/              # Admin-specific components
│   └── types/                   # TypeScript type definitions
│
├── frontend/                     # Main application frontend
│   ├── app/                     # Next.js app directory
│   │   ├── page.tsx            # Home page
│   │   ├── signin/             # Sign in page
│   │   ├── signup/             # Sign up page
│   │   └── layout.tsx          # Main layout component
│   ├── components/             # Reusable components
│   └── types/                  # TypeScript type definitions
│
├── backend/                      # Backend server
│   ├── src/
│   │   ├── entity/             # Database entities
│   │   │   ├── User.ts
│   │   │   ├── Course.ts
│   │   │   ├── Application.ts
│   │   │   └── LecturerCourse.ts
│   │   │
│   │   ├── graphql/            # GraphQL implementation
│   │   │   ├── resolvers/      # GraphQL resolvers
│   │   │   └── schema/         # GraphQL schema
│   │   │
│   │   ├── migration/          # Database migrations
│   │   └── data-source.ts      # Database configuration
│   │
│   └── docs/                   # Documentation
│
└── components/                   # Shared components
    ├── ui/                     # UI components
    └── forms/                  # Form components
```

## Quick Start Guide

### Prerequisites
- Node.js (v18 or higher)
- PostgreSQL (v14 or higher)
- npm package manager

### Running the Application

1. **Start the Backend Server**
   ```bash
   cd backend
   npm install
   npm run dev
   ```
   The backend server will run on http://localhost:4000

2. **Start the Main Frontend**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   The main application will run on http://localhost:3000

3. **Start the Admin Dashboard**
   ```bash
   cd admin-frontend
   npm install
   npm run dev
   ```
   The admin dashboard will run on http://localhost:3001

### Accessing the Application
- Main Application: http://localhost:3000
- Admin Dashboard: http://localhost:3001
- GraphQL Playground: http://localhost:4000/graphql

### Default Admin Credentials
- Email: admin@teachteam.com
- Password: password123

### Features
- User registration and authentication
- Course management (create, read, update, delete)
- Application management
- User management (block/unblock users)
- Application status tracking

### Note
The database schema and tables will be automatically created when you first run the backend server. 

## Link for the project: {https://github.com/rmit-fsd-2025-s1/s4088281-s4088281-a2.git}

## References:

- https://lovable.dev has been used for taking design ideas for the homepage. None of the code has been copied from lovable, was only used for design references.
- https://rmit.instructure.com/courses/141509/modules has been used for reference for developing pages such as sign in.

## Extensions:

- https://www.cursor.com has been used for correcting errors in the file as an visual studio code extension.
- https://chatgpt.com has been used as generative AI extension to develop lorem possum text used on the homepage, not of the code has been referenced from it.
- Tailwind CSS Intellisense has been used for syntax highlighting and error fixing.

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

