import mongoose from 'mongoose';

const moodSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    date: {
        type: Date,
        required: true,
        default: Date.now
    },
    mood: {
        type: String,
        required: true,
        enum: ['Very Happy', 'Happy', 'Neutral', 'Sad', 'Very Sad']
    },
    activities: [{
        type: String
    }],
    sleepHours: {
        type: Number,
        min: 0,
        max: 24
    },
    notes: {
        type: String
    },
    triggers: [{
        type: String
    }]
}, {
    timestamps: true
});

// Index for efficient querying of user's mood history
moodSchema.index({ userId: 1, date: -1 });

const Mood = mongoose.model('Mood', moodSchema);
export default Mood; 