// app.js
import express from "express";
import session from "express-session";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import chatRoutes from "./routes/chat.js";
import authRoutes from "./routes/auth.js";

// Configure dotenv
dotenv.config();

// Create Express app
const app = express();

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
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
app.listen(PORT, async () => {
    try {
        await mongoose.connect(process.env.MONGO_ATLAS_URI);
        console.log("DB connected successfully");
        console.log(`Server running at http://localhost:${PORT}`);
    } catch (error) {
        console.log(error);
    }
});

export default app;
