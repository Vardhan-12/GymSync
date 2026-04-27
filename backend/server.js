// ================== IMPORTS ==================
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

// ================== SECURITY MIDDLEWARE ==================
app.use(
  helmet({
    crossOriginResourcePolicy: false, // allow frontend assets
  })
);

app.use(
  cors({
    origin: "http://localhost:5173", // frontend URL
    credentials: true,
  })
);

app.use(express.json({ limit: "10kb" })); // body parser
app.use(cookieParser());
app.use(morgan("dev")); // logs
app.use(hpp()); // prevent HTTP param pollution

// ================== RATE LIMIT (OPTIONAL) ==================
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

// ================== HEALTH CHECK ==================
app.get("/", (req, res) => {
  res.send("GymSync API running");
});

// ================== ERROR HANDLER ==================
const errorHandler = require("./middleware/errorHandler");
app.use(errorHandler);

// ================== CREATE HTTP SERVER ==================
const server = http.createServer(app);

// ================== SOCKET.IO SETUP ==================
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

// ================== ONLINE USERS STORE ==================
// Use Set to avoid duplicates
let onlineUsers = new Set();

// ================== SOCKET LOGIC ==================
io.on("connection", (socket) => {

  // join room
  socket.on("joinRoom", (matchId) => {
    socket.join(matchId);
  });

  // send message
  socket.on("sendMessage", (msg) => {
    socket.to(msg.matchId).emit("receiveMessage", msg);
  });

  // typing
  socket.on("typing", (matchId) => {
    socket.to(matchId).emit("typing");
  });

  socket.on("stopTyping", (matchId) => {
    socket.to(matchId).emit("stopTyping");
  });

  // 🔥 mark as read
  socket.on("markAsRead", (matchId) => {
    socket.to(matchId).emit("messagesRead");
  });

});

// ================== START SERVER ==================
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// ================== EXPORT ==================
module.exports = app;