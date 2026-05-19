import { GoogleGenAI } from '@google/genai';
import 'dotenv/config';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export const generateFollowUpQuestion = async (complaintText) => {
  console.log('ENTER: generateFollowUpQuestion');
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-lite',
      contents: `You are an assistant for a complaint registration platform.
Given the following complaint, generate EXACTLY ONE short, relevant follow-up question to ask the user for more details. Do not include any other text, just the question.

Complaint: "${complaintText}"`,
    });
    
    console.log('EXIT: generateFollowUpQuestion');
    return response.text.trim();
  } catch (error) {
    console.error('Error generating AI question:', error);
    throw new Error('Could not generate follow-up question');
  }
};
