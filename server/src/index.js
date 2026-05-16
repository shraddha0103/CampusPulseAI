import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import { createServer } from "http";
import { Server } from "socket.io";

import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import incidentRoutes from "./routes/incidentRoutes.js";

dotenv.config();

const app = express();

const server = createServer(app);

export const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:5173",
      "https://campus-pulse-ai-six.vercel.app"
    ],
    methods: ["GET", "POST"],
  },
});

app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://campus-pulse-ai-six.vercel.app"
  ],
  credentials: true,
}));
app.use(express.json());

app.get("/", (req, res) => {
  res.send("CampusPulse AI Backend Running");
});

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/incidents", incidentRoutes);

// Socket Connection
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});