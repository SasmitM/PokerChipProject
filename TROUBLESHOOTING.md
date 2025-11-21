# Troubleshooting Deployment Issues

## Problem: HTML Error Messages When Creating/Joining Tables

If you're seeing HTML error messages (red text) when trying to create or join tables, here's how to fix it:

### Most Common Issue: Environment Variables Not Set at Build Time

**Vite embeds environment variables at BUILD TIME, not runtime.** This means:

1. ✅ You MUST create the `.env` file BEFORE running `npm run build`
2. ❌ Creating `.env` after building won't work - you need to rebuild

### Step-by-Step Fix:

1. **Get your ngrok URL:**
   ```bash
   ngrok http 4000
   # Copy the HTTPS URL (e.g., https://abc123.ngrok.io)
   ```

2. **Create `.env` file in the `frontend` directory:**
   ```bash
   cd frontend
   ```
   
   Create `.env` with:
   ```env
   VITE_API_BASE_URL=https://your-ngrok-url.ngrok.io/api
   VITE_SOCKET_URL=https://your-ngrok-url.ngrok.io
   ```
   
   **Important:** Replace `your-ngrok-url.ngrok.io` with your actual ngrok URL!

3. **Rebuild the frontend:**
   ```bash
   npm run build
   ```

4. **Redeploy to Surge:**
   ```bash
   npx surge dist
   ```

### Verify Your Configuration

After deploying, open your browser's developer console (F12) and check:
- You should see: `API Base URL: https://your-ngrok-url.ngrok.io/api`
- If you see `API Base URL: /api`, the environment variable wasn't set correctly

### Other Common Issues:

#### CORS Errors
- Your backend already allows all origins (`origin: "*"`), so this shouldn't be an issue
- If you still see CORS errors, make sure ngrok is running and accessible

#### Network Errors
- Make sure your backend is running: `cd backend && npm run dev`
- Make sure ngrok is running and pointing to port 4000
- Test your backend directly: Open `https://your-ngrok-url.ngrok.io/api/health` in a browser
  - Should return: `{"status":"healthy","timestamp":"..."}`

#### Wrong API URL Format
- Make sure `VITE_API_BASE_URL` includes `/api` at the end
- Example: `https://abc123.ngrok.io/api` ✅
- Example: `https://abc123.ngrok.io` ❌ (missing /api)

### Quick Checklist:

- [ ] Backend is running (`npm run dev` in backend folder)
- [ ] ngrok is running (`ngrok http 4000`)
- [ ] `.env` file exists in `frontend` directory
- [ ] `.env` has correct ngrok URL with `/api` suffix
- [ ] Built frontend AFTER creating `.env` file
- [ ] Deployed to Surge after building (`npx surge dist`)
- [ ] Checked browser console for API Base URL

### Testing Your Setup:

1. Test backend health endpoint:
   ```bash
   curl https://your-ngrok-url.ngrok.io/api/health
   ```
   Should return: `{"status":"healthy",...}`

2. Check browser console:
   - Open your Surge URL
   - Press F12 to open developer tools
   - Check Console tab
   - Look for "API Base URL:" message
   - Try creating a table and check for any error messages

### Still Having Issues?

1. Check the browser console for specific error messages
2. Check your backend terminal for incoming requests
3. Verify ngrok is still running (URLs change when you restart ngrok)
4. Make sure you rebuilt and redeployed after changing `.env`

