// models/Message.js
import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
    {
        content: {
            type: String,
            required: true,
        },
        sender: {
            type: String,
            required: true,
            enum: ["user", "bot"],
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
    },
    { timestamps: true }
);

// Indexes for faster querying
messageSchema.index({ user: 1, createdAt: 1 });

const Message = mongoose.model("Message", messageSchema);

export default Message;
