# Auto-Send Email Response Tool

---

## Overview

Auto-Send Email Response Tool is an automated email processing system designed to handle incoming emails, categorize their content, and send appropriate responses based on the detected category. The tool integrates with both Gmail and Outlook to fetch emails, process them using OpenAI, and schedule automated email responses via RabbitMQ.

---

## Tech Stack

- **Node.js**: Backend runtime environment
- **Express**: Web framework for Node.js
- **Google APIs**: Integration with Gmail
- **Microsoft Graph**: Integration with Outlook
- **OpenAI**: Natural Language Processing (NLP) for email categorization and response generation
- **RabbitMQ**: Task queue for scheduling email processing
- **Nodemailer**: Email sending service
- **dotenv**: Environment variable management

---

## File Structure

```plaintext
.
├── src
│   ├── server.ts
│   ├── gmail.ts
│   ├── outlook.ts
│   ├── openai.ts
│   ├── scheduler.ts
│   └── .env
└── package.json

```

---

## File Details

- **server.ts**: Main server file that sets up the Express server, handles OAuth for Gmail and Outlook, fetches emails, processes them, and sends responses.
- **gmail.ts**: Handles Gmail OAuth, fetching emails, and managing the Gmail client.
- **outlook.ts**: Manages Outlook OAuth and email fetching.
- **openai.ts**: Interfaces with OpenAI to categorize emails and generate responses.
- **scheduler.ts**: Configures RabbitMQ to schedule email processing tasks.

---

## Setup and Installation

1. Clone the repository:

```
     git clone https://github.com/kaali001/Auto-send.git
    
```
```
   cd Auto-send
```

2. Install dependencies:


  ```
   npm install
  ```

3. Create a `.env` file in the root directory with the following parameters:

   
   ```
   PORT=3000

   GMAIL_CLIENT_ID=your_gmail_client_id
   GMAIL_CLIENT_SECRET=your_gmail_client_secret
   GMAIL_REDIRECT_URL=http://localhost:3000/auth/gmail/callback

   OUTLOOK_CLIENT_ID=your_outlook_client_id
   OUTLOOK_CLIENT_SECRET=your_outlook_client_secret
   OUTLOOK_REDIRECT_URL=http://localhost:3000/auth/outlook/callback

   OPENAI_API_KEY=your_openai_api_key

   RABBITMQ_URL=amqp://guest:guest@localhost:5672

   EMAIL_USER=your_email_address
   EMAIL_PASS=your_email_password
   ```
   
5. Run the project:

   ```
   tsc
   ```

   ```
   node src/server.js
   ```

7. Authorize Gmail:

  > [!NOTE]
  > Open a browser and navigate to http://localhost:3000/auth/gmail.
Follow the OAuth process to authorize your application.

6. Authorize Outlook:

  > [!NOTE]
  > Open a browser and navigate to http://localhost:3000/auth/outlook.
Follow the OAuth process to authorize your application.


## Working
 1. **Fetching Emails**: The tool fetches emails from authorized Gmail and Outlook accounts.
 2. **Processing Emails**: Emails are categorized, and responses are generated using OpenAI.
 3. **Scheduling Tasks**: Email processing tasks are scheduled using RabbitMQ.
 4. **Sending Responses**: Appropriate responses are sent back to the senders using Nodemailer.



## Contributions
Feel free to fork the repository and submit pull requests. For major changes, please open an issue first to discuss what you would like to change.



 :+1:Best of luck
