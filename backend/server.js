const express = require("express");
const multer = require("multer");
const cors = require("cors");
const mongoose = require("mongoose");
const path = require("path");
const fs = require("fs");
const dotenv = require("dotenv");
const morgan = require("morgan");

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/hackathon")
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.log("❌ MongoDB Connection Failed:", err));

// Multer setup
const upload = multer({ dest: "uploads/videos/" });

// Static file serving for videos
app.use("/uploads/videos", express.static(path.join(__dirname, "uploads/videos"), {
  setHeaders: (res) => {
    res.setHeader("Content-Type", "video/mp4");
    res.setHeader("Accept-Ranges", "bytes");
  }
}));

// Root route for Render test
app.get("/", (req, res) => {
  res.send("✅ VoiceA Backend is Live!");
});

// Video streaming route
app.get("/api/videos/:filename", (req, res) => {
  const filePath = path.join(__dirname, "uploads/videos", req.params.filename);
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: "❌ Video not found" });
  }
  res.setHeader("Content-Type", "video/mp4");
  fs.createReadStream(filePath).pipe(res);
});

// Routes
const authRoutes = require("./routes/authRoutes");
const videoRoutes = require("./routes/videoRoutes");
const questionRoutes = require("./routes/questionRoutes");
const answerRoutes = require("./routes/answerRoutes");
const quizRoutes = require("./routes/quizRoutes");
const scoreRoutes = require("./routes/scoreRoutes");

app.use("/api/auth", authRoutes);
app.use("/api/videos", videoRoutes);
app.use("/api/questions", questionRoutes);
app.use("/api/answers", answerRoutes);
app.use("/api/quiz", quizRoutes);
app.use("/api/score", scoreRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.status(200).json({ message: "✅ Server is running smoothly" });
});

// 404 Handler
app.use((req, res) => {
  console.warn(`❌ Route Not Found: ${req.originalUrl}`);
  res.status(404).json({ message: `❌ Route Not Found: ${req.originalUrl}` });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
