import express from 'express';
const router = express.Router();

// Sample therapist data
const sampleTherapists = [
    {
        _id: '1',
        name: 'Dr. Sarah Johnson',
        location: 'New York, NY',
        specializations: ['Anxiety', 'Depression', 'Stress Management'],
        therapyTypes: ['Individual', 'Online'],
        insurance: ['Private', 'Medicare'],
        bio: 'Licensed psychologist with 8 years of experience. Specializes in anxiety and depression treatment using evidence-based approaches.',
        avatar: '/images/default-avatar.png',
        rating: 4.8,
        reviews: 124
    },
    {
        _id: '2',
        name: 'Dr. Michael Chen',
        location: 'Los Angeles, CA',
        specializations: ['Trauma', 'PTSD', 'Relationships'],
        therapyTypes: ['Individual', 'Couples', 'Group'],
        insurance: ['Private', 'Medicaid'],
        bio: 'Trauma specialist with 12 years of experience. Expert in EMDR therapy and relationship counseling.',
        avatar: '/images/default-avatar.png',
        rating: 4.9,
        reviews: 98
    },
    {
        _id: '3',
        name: 'Dr. Emily Rodriguez',
        location: 'Online',
        specializations: ['Anxiety', 'Addiction', 'Mindfulness'],
        therapyTypes: ['Online', 'Group'],
        insurance: ['Private', 'Sliding Scale'],
        bio: 'Certified addiction specialist with 6 years of experience. Combines traditional therapy with mindfulness practices.',
        avatar: '/images/default-avatar.png',
        rating: 4.7,
        reviews: 156
    },
    {
        _id: '4',
        name: 'Dr. James Wilson',
        location: 'Chicago, IL',
        specializations: ['Depression', 'Stress Management', 'Career Counseling'],
        therapyTypes: ['Individual', 'Online'],
        insurance: ['Private', 'Medicare', 'Medicaid'],
        bio: 'Career-focused therapist helping professionals manage work-related stress and depression.',
        avatar: '/images/default-avatar.png',
        rating: 4.6,
        reviews: 87
    }
];

// GET /therapist - Show therapist search page
router.get('/', (req, res) => {
    // Check if user is logged in
    if (!req.session.user) {
        return res.redirect('/auth/login');
    }
    
    res.render('therapist', { 
        therapists: sampleTherapists,
        user: req.session.user
    });
});

// GET /therapist/search - Handle therapist search
router.get('/search', (req, res) => {
    // Check if user is logged in
    if (!req.session.user) {
        return res.redirect('/auth/login');
    }

    const { location, specialization, therapyType, insurance } = req.query;
    
    // Simple search filtering
    let filteredTherapists = [...sampleTherapists];
    
    if (location) {
        filteredTherapists = filteredTherapists.filter(t => 
            t.location.toLowerCase().includes(location.toLowerCase())
        );
    }
    
    if (specialization) {
        filteredTherapists = filteredTherapists.filter(t => 
            t.specializations.some(s => s.toLowerCase() === specialization.toLowerCase())
        );
    }
    
    if (therapyType) {
        filteredTherapists = filteredTherapists.filter(t => 
            t.therapyTypes.some(type => type.toLowerCase() === therapyType.toLowerCase())
        );
    }
    
    if (insurance) {
        filteredTherapists = filteredTherapists.filter(t => 
            t.insurance.some(i => i.toLowerCase() === insurance.toLowerCase())
        );
    }
    
    res.render('therapist', {
        therapists: filteredTherapists,
        user: req.session.user,
        searchParams: req.query
    });
});

// GET /therapist/:id - Show individual therapist profile
router.get('/:id', (req, res) => {
    // Check if user is logged in
    if (!req.session.user) {
        return res.redirect('/auth/login');
    }

    const therapistId = req.params.id;
    const therapist = sampleTherapists.find(t => t._id === therapistId);
    
    if (!therapist) {
        return res.status(404).render('error', {
            message: 'Therapist not found',
            user: req.session.user
        });
    }
    
    res.render('therapist-profile', {
        therapist,
        user: req.session.user
    });
});

export default router; 