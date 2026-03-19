# Rizzing - Frontend

A sleek, modern, mobile-first web app that serves as an AI dating wingman. Designed with dark-mode glassmorphism aesthetics from a dedicated Figma spec, and powered by React, Vite, and Tailwind CSS.

## Features
- **Mobile-First App Layout**: Responsive UI that looks and behaves like a native app.
- **Multiple Image Upload**: Users can attach up to 4 screenshots of dating profiles into the main drag-and-drop zone using `FormData` uploads.
- **Context-Aware Chat**: View simulated chat timelines and tap previous messages to instantly trigger targeted AI replies.
- **AI Profile Settings**: An integrated settings form where the user can ask Groq to instantly optimize and rewrite their bio.

## Tech Stack
- Frontend: React + Vite
- Styling: Tailwind CSS & Framer Motion
- Authentication: Firebase (Google Auth)
- Icons: Lucide React

## Local Setup
1. Clone the repository
2. Run `npm install`
3. Copy `.env.example` to `.env` and fill in your Firebase configuration keys and backend API url.
4. Start dev server: `npm run dev`