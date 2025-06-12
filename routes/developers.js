import express from 'express';
const router = express.Router();

router.get('/', (req, res) => {
    console.log('Accessing developers page');
    try {
        res.render('developers');
    } catch (error) {
        console.error('Error rendering developers page:', error);
        res.status(500).send('Error loading developers page');
    }
});

export default router; 