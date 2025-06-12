// models/user.js
import mongoose from "mongoose";
import bcrypt from "bcrypt";

const UserSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "please provide name"],
        },
        email: {
            type: String,
            unique: true,
            lowercase: true,
            required: [true, "please provide email"],
        },
        password: {
            type: String,
            required: [true, "please provide password"],
        },
    },
    { timestamps: true }
);

UserSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();

    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Export the model directly
export const User = mongoose.model("User", UserSchema);
