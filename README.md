# 🌊 LiquidPoll - Fluid Glassmorphism Polling & Survey Platform

A modern, responsive public polling and survey platform with a mesmerizing liquid glassmorphism aesthetic, rich media options (images/videos up to 10MB), single-vote enforcement, QR code sharing, real-time controls, and dramatic animated answer reveals.

Built with **Next.js 14**, **React**, **Tailwind CSS**, **Framer Motion**, and **LibSQL / Turso SQLite ORM**.

---

## ✨ Features

- **Liquid Glassmorphism UI**: Multi-layered frosted glass cards (`backdrop-blur-2xl`), liquid ambient background with floating morphing gradient orbs, and glass buttons.
- **Responsive Across Devices**: Pixel-perfect on mobile phones, tablets, and desktop displays.
- **Rich Media Options (Up to 10MB)**:
  - Add text, high-res images (PNG, JPG, GIF, WebP), or video (MP4, WebM) up to 10MB per option.
  - Interactive preview and client/server size limit enforcement.
- **Trivia / Quiz Answer Reveal**:
  - Mark the correct answer when building polls.
  - Dramatic suspense countdown with drumroll audio, radiant glass shatter, and celebratory confetti burst!
- **Strict 1-Vote-Per-Person Guarantee**:
  - Voter verification ensures tamper-proof voting with instant duplicate-detection (HTTP 409).
- **Creator Host Controls**:
  - **Start Poll**: Open voting to the public.
  - **Pause Poll**: Temporarily freeze voting with friendly, witty notifications.
  - **End Poll**: Lock the poll and finalize results.
  - **Reveal Answer**: Globally trigger the animated reveal for all participants.
- **Configurable Settings**:
  - Toggle email collection from voters.
  - Toggle immediate answer reveal upon voting.
  - Toggle public results graph and percentage breakdown.
  - Toggle public voter ledger (who voted and what they voted).
- **Instant QR Code & Sharing**:
  - Auto-generated dynamic high-resolution QR code for quick scanning.
  - 1-click link copying and QR image download for presentations.
- **Audio Feedback**:
  - Native Web Audio API sound synthesis (tactile clicks, drumrolls, fanfare, buzzer) with mute toggle.
- **LibSQL / Turso Database**:
  - Configured with `libsql://survey-ananthu.aws-ap-south-1.turso.io`.
  - Automatic zero-downtime local SQLite fallback.

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
Create a `.env.local` file:
```env
TURSO_DATABASE_URL=libsql://survey-ananthu.aws-ap-south-1.turso.io
# Optional Turso auth token:
TURSO_AUTH_TOKEN=
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Production Build
```bash
npm run build
npm start
```

---

## 🛠️ Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/) & [Canvas Confetti](https://github.com/catdad/canvas-confetti)
- **Database & ORM**: [LibSQL Client](https://github.com/tursodatabase/libsql-client-ts) & [Drizzle ORM](https://orm.drizzle.team/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **QR Code**: [node-qrcode](https://github.com/soldair/node-qrcode)
