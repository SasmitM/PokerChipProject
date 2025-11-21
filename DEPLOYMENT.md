# Deployment Guide

This guide explains how to deploy the Poker Chip Tracker for playing with friends using **Surge** (frontend) and **ngrok** (backend).

## Prerequisites

1. **Surge CLI** (can use `npx` - no installation needed)
2. **ngrok** installed: Download from https://ngrok.com/download
3. Backend running locally on port 4000

## Step 1: Start Backend with ngrok

1. Start your backend server:
```bash
cd backend
npm run dev
```

2. In a new terminal, start ngrok:
```bash
ngrok http 4000
```

3. Copy the HTTPS URL that ngrok provides (e.g., `https://abc123.ngrok.io`)
   - This is your backend URL
   - Keep this terminal open while playing

## Step 2: Configure Frontend for Deployment

1. Create a `.env` file in the `frontend` directory:
```bash
cd frontend
```

2. Create `.env` with your ngrok URL:
```env
VITE_API_BASE_URL=https://your-ngrok-url.ngrok.io/api
VITE_SOCKET_URL=https://your-ngrok-url.ngrok.io
```

Replace `your-ngrok-url.ngrok.io` with your actual ngrok URL.

## Step 3: Build Frontend

```bash
cd frontend
npm run build
```

This creates the `dist` folder with production files.

## Step 4: Deploy to Surge

1. From the `frontend` directory:
```bash
npx surge dist
```

2. Follow the prompts:
   - Email: Enter your Surge account email
   - Password: Enter your Surge password (or create account if first time)
   - Domain: Choose a domain (e.g., `your-poker-game.surge.sh`)

3. Your frontend is now live!

## Step 5: Share with Friends

1. Share your Surge URL (e.g., `https://your-poker-game.surge.sh`)
2. Make sure your backend is running and ngrok is active
3. Friends can now access the game!

## Important Notes

- **ngrok URLs change** when you restart ngrok (unless you have a paid plan with a static domain)
- If your ngrok URL changes, you need to:
  1. Update the `.env` file with the new URL
  2. Rebuild: `npm run build`
  3. Redeploy: `surge dist` (it will ask to update existing domain)

## Development vs Production

- **Development**: Uses proxy (`/api`) and `localhost:4000` for socket
- **Production**: Uses environment variables pointing to ngrok

## Troubleshooting

- **CORS errors**: Make sure your backend CORS settings allow your Surge domain
- **Socket connection fails**: Verify `VITE_SOCKET_URL` matches your ngrok URL
- **API calls fail**: Verify `VITE_API_BASE_URL` is correct and includes `/api`

## Quick Update Workflow

If you need to update the frontend after changing ngrok URL:

```bash
# 1. Update .env file with new ngrok URL
# 2. Rebuild
npm run build

# 3. Redeploy (Surge will update existing deployment)
npx surge dist
```

