import express from "express";
import bcrypt from "bcrypt";
import { User } from "../models/user.js";

const router = express.Router();

router.get("/login", (req, res) => {
    res.render("auth/login");
});

router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.render("auth/login", {
                error: "Invalid email or password",
            });
        }

        // Check password
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.render("auth/login", {
                error: "Invalid email or password",
            });
        }

        // Set user session
        req.session.userId = user._id;
        req.session.user = user;
        res.redirect("/dashboard");
    } catch (error) {
        console.error("Login error:", error);
        res.render("auth/login", {
            error: "An error occurred during login",
        });
    }
});

router.get("/register", (req, res) => {
    res.render("auth/register");
});

// POST /auth/register - Handle registration
router.post("/register", async (req, res) => {
    try {
        const { name, email, password, confirmPassword } = req.body;

        // Validate passwords match
        if (password !== confirmPassword) {
            return res.render("auth/register", {
                error: "Passwords do not match",
            });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.render("auth/register", {
                error: "Email already registered",
            });
        }

        // Create new user
        const userInfo = {
            name,
            email,
            password,
        };

        const user = await User.create(userInfo);

        // Set user session
        req.session.userId = user._id;
        req.session.user = user;
        res.redirect("/dashboard");
    } catch (error) {
        console.error("Registration error:", error);
        res.render("auth/register", {
            error: "An error occurred during registration",
        });
    }
});

router.get("/logout", (req, res) => {
    req.session.destroy();
    res.redirect("/");
});

// Dashboard route
router.get('/dashboard', (req, res) => {
    // Check if user is logged in
    if (!req.session.user) {
        return res.redirect('/auth/login');
    }
    res.render('dashboard');
});

export default router;
