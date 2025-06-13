import express from 'express';
const router = express.Router();

router.get('/', (req, res) => {
    console.log('Accessing about page');
    try {
        res.render('about');
    } catch (error) {
        console.error('Error rendering abut page:', error);
        res.status(500).send('Error loading about page');
    }
});

export default router; 