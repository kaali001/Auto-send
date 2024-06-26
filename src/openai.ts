import OpenAI from 'openai';
import 'dotenv/config';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Function to analyze email content and categorize it
export async function categorizeEmail(content: string): Promise<string> {
  const response = await openai.completions.create({
    model: 'text-davinci-003',
    prompt: `Categorize the following email content: "${content}". Categories: Interested, Not Interested, More Information`,
    max_tokens: 10,
  });

  if (response.choices && response.choices.length > 0) {
    return response.choices[0].text.trim();
  } else {
    throw new Error('No response from OpenAI API');
  }
}

// Function to generate an automated response based on email content
export async function generateResponse(content: string): Promise<string> {
  const response = await openai.completions.create({
    model: 'text-davinci-003',
    prompt: `Generate a response for the following email content: "${content}"`,
    max_tokens: 100,
  });

  if (response.choices && response.choices.length > 0) {
    return response.choices[0].text.trim();
  } else {
    throw new Error('No response from OpenAI API');
  }
}
