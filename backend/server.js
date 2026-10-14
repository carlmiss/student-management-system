const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(express.json());

const allowedOrigins = (process.env.FRONTEND_URL || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error("Origin not allowed by CORS"));
  }
}));

const studentSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true, lowercase: true },
  course: { type: String, required: true, trim: true },
  year: { type: Number, required: true, min: 1, max: 8 }
}, { timestamps: true });

const Student = mongoose.model("Student", studentSchema);

app.get("/", (req, res) => {
  res.json({ message: "Student Management API is running", endpoints: "/api/students" });
});

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", database: mongoose.connection.readyState === 1 ? "connected" : "disconnected" });
});

app.get("/api/students", async (req, res) => {
  try {
    const search = (req.query.search || "").trim();
    const filter = search
      ? { $or: [
          { name: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
          { course: { $regex: search, $options: "i" } }
        ] }
      : {};
    const students = await Student.find(filter).sort({ createdAt: -1 });
    res.json(students);
  } catch (error) {
    res.status(500).json({ error: "Could not fetch students" });
  }
});

app.post("/api/students", async (req, res) => {
  try {
    const student = await Student.create({
      name: req.body.name,
      email: req.body.email,
      course: req.body.course,
      year: Number(req.body.year)
    });
    res.status(201).json(student);
  } catch (error) {
    res.status(400).json({ error: error.message || "Invalid student data" });
  }
});

app.put("/api/students/:id", async (req, res) => {
  try {
    const student = await Student.findByIdAndUpdate(
      req.params.id,
      {
        name: req.body.name,
        email: req.body.email,
        course: req.body.course,
        year: Number(req.body.year)
      },
      { new: true, runValidators: true }
    );
    if (!student) return res.status(404).json({ error: "Student not found" });
    res.json(student);
  } catch (error) {
    res.status(400).json({ error: error.message || "Could not update student" });
  }
});

app.delete("/api/students/:id", async (req, res) => {
  try {
    const student = await Student.findByIdAndDelete(req.params.id);
    if (!student) return res.status(404).json({ error: "Student not found" });
    res.json({ message: "Student deleted" });
  } catch (error) {
    res.status(400).json({ error: "Invalid student ID" });
  }
});

const port = process.env.PORT || 3000;

async function start() {
  if (!process.env.MONGODB_URI) {
    console.error("Missing MONGODB_URI environment variable.");
    process.exit(1);
  }
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB Atlas");
    app.listen(port, "0.0.0.0", () => console.log(`API listening on port ${port}`));
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  }
}

start();
