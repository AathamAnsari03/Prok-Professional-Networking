# 🚀 Deployment Checklist - Render.com

## ✅ Pre-Deployment Checklist

- [ ] Code is committed and pushed to `day-7-deployment` branch
- [ ] Render.com account is created
- [ ] GitHub repository is connected to Render
- [ ] PostgreSQL database plan is selected

## 🗄️ Step 1: Create PostgreSQL Database

### On Render Dashboard:
- [ ] Click "New" → "PostgreSQL"
- [ ] Name: `your-app-database`
- [ ] Database: `your_app_db`
- [ ] User: `your_app_user`
- [ ] Region: Choose closest to you
- [ ] Plan: Free (for testing)
- [ ] Click "Create Database"
- [ ] **Copy the External Database URL**

## 🔧 Step 2: Deploy Backend

### On Render Dashboard:
- [ ] Click "New" → "Web Service"
- [ ] Connect GitHub repository
- [ ] Select `Project_1` repository
- [ ] Branch: `day-7-deployment`

### Configuration:
- [ ] Name: `your-app-backend`
- [ ] Root Directory: `app/backend`
- [ ] Runtime: `Python 3`
- [ ] Build Command: `./build.sh`
- [ ] Start Command: `gunicorn main:app`

### Environment Variables:
- [ ] `DATABASE_URL`: [Your PostgreSQL URL from Step 1]
- [ ] `SECRET_KEY`: [Generate random string]
- [ ] `JWT_SECRET_KEY`: [Generate random string]
- [ ] `FLASK_ENV`: `production`

### Deploy:
- [ ] Click "Create Web Service"
- [ ] Wait for deployment (5-10 minutes)
- [ ] **Copy the service URL** (e.g., `https://your-app-backend.onrender.com`)

## 🎨 Step 3: Deploy Frontend

### On Render Dashboard:
- [ ] Click "New" → "Static Site"
- [ ] Connect GitHub repository
- [ ] Select `Project_1` repository
- [ ] Branch: `day-7-deployment`

### Configuration:
- [ ] Name: `your-app-frontend`
- [ ] Root Directory: `app/frontend`
- [ ] Build Command: `npm install && npm run build`
- [ ] Publish Directory: `dist`

### Deploy:
- [ ] Click "Create Static Site"
- [ ] Wait for deployment (3-5 minutes)
- [ ] **Copy the site URL** (e.g., `https://your-app-frontend.onrender.com`)

## 🔗 Step 4: Update Configuration

### Update Backend CORS:
- [ ] Go to your backend service on Render
- [ ] Add your frontend URL to CORS origins in `main.py`
- [ ] Redeploy backend

### Update Frontend API URL:
- [ ] Update the production API URL in `src/services/api.ts`
- [ ] Redeploy frontend

## 🔍 Step 5: Test Deployment

### Backend Tests:
- [ ] Visit backend URL
- [ ] Should see: `{"message": "Server is running!", "status": "ok"}`
- [ ] Check logs for any errors

### Frontend Tests:
- [ ] Visit frontend URL
- [ ] Should load React application
- [ ] Check browser console for errors

### Full Flow Tests:
- [ ] Register a new user
- [ ] Login with credentials
- [ ] Create a new post
- [ ] Update profile information
- [ ] Test all major features

## 🛠️ Troubleshooting

### If Backend Fails:
- [ ] Check build logs
- [ ] Verify environment variables
- [ ] Check database connection
- [ ] Ensure `build.sh` is executable

### If Frontend Fails:
- [ ] Check build logs
- [ ] Verify API URL is correct
- [ ] Check for CORS errors
- [ ] Ensure all dependencies are installed

### If Database Connection Fails:
- [ ] Verify `DATABASE_URL` format
- [ ] Check PostgreSQL service status
- [ ] Ensure database is accessible
- [ ] Check network connectivity

## 🎉 Success Indicators

- [ ] Backend responds to health check
- [ ] Frontend loads without errors
- [ ] Database operations work
- [ ] User authentication works
- [ ] All CRUD operations work
- [ ] HTTPS is working
- [ ] No CORS errors in browser console

## 📝 Post-Deployment

- [ ] Update documentation with actual URLs
- [ ] Set up monitoring alerts
- [ ] Test all user flows
- [ ] Document any issues found
- [ ] Plan for future deployments

## 🔄 Next Steps

- [ ] Merge `day-7-deployment` to `master`
- [ ] Set up continuous deployment
- [ ] Configure custom domain (optional)
- [ ] Set up backup strategies
- [ ] Monitor performance metrics

---

**Remember**: Keep your database URL and secret keys secure. Never commit them to Git! 