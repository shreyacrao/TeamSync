# TeamSync — Real-Time Team Collaboration & Chat Platform

A MERN-stack chat application inspired by Cisco Webex/Slack: public channels, direct messages,
real-time messaging via Socket.io, online/offline presence, and typing indicators.

## Live Demo
https://team-sync-kohl-psi.vercel.app

## GitHub Repository
https://github.com/shreyacrao/TeamSync

## Tech Stack
- **Frontend:** React (Vite), React Router, Socket.io-client, Axios, plain CSS
- **Backend:** Node.js, Express, Socket.io, MongoDB (Mongoose), JWT auth, bcrypt
- **Real-time:** WebSockets via Socket.io for messages, presence, and typing indicators

## Features
- User registration/login with JWT authentication
- Public channels (create/join) + private 1-on-1 direct messages
- Real-time message delivery (Socket.io rooms per channel)
- Online/offline presence indicators
- "User is typing..." indicators
- Message history persisted in MongoDB, loaded on channel switch
- Responsive-ish two-pane chat UI (sidebar + message pane)

## Project Structure
```
TeamSync/
├── backend/
│   ├── config/db.js
│   ├── models/          (User, Channel, Message)
│   ├── controllers/     (auth, channel, message, user)
│   ├── routes/
│   ├── middleware/auth.js
│   ├── socket/socketHandler.js
│   ├── server.js
│   └── .env.example
└── frontend/
    ├── src/
    │   ├── api/axios.js
    │   ├── context/     (AuthContext, SocketContext)
    │   ├── components/  (Sidebar, MessageList, MessageInput, TypingIndicator, Avatar)
    │   ├── pages/        (Login, Register, Chat)
    │   ├── styles/index.css
    │   ├── App.jsx
    │   └── main.jsx
    └── .env.example
```

## Setup

### Prerequisites
- Node.js 18+
- MongoDB running locally, or a free MongoDB Atlas cluster

### 1. Backend
```bash
cd backend
npm install
cp .env.example .env
# edit .env: set MONGO_URI and JWT_SECRET
npm run dev
```
Backend runs on `http://localhost:5000`.

### 2. Frontend
```bash
cd frontend
npm install
cp .env.example .env
# edit .env if your backend runs on a different URL
npm run dev
```
Frontend runs on `http://localhost:5173`.

### 3. Try it out
- Open two browser windows (or one normal + one incognito) at `http://localhost:5173`.
- Register two different users.
- Send messages in the `general` channel or start a DM — watch them appear instantly in
  both windows, along with the typing indicator and presence dot.

## How to talk about this project in an interview

- **Real-time architecture:** Socket.io rooms are used per-channel so messages are only
  broadcast to sockets that have joined that channel's room — this scales better than a
  single global broadcast.
- **Auth:** JWT is verified both on REST routes (Express middleware) and on the Socket.io
  handshake (`io.use()` middleware), so the socket connection itself is authenticated,
  not just the REST calls.
- **Data modeling:** Direct messages are just a `Channel` document with `isDirectMessage: true`
  and exactly two members — this avoids a separate DM schema/collection.
- **Presence:** Tracked via socket `connection`/`disconnect` events, updating a `status`
  field on the `User` document and broadcasting to all connected clients.

## Possible extensions (good "future work" talking points)
- File/image sharing in messages
- Message read receipts (the `readBy` field already exists on the Message model)
- Group video calls (WebRTC) — the natural next step toward an actual Webex-like feature
- Message search and channel search
- Push notifications for offline users
- Docker Compose setup for one-command local deployment
