# 🚀 Deployment Guide - Render.com

This guide will help you deploy your full-stack application to Render.com with both frontend and backend services.

## 📋 Prerequisites

1. **Render.com Account**: Sign up at [render.com](https://render.com)
2. **GitHub Repository**: Your code should be pushed to GitHub
3. **PostgreSQL Database**: We'll use Render's PostgreSQL service

## 🗄️ Step 1: Deploy PostgreSQL Database

1. **Create PostgreSQL Database**:
   - Go to Render Dashboard
   - Click "New" → "PostgreSQL"
   - Name: `your-app-database`
   - Database: `your_app_db`
   - User: `your_app_user`
   - Region: Choose closest to you
   - Click "Create Database"

2. **Save Database Credentials**:
   - Copy the `External Database URL`
   - Save it for the backend deployment

## 🔧 Step 2: Deploy Backend (Flask API)

1. **Create Web Service**:
   - Go to Render Dashboard
   - Click "New" → "Web Service"
   - Connect your GitHub repository
   - Select the repository

2. **Configure Backend Service**:
   ```
   Name: your-app-backend
   Root Directory: app/backend
   Runtime: Python 3
   Build Command: ./build.sh
   Start Command: gunicorn main:app
   ```

3. **Environment Variables**:
   ```
   DATABASE_URL: [Your PostgreSQL URL from Step 1]
   SECRET_KEY: [Generate a secure random key]
   JWT_SECRET_KEY: [Generate another secure random key]
   FLASK_ENV: production
   ```

4. **Deploy**:
   - Click "Create Web Service"
   - Wait for deployment to complete
   - Copy the service URL (e.g., `https://your-app-backend.onrender.com`)

## 🎨 Step 3: Deploy Frontend (React App)

1. **Create Static Site**:
   - Go to Render Dashboard
   - Click "New" → "Static Site"
   - Connect your GitHub repository
   - Select the repository

2. **Configure Frontend Service**:
   ```
   Name: your-app-frontend
   Root Directory: app/frontend
   Build Command: npm install && npm run build
   Publish Directory: dist
   ```

3. **Environment Variables** (if needed):
   ```
   VITE_API_URL: https://your-app-backend.onrender.com
   ```

4. **Deploy**:
   - Click "Create Static Site"
   - Wait for deployment to complete
   - Copy the site URL (e.g., `https://your-app-frontend.onrender.com`)

## 🔗 Step 4: Update CORS Configuration

1. **Update Backend CORS**:
   - Go to your backend service on Render
   - Add your frontend URL to the CORS origins in `main.py`
   - Redeploy the backend

2. **Update Frontend API URL**:
   - Update the API URL in `src/services/api.ts`
   - Redeploy the frontend

## 🔍 Step 5: Test Your Deployment

1. **Test Backend**:
   - Visit: `https://your-app-backend.onrender.com`
   - Should see: `{"message": "Server is running!", "status": "ok"}`

2. **Test Frontend**:
   - Visit: `https://your-app-frontend.onrender.com`
   - Should load your React application

3. **Test Full Flow**:
   - Try registering a new user
   - Try logging in
   - Test creating posts
   - Test profile updates

## 🛠️ Troubleshooting

### Common Issues:

1. **Build Failures**:
   - Check build logs in Render dashboard
   - Ensure all dependencies are in `requirements.txt`
   - Verify Python version compatibility

2. **Database Connection Issues**:
   - Verify `DATABASE_URL` environment variable
   - Check if PostgreSQL service is running
   - Ensure database migrations are applied

3. **CORS Errors**:
   - Update CORS origins in backend
   - Check browser console for specific errors
   - Verify frontend URL is correct

4. **Environment Variables**:
   - Double-check all environment variables are set
   - Ensure no typos in variable names
   - Restart services after changing variables

### Useful Commands:

```bash
# Check backend logs
# Use Render dashboard → Logs

# Check database connection
# Use Render dashboard → PostgreSQL → Connect

# Redeploy services
# Use Render dashboard → Manual Deploy
```

## 🔄 Continuous Deployment

- Render automatically redeploys when you push to your main branch
- You can set up different branches for staging/production
- Use environment variables to manage different configurations

## 📊 Monitoring

- Use Render's built-in monitoring
- Check logs regularly for errors
- Monitor database performance
- Set up alerts for service downtime

## 🔒 Security Considerations

1. **Environment Variables**: Never commit secrets to Git
2. **HTTPS**: Render provides SSL certificates automatically
3. **CORS**: Only allow necessary origins
4. **Database**: Use strong passwords and limit access

## 🎉 Success!

Your application is now deployed and accessible worldwide! 

- Frontend: `https://your-app-frontend.onrender.com`
- Backend: `https://your-app-backend.onrender.com`
- Database: Managed by Render PostgreSQL

Remember to update the URLs in this guide with your actual deployment URLs! 