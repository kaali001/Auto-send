import express from 'express';
import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';
import 'dotenv/config';
import {
  generateAuthUrl as generateGmailAuthUrl,
  setCredentials as setGmailCredentials,
  getGmailClient,
  fetchEmails as fetchGmailEmails
} from './gmail';
import { categorizeEmail, generateResponse } from './openai';
import { addEmailTask } from './scheduler';
import {
  generateAuthUrl as generateOutlookAuthUrl,
  setCredentials as setOutlookCredentials,
  fetchEmails as fetchOutlookEmails
} from './outlook';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

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
  const category = await categorizeEmail(emailContent);
  const response = await generateResponse(emailContent);

  res.json({ category, response });
});

// Schedule email processing tasks
app.post('/schedule-email', async (req, res) => {
  const { emailContent } = req.body;
  await addEmailTask(emailContent);
  res.send('Email task scheduled successfully.');
});

// Start Express server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
