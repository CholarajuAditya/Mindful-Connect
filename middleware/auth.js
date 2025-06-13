// Authentication middleware
export const isAuthenticated = (req, res, next) => {
    if (req.session.user) {
        next();
    } else {
        res.redirect("/auth/login");
    }
};

// Optional: Add more authentication middleware as needed
export const isAdmin = (req, res, next) => {
    if (req.session.user && req.session.user.isAdmin) {
        next();
    } else {
        res.status(403).render('error', {
            user: req.session.user,
            error: 'Access denied. Admin privileges required.'
        });
    }
}; 