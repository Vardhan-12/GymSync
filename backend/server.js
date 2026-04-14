const express = require("express");
const dotenv = require("dotenv");
const helmet = require("helmet");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const hpp = require("hpp");
const rateLimit = require("express-rate-limit");
const http = require("http");
const { Server } = require("socket.io");

// ================== CONFIG ==================
dotenv.config();

// ================== DB ==================
const connectDB = require("./config/db");
connectDB();

// ================== APP ==================
const app = express();

// ================== SECURITY ==================
app.use(
  helmet({
    crossOriginResourcePolicy: false,
  })
);

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json({ limit: "10kb" }));
app.use(cookieParser());
app.use(morgan("dev"));
app.use(hpp());

// ================== RATE LIMIT (optional) ==================
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  message: "Too many requests",
});
// app.use("/api", limiter);

// ================== ROUTES ==================
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/sessions", require("./routes/sessionRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api/workouts", require("./routes/workoutRoutes"));
app.use("/api/match", require("./routes/matchRoutes"));
app.use("/api/chat", require("./routes/chatRoutes"));

// ================== HEALTH ==================
app.get("/", (req, res) => {
  res.send("GymSync API running");
});

// ================== ERROR HANDLER ==================
const errorHandler = require("./middleware/errorHandler");
app.use(errorHandler);

// ================== SOCKET SETUP ==================

// 1. create HTTP server
const server = http.createServer(app);

// 2. attach socket.io
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

// 3. store online users (userId + socketId)
let onlineUsers = [];

// 4. socket logic
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // ===== USER ONLINE =====
  socket.on("userOnline", (userId) => {
    const exists = onlineUsers.find((u) => u.userId === userId);

    if (!exists) {
      onlineUsers.push({ userId, socketId: socket.id });
    }

    io.emit("onlineUsers", onlineUsers);
  });

  // ===== JOIN CHAT ROOM =====
  socket.on("joinRoom", (matchId) => {
    socket.join(matchId);
  });

  // ===== SEND MESSAGE =====
  socket.on("sendMessage", (data) => {
    io.to(data.matchId).emit("receiveMessage", data);
  });

  // ===== TYPING =====
  socket.on("typing", (matchId) => {
    socket.to(matchId).emit("typing");
  });

  socket.on("stopTyping", (matchId) => {
    socket.to(matchId).emit("stopTyping");
  });

  // ===== DISCONNECT =====
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);

    // remove user by socketId
    onlineUsers = onlineUsers.filter(
      (u) => u.socketId !== socket.id
    );

    io.emit("onlineUsers", onlineUsers);
  });
});

// ================== START SERVER ==================
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;