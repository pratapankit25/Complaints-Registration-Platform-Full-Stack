import { db } from '../db/index.js';
import { complaints, users } from '../db/schema.js';
import { eq, desc } from 'drizzle-orm';
import { generateFollowUpQuestion } from '../services/ai.service.js';

export const getAiQuestion = async (req, res) => {
  try {
    const { complaint_text } = req.body;
    
    if (!complaint_text) {
      return res.status(400).json({ error: 'Complaint text is required' });
    }

    const question = await generateFollowUpQuestion(complaint_text);
    res.json({ ai_question: question });
  } catch (error) {
    console.error('Get AI Question error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const submitComplaint = async (req, res) => {
  try {
    const { complaint_text, ai_question, user_answer } = req.body;
    
    if (!complaint_text || !ai_question || !user_answer) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const newComplaint = await db.insert(complaints).values({
      user_id: req.user.id,
      complaint_text,
      ai_question,
      user_answer,
    }).returning();

    res.json(newComplaint[0]);
  } catch (error) {
    console.error('Submit Complaint error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getMyComplaints = async (req, res) => {
  try {
    const myComplaints = await db.select().from(complaints)
      .where(eq(complaints.user_id, req.user.id))
      .orderBy(desc(complaints.created_at));
      
    res.json(myComplaints);
  } catch (error) {
    console.error('Get My Complaints error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getAllComplaints = async (req, res) => {
  try {
    const allComplaints = await db.select({
      id: complaints.id,
      complaint_text: complaints.complaint_text,
      ai_question: complaints.ai_question,
      user_answer: complaints.user_answer,
      created_at: complaints.created_at,
      user_name: users.name,
      user_email: users.email,
    })
    .from(complaints)
    .leftJoin(users, eq(complaints.user_id, users.id))
    .orderBy(desc(complaints.created_at));
    
    res.json(allComplaints);
  } catch (error) {
    console.error('Get All Complaints error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
