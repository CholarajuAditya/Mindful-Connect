// app.js
import express from "express";
import session from "express-session";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import chatRoutes from "./routes/chat.js";
import authRoutes from "./routes/auth.js";
import developersRoutes from "./routes/developers.js";
import resourcesRoutes from "./routes/resources.js";
import moodRoutes from "./routes/mood.js";
import breathingRoutes from "./routes/breathing.js";
import emergencyRoutes from "./routes/emergency.js";
import communityRoutes from "./routes/community.js";
import therapistRoutes from "./routes/therapist.js";
import aboutRoutes from "./routes/about.js";

// Configure dotenv
dotenv.config();

// Create Express app
const app = express();

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(express.json()); // Add JSON middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use(
    session({
        secret: process.env.SESSION_SECRET, // use a secure value in production
        resave: false,
        saveUninitialized: false,
        cookie: { secure: false }, // set to true only if using HTTPS
    })
);

// View engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Routes
app.use("/", chatRoutes);
app.use("/auth", authRoutes);
app.use("/developers", developersRoutes);
app.use("/resources", resourcesRoutes);
app.use("/mood-tracker", moodRoutes);
app.use("/breathing", breathingRoutes);
app.use("/emergency", emergencyRoutes);
app.use("/community", communityRoutes);
app.use("/therapist", therapistRoutes);
app.use("/about",aboutRoutes);

// Dashboard route
app.get("/dashboard", (req, res) => {
    // Check if user is logged in
    if (!req.session.user) {
        return res.redirect("/auth/login");
    }
    res.render("dashboard");
});

console.log(
    "API Key:",
    process.env.GEMINI_API_KEY?.length ? "exists" : "missing"
);

app.get("/", (req, res) => {
    res.render("index");
});

app.post("/auth/register", (reqcl, res) => {
    res.render("index");
});

import mongoose from "mongoose";

const PORT = process.env.PORT || 8000;

// Database connection
mongoose.connect(process.env.MONGO_ATLAS_URI)
    .then(() => {
        console.log("Connected to MongoDB successfully");
    })
    .catch((error) => {
        console.error("MongoDB connection error:", error);
    });

// Start server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});

export default app;
