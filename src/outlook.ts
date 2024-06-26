import { Client } from '@microsoft/microsoft-graph-client';
import 'isomorphic-fetch'; // Required for Microsoft Graph client
import { PublicClientApplication, Configuration, AccountInfo, AuthenticationResult } from '@azure/msal-node';
import 'dotenv/config';
import fs from 'fs';
import path from 'path';

const msalConfig: Configuration = {
  auth: {
    clientId: process.env.OUTLOOK_CLIENT_ID!,
    authority: `https://login.microsoftonline.com/${process.env.OUTLOOK_TENANT_ID!}`,
    clientSecret: process.env.OUTLOOK_CLIENT_SECRET!,
  },
};
const pca = new PublicClientApplication(msalConfig);
const OUTLOOK_SCOPES = ['https://graph.microsoft.com/.default'];

let outlookAccount: AccountInfo | null = null;

// Utility to save tokens
function saveToken(service: string, token: any) {
  const tokenPath = path.join(__dirname, `${service}_token.json`);
  fs.writeFileSync(tokenPath, JSON.stringify(token));
}

// Load token from file
function loadToken(service: string): any {
  const tokenPath = path.join(__dirname, `${service}_token.json`);
  if (fs.existsSync(tokenPath)) {
    const token = fs.readFileSync(tokenPath, 'utf-8');
    return JSON.parse(token);
  }
  return null;
}

// Function to generate the authorization URL for Outlook
export async function generateAuthUrl(): Promise<string> {
  const authCodeUrlParameters = {
    scopes: OUTLOOK_SCOPES,
    redirectUri: process.env.OUTLOOK_REDIRECT_URL!,
  };
  return await pca.getAuthCodeUrl(authCodeUrlParameters);
}

// Function to set credentials using an authorization code
export async function setCredentials(code: string) {
  const tokenRequest = {
    code,
    scopes: OUTLOOK_SCOPES,
    redirectUri: process.env.OUTLOOK_REDIRECT_URL!,
  };
  const response: AuthenticationResult = await pca.acquireTokenByCode(tokenRequest);
  outlookAccount = response.account;
  saveToken('outlook', response);
  return response;
}

// Function to get Outlook client
async function getOutlookClient(): Promise<Client> {
  if (!outlookAccount) {
    const token = loadToken('outlook');
    if (token) {
      outlookAccount = token.account;
    } else {
      throw new Error('Outlook account not authenticated.');
    }
  }

  const tokenResponse: AuthenticationResult = await pca.acquireTokenSilent({
    account: outlookAccount!,
    scopes: OUTLOOK_SCOPES,
  });

  return Client.init({
    authProvider: (done) => {
      done(null, tokenResponse.accessToken);
    },
  });
}

// Function to fetch emails from Outlook
export async function fetchEmails() {
  const client = await getOutlookClient();
  const response = await client.api('/me/messages').top(10).get();
  return response.value;
}
