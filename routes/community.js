import express from "express";
import Post from "../models/community/post.js";
import Answer from "../models/community/answer.js";
import Community from '../models/Community.js';
import { isAuthenticated } from '../middleware/auth.js';

const router = express.Router();

// Get all community content
router.get("/", isAuthenticated, async (req, res) => {
    try {
        // Fetch all types of content
        const [discussions, successStories, posts] = await Promise.all([
            Community.find({ type: 'discussion' })
                .populate('author', 'name')
                .sort({ createdAt: -1 })
                .limit(3),
            Community.find({ type: 'success_story' })
                .populate('author', 'name')
                .sort({ createdAt: -1 })
                .limit(2),
            Post.find()
                .populate("author", "name avatar")
                .populate("answers")
                .sort("-createdAt")
                .limit(10)
        ]);

        res.render("community", {
            user: req.session.user,
            discussions,
            successStories,
            posts
        });
    } catch (err) {
        console.error("Error fetching community content:", err);
        res.render("community", {
            user: req.session.user,
            error: "Failed to load community content",
            discussions: [],
            successStories: [],
            posts: []
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

        // Get the answer count
        const answerCount = post.answers ? post.answers.length : 0;

        res.render("question-detail", {
            user: req.session.user,
            post,
            answerCount
        });
    } catch (err) {
        console.error("Error fetching question:", err);
        res.render("error", {
            user: req.session.user,
            error: "Failed to load question",
        });
    }
});

// Create new community content
router.post("/", isAuthenticated, async (req, res) => {
    try {
        const { type, title, content, tags } = req.body;
        
        if (type === 'discussion' || type === 'success_story') {
            // Convert tags string to array if it exists
            const tagsArray = tags ? tags.split(',').map(tag => tag.trim()) : [];
            
            const newContent = new Community({
                type,
                title,
                content,
                tags: tagsArray,
                author: req.session.user._id
            });

            await newContent.save();
            return res.redirect('/community');
        } else {
            // Handle regular post creation
            const post = new Post({
                title,
                content,
                tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
                author: req.session.user._id,
            });

            await post.save();
            return res.redirect(`/community/${post._id}`);
        }
    } catch (error) {
        console.error('Error creating content:', error);
        res.status(500).render("error", {
            user: req.session.user,
            error: "Error creating content: " + error.message
        });
    }
});

// Add answer to question
router.post("/:id/answers", isAuthenticated, async (req, res) => {
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

        // Check if user is the question author
        if (post.author._id.toString() === req.session.user._id.toString()) {
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

        // Add the answer to the post's answers array
        post.answers.push(answer._id);
        await post.save();

        // Get updated post with new answer
        const updatedPost = await Post.findById(req.params.id)
            .populate("author", "name avatar")
            .populate({
                path: "answers",
                populate: {
                    path: "author",
                    select: "name avatar",
                },
                options: { sort: { isSolution: -1, createdAt: -1 } },
            });

        res.render("question-detail", {
            user: req.session.user,
            post: updatedPost,
            answerCount: updatedPost.answers.length
        });
    } catch (err) {
        console.error("Error adding answer:", err);
        res.render("error", {
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
