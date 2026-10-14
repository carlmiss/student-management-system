# Project 1 — Three-Tier Student Management App

Stack required by the assignment:
- Frontend: HTML/CSS/JavaScript deployed on Netlify
- Backend: Node.js + Express REST API deployed on Render
- Database: MongoDB Atlas

## Included features
- Create, list, search, update, and delete student records
- REST API with `/api/health` and `/api/students`
- MongoDB Atlas connection through `MONGODB_URI`
- CORS allow-list through `FRONTEND_URL`
- Responsive frontend

## Deployment outline

### 1. MongoDB Atlas
Create a free cluster, a database user, and a network access rule that permits the Render service to connect. Copy the database connection string. Replace the username/password placeholders and use database name `studentdb`. Do not commit credentials.

### 2. Deploy backend to Render
Create a GitHub repository and push the contents of this project. In Render, create a **Web Service** from the repository and set the root directory to `backend`.
- Build command: `npm install`
- Start command: `npm start`
- Environment variables:
  - `MONGODB_URI` = your Atlas connection string
  - `FRONTEND_URL` = your Netlify site URL (set this after deploying the frontend; temporary local testing can use an empty value)
Render assigns the public API URL.

### 3. Configure and deploy frontend to Netlify
Edit `frontend/config.js` and replace the placeholder with your Render service URL, for example `https://your-service.onrender.com` (no trailing slash).
Deploy the `frontend` folder to Netlify. Set `FRONTEND_URL` in Render to the exact Netlify URL, then redeploy/restart the Render service if needed.

### 4. Verify
- Open `https://YOUR-RENDER-URL/api/health`; expect `{"status":"ok","database":"connected"}`.
- Open the Netlify site.
- Add a student, refresh the page, search for the student, edit the record, then delete it.
- Capture screenshots of the live app, CRUD actions, API health endpoint, Render deployment, and MongoDB Atlas data.

## Security notes
- Never put `MONGODB_URI` or database credentials in frontend files.
- Keep `.env` out of GitHub.
- For a quick demo, an Atlas network rule allowing `0.0.0.0/0` may be used if required by the hosted service; use a strong database password and remove or tighten the rule after evaluation.
