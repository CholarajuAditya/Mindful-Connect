import express from 'express';
import Mood from '../models/Mood.js';

const router = express.Router();

// Middleware to check if user is logged in
const isAuthenticated = (req, res, next) => {
    console.log('Checking authentication:', req.session.user);
    if (req.session.user) {
        next();
    } else {
        console.log('User not authenticated, redirecting to login');
        res.redirect('/auth/login');
    }
};

// Get mood tracker page
router.get('/', isAuthenticated, async (req, res) => {
    console.log('Accessing mood tracker page for user:', req.session.user._id);
    try {
        // Get user's mood entries for the last 7 days
        const moodEntries = await Mood.find({
            userId: req.session.user._id
        })
        .sort({ date: -1 })
        .limit(7);

        console.log('Found mood entries:', moodEntries.length);
        console.log('Sample entry:', moodEntries[0] ? JSON.stringify(moodEntries[0]) : 'No entries found');
        
        res.render('mood-tracker', {
            moodEntries,
            user: req.session.user
        });
    } catch (error) {
        console.error('Error fetching mood entries:', error);
        res.status(500).render('error', { message: 'Error loading mood tracker' });
    }
});

// Add new mood entry
router.post('/add', isAuthenticated, async (req, res) => {
    console.log('Adding new mood entry for user:', req.session.user._id);
    console.log('Request body:', req.body);
    
    try {
        const { mood, activities, sleepHours, notes, triggers } = req.body;
        
        const newMood = new Mood({
            userId: req.session.user._id,
            mood,
            activities: activities ? activities.split(',').map(a => a.trim()) : [],
            sleepHours: sleepHours || 0,
            notes,
            triggers: triggers ? triggers.split(',').map(t => t.trim()) : []
        });

        console.log('Creating new mood entry:', JSON.stringify(newMood));
        
        const savedMood = await newMood.save();
        console.log('Mood entry saved successfully:', JSON.stringify(savedMood));
        
        res.json({ success: true, message: 'Mood entry saved successfully' });
    } catch (error) {
        console.error('Error saving mood entry:', error);
        res.status(500).json({ success: false, message: 'Error saving mood entry' });
    }
});

// Get mood history
router.get('/history', isAuthenticated, async (req, res) => {
    console.log('Fetching mood history for user:', req.session.user._id);
    try {
        const moodEntries = await Mood.find({
            userId: req.session.user._id
        })
        .sort({ date: -1 })
        .limit(30); // Get last 30 days

        console.log('Found mood history entries:', moodEntries.length);
        console.log('Sample history entry:', moodEntries[0] ? JSON.stringify(moodEntries[0]) : 'No entries found');
        
        res.json({ success: true, moodEntries });
    } catch (error) {
        console.error('Error fetching mood history:', error);
        res.status(500).json({ success: false, message: 'Error fetching mood history' });
    }
});

export default router; 