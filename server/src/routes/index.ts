import { Router } from 'express';
import { generateNote, generateChildren, health } from '../controllers/aiController';

const router = Router();

router.get('/health', health);
router.post('/generate-note', generateNote);
router.post('/generate-children', generateChildren);

export default router;

