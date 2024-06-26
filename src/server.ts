import express from 'express';
import fs from 'fs';
import path from 'path';
import 'dotenv/config';
import {
  generateAuthUrl as generateGmailAuthUrl,
  setCredentials as setGmailCredentials,
  getGmailClient,
  fetchEmails as fetchGmailEmails
} from './gmail';
import {
  generateAuthUrl as generateOutlookAuthUrl,
  setCredentials as setOutlookCredentials,
  fetchEmails as fetchOutlookEmails
} from './outlook';
import { categorizeEmail, generateResponse } from './openai';
import { addEmailTask } from './scheduler';
import nodemailer from 'nodemailer';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Initialize Nodemailer transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER!, // Replace with your Gmail address
    pass: process.env.EMAIL_PASS!, // Replace with your Gmail password or app-specific password
  },
});

// Utility to save tokens
function saveToken(service: string, token: any) {
  const tokenPath = path.join(__dirname, `${service}_token.json`);
  fs.writeFileSync(tokenPath, JSON.stringify(token));
}

// Gmail OAuth Routes
app.get('/auth/gmail', (req, res) => {
  const authUrl = generateGmailAuthUrl();
  res.redirect(authUrl);
});

app.get('/auth/gmail/callback', async (req, res) => {
  const code = req.query.code as string;
  const tokens = await setGmailCredentials(code);
  saveToken('gmail', tokens);
  res.send('Gmail OAuth successful! You can close this tab.');
});

app.get('/emails/gmail', async (req, res) => {
  const gmail = getGmailClient();
  const emails = await fetchGmailEmails(gmail);
  res.json(emails);
});

// Outlook OAuth Routes
app.get('/auth/outlook', async (req, res) => {
  const authUrl = await generateOutlookAuthUrl();
  res.redirect(authUrl);
});

app.get('/auth/outlook/callback', async (req, res) => {
  const code = req.query.code as string;
  const tokens = await setOutlookCredentials(code);
  saveToken('outlook', tokens);
  res.send('Outlook OAuth successful! You can close this tab.');
});

app.get('/emails/outlook', async (req, res) => {
  const emails = await fetchOutlookEmails();
  res.json(emails);
});

// Categorize email and generate response
app.post('/process-email', async (req, res) => {
  const { emailContent } = req.body;

  try {
    // Categorize the email content
    const category = await categorizeEmail(emailContent);

    // Generate a response based on the category
    const response = await generateResponse(emailContent);

    // Get sender's email address from email content
    const senderEmail = getEmailAddressFromEmailContent(emailContent); // Implement this function
    if (!senderEmail) {
      throw new Error('Sender email address not found in email content');
    }

    // Send the response back to the sender
    await sendEmail(senderEmail, 'Response to Your Email', response);

    // Schedule email processing task
    await addEmailTask(emailContent);

    res.json({ category, response });
  } catch (error) {
    console.error('Error processing email:', error);
    res.status(500).json({ error: 'Error processing email' });
  }
});

// Function to send email
async function sendEmail(to: string, subject: string, text: string) {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER!,
      to,
      subject,
      text,
    });
    console.log(`Email sent to ${to}`);
  } catch (error) {
    console.error(`Error sending email: ${error}`);
    throw error; // Propagate the error
  }
}

// Function to extract email address from email content
function getEmailAddressFromEmailContent(emailContent: string): string | null {
  // Implement logic to extract email address from email content
  // For example, parse the email content to find sender's email address
  // This is a basic example, replace with your actual implementation

  const emailRegex = /[\w.-]+@[\w.-]+\.[a-zA-Z]{2,}/; // Basic email regex pattern
  const match = emailContent.match(emailRegex);
  if (match) {
    return match[0]; // Return the first email address found in the content
  } else {
    return null; // Return null if no email address found
  }
}

// Start Express server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
