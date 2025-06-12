import express from 'express';
const router = express.Router();

// Resources page route
router.get('/', (req, res) => {
    // Check if user is logged in
    if (!req.session.user) {
        return res.redirect('/auth/login');
    }
    res.render('resources');
});

// Individual resource routes
router.get('/mood-tracker', (req, res) => {
    if (!req.session.user) {
        return res.redirect('/auth/login');
    }
    res.render('resources/mood-tracker');
});

router.get('/breathing', (req, res) => {
    if (!req.session.user) {
        return res.redirect('/auth/login');
    }
    res.render('resources/breathing');
});

router.get('/emergency', (req, res) => {
    if (!req.session.user) {
        return res.redirect('/auth/login');
    }
    res.render('resources/emergency');
});

router.get('/journal', (req, res) => {
    if (!req.session.user) {
        return res.redirect('/auth/login');
    }
    res.render('resources/journal');
});

router.get('/meditation', (req, res) => {
    if (!req.session.user) {
        return res.redirect('/auth/login');
    }
    res.render('resources/meditation');
});

router.get('/goals', (req, res) => {
    if (!req.session.user) {
        return res.redirect('/auth/login');
    }
    res.render('resources/goals');
});

router.get('/groups', (req, res) => {
    if (!req.session.user) {
        return res.redirect('/auth/login');
    }
    res.render('resources/groups');
});

router.get('/therapist', (req, res) => {
    if (!req.session.user) {
        return res.redirect('/auth/login');
    }
    res.render('resources/therapist');
});

router.get('/therapy-guide', (req, res) => {
    if (!req.session.user) {
        return res.redirect('/auth/login');
    }
    res.render('resources/therapy-guide');
});

export default router; 