import express from "express";
import Post from "../models/community/post.js";
import Answer from "../models/community/answer.js";

const router = express.Router();

// Middleware to check if user is logged in
const isAuthenticated = (req, res, next) => {
    if (req.session.user) {
        next();
    } else {
        res.redirect("/auth/login");
    }
};

// Get all community questions
router.get("/", isAuthenticated, async (req, res) => {
    try {
        const posts = await Post.find()
            .populate("author", "name avatar")
            .sort("-createdAt")
            .limit(10)
            .exec();

        res.render("community", {
            user: req.session.user,
            posts,
        });
    } catch (err) {
        console.error("Error fetching community posts:", err);
        res.render("community", {
            user: req.session.user,
            error: "Failed to load community posts",
        });
    }
});

// Get single question with answers
router.get("/:id", isAuthenticated, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id)
            .populate("author", "name avatar")
            .populate({
                path: "answers",
                populate: {
                    path: "author",
                    select: "name avatar",
                },
                options: { sort: { isSolution: -1, createdAt: -1 } },
            });

        if (!post) {
            return res.status(404).render("error", {
                user: req.session.user,
                error: "Question not found",
            });
        }

        res.render("question-detail", {
            user: req.session.user,
            post,
        });
    } catch (err) {
        console.error("Error fetching question:", err);
        res.render("error", {
            user: req.session.user,
            error: "Failed to load question",
        });
    }
});

// Create new question
router.post("/", isAuthenticated, async (req, res) => {
    try {
        const { title, content, tags } = req.body;

        const post = new Post({
            title,
            content,
            tags: tags || [],
            author: req.session.user._id,
        });

        await post.save();

        res.redirect(`/community/${post._id}`);
    } catch (err) {
        console.error("Error creating question:", err);
        res.render("community", {
            user: req.session.user,
            error: "Failed to create question",
        });
    }
});

// Add answer to question
// In your community controller (routes/community.js)
router.post("/:id/answers", isAuthenticated, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        // Check if user is the question author
        if (post.author.toString() === req.session.user._id) {
            return res.status(403).render("question-detail", {
                user: req.session.user,
                post,
                error: "You can't answer your own question",
            });
        }

        const { content } = req.body;

        const answer = new Answer({
            content,
            author: req.session.user._id,
            post: req.params.id,
        });

        await answer.save();

        res.redirect(`/community/${req.params.id}`);
    } catch (err) {
        console.error("Error adding answer:", err);
        res.render("question-detail", {
            user: req.session.user,
            error: "Failed to add answer",
        });
    }
});

// Mark answer as solution
router.post("/answers/:id/solution", isAuthenticated, async (req, res) => {
    try {
        const answer = await Answer.findById(req.params.id).populate("post");

        if (!answer) {
            return res.status(404).render("error", {
                user: req.session.user,
                error: "Answer not found",
            });
        }

        // Check if user is the question author
        if (answer.post.author.toString() !== req.session.user._id) {
            return res.status(403).render("error", {
                user: req.session.user,
                error: "Only the question author can mark a solution",
            });
        }

        // Unmark any previous solutions
        await Answer.updateMany(
            { post: answer.post._id, isSolution: true },
            { $set: { isSolution: false } }
        );

        answer.isSolution = true;
        await answer.save();

        res.redirect(`/community/${answer.post._id}`);
    } catch (err) {
        console.error("Error marking solution:", err);
        res.render("question-detail", {
            user: req.session.user,
            error: "Failed to mark solution",
        });
    }
});

export default router;
