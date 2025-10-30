const { Router } = require('express');
const { generateNote, generateChildren, health } = require('../controllers/aiController');

const router = Router();

router.get('/health', health);
router.post('/generate-note', generateNote);
router.post('/generate-children', generateChildren);

module.exports = router;


