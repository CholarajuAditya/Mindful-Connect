import express from 'express';

const router = express.Router();

// Middleware to check if user is logged in
const isAuthenticated = (req, res, next) => {
    if (req.session.user) {
        next();
    } else {
        res.redirect('/auth/login');
    }
};

// Get breathing exercises page
router.get('/', isAuthenticated, (req, res) => {
    res.render('breathing-exercises', {
        user: req.session.user
    });
});

export default router; 