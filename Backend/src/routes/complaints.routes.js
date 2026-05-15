import express from 'express';
import { getAiQuestion, submitComplaint, getMyComplaints, getAllComplaints } from '../controllers/complaints.controller.js';
import { verifyToken, verifyAdmin } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/ai/question', verifyToken, getAiQuestion);
router.post('/', verifyToken, submitComplaint);
router.get('/my', verifyToken, getMyComplaints);
router.get('/admin', verifyToken, verifyAdmin, getAllComplaints);

export default router;
