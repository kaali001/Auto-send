import { google } from 'googleapis';
import 'dotenv/config';

const SCOPES = ['https://www.googleapis.com/auth/gmail.readonly'];

// Initialize OAuth2 client with environment variables
const oAuth2Client = new google.auth.OAuth2(
  process.env.GMAIL_CLIENT_ID!,
  process.env.GMAIL_CLIENT_SECRET!,
  process.env.GMAIL_REDIRECT_URL!
);

// Function to generate the authorization URL
export function generateAuthUrl(): string {
  return oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });
}

// Function to set credentials using an authorization code
export async function setCredentials(code: string) {
  const { tokens } = await oAuth2Client.getToken(code);
  oAuth2Client.setCredentials(tokens);
  return tokens;
}

// Function to get the Gmail client
export function getGmailClient() {
  return google.gmail({ version: 'v1', auth: oAuth2Client });
}

// Function to fetch emails
export async function fetchEmails(gmail: any) {
  const res = await gmail.users.messages.list({ userId: 'me', maxResults: 10 });
  const messages = res.data.messages;
  if (!messages || messages.length === 0) {
    console.log('No messages found.');
    return [];
  }
  const emails = [];
  for (const message of messages) {
    const msg = await gmail.users.messages.get({ userId: 'me', id: message.id });
    emails.push(msg.data);
  }
  return emails;
}
