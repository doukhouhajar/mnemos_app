# Setting Up OpenAI API for AI-Assisted Memory Creation

## Problem
If you see the error: "AI service unavailable: Invalid or missing OpenAI API key", it means your `backend/.env` file contains a placeholder API key instead of a real one.

## Solution

### Step 1: Get Your OpenAI API Key

1. Go to [OpenAI Platform](https://platform.openai.com/account/api-keys)
2. Sign in or create an account
3. Click "Create new secret key"
4. Copy the key (it starts with `sk-` and is about 51 characters long)
5. **Important**: Save it immediately - you won't be able to see it again!

### Step 2: Update Your .env File

1. Open `backend/.env` in a text editor
2. Find the line: `OPENAI_API_KEY=your_actual_api_key_here`
3. Replace `your_actual_api_key_here` with your actual API key
4. It should look like: `OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
5. Save the file

### Step 3: Restart the Backend

```bash
cd backend
# Stop the current server (Ctrl+C if running)
npm run dev
```

### Step 4: Test

Try creating a learning moment with AI assistance. It should work now!

## Troubleshooting

- **Error persists?** Make sure:
  - The API key starts with `sk-`
  - The API key is at least 32 characters long
  - There are no extra spaces or quotes around the key
  - You've restarted the backend server after changing `.env`

- **Still not working?** Check the backend logs:
  ```bash
  tail -f /tmp/mnemos-backend.log
  ```

## Cost Note

OpenAI API usage is charged per request. The AI-assisted feature uses GPT-4o-mini which is very affordable (~$0.15 per 1M input tokens). You can monitor usage at [OpenAI Usage Dashboard](https://platform.openai.com/usage).

