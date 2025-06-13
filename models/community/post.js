// models/Post.js
import mongoose from "mongoose";

const postSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, "Post title is required"],
        trim: true,
        maxlength: [200, "Post title cannot exceed 200 characters"],
    },
    content: {
        type: String,
        required: [true, "Post content is required"],
        maxlength: [5000, "Post content cannot exceed 5000 characters"],
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    tags: [
        {
            type: String,
            enum: [
                "anxiety",
                "depression",
                "stress",
                "relationships",
                "self-care",
                "therapy",
                "mindfulness",
                "other",
            ],
        },
    ],
    isAnonymous: {
        type: Boolean,
        default: false,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

postSchema.virtual("answers", {
    ref: "Answer",
    localField: "_id",
    foreignField: "post",
});

export default mongoose.model("Post", postSchema);
