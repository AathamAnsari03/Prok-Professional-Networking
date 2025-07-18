# 🚀 Day 7: First Deployment - Render.com

## 🎯 Goal
Deploy Milestone 1 of the application, including frontend and backend to Render.com for a complete production deployment.

## 📚 Learning Outcomes
- Deploy React application to Render Static Site
- Deploy Flask backend to Render Web Service
- Configure production environment with PostgreSQL database
- Set up environment variables for production
- Implement CORS for production cross-origin requests
- Configure database connections for cloud deployment
- Debug common deployment issues

## 🛠️ What's Been Prepared

### Backend Changes:
1. **Updated `requirements.txt`**:
   - Added `psycopg2-binary` for PostgreSQL support
   - Added `gunicorn` for production server
   - Removed MySQL dependency

2. **Updated `config.py`**:
   - Added PostgreSQL URL handling
   - Fixed postgres:// to postgresql:// conversion for Render

3. **Updated `main.py`**:
   - Added production-ready CORS configuration
   - Added environment-based debug mode
   - Added proper host and port configuration

4. **Created `build.sh`**:
   - Build script for Render deployment
   - Handles dependency installation and database migrations

### Frontend Changes:
1. **Updated `api.ts`**:
   - Added environment-based API URL configuration
   - Supports both development and production

2. **Updated `vite.config.ts`**:
   - Added production build optimization
   - Configured proper output directory

## 🚀 Deployment Steps

### Step 1: Push Your Code
```bash
git add .
git commit -m "Prepare for Render deployment"
git push origin day-7-deployment
```

### Step 2: Deploy to Render.com

1. **Create PostgreSQL Database**:
   - Go to [render.com](https://render.com)
   - Create new PostgreSQL database
   - Copy the database URL

2. **Deploy Backend**:
   - Create new Web Service
   - Connect your GitHub repository
   - Set root directory to `app/backend`
   - Build command: `./build.sh`
   - Start command: `gunicorn main:app`
   - Add environment variables (see below)

3. **Deploy Frontend**:
   - Create new Static Site
   - Connect your GitHub repository
   - Set root directory to `app/frontend`
   - Build command: `npm install && npm run build`
   - Publish directory: `dist`

### Step 3: Environment Variables

**Backend Environment Variables**:
```
DATABASE_URL=postgresql://username:password@host:port/database_name
SECRET_KEY=your-super-secret-key-here
JWT_SECRET_KEY=your-jwt-secret-key-here
FLASK_ENV=production
```

**Frontend Environment Variables** (if needed):
```
VITE_API_URL=https://your-backend-app.onrender.com
```

### Step 4: Update URLs

After deployment, update these files with your actual URLs:

1. **Backend `main.py`**:
   - Update `CORS_ORIGINS` with your frontend URL

2. **Frontend `api.ts`**:
   - Update the production API URL

## 🔍 Testing Your Deployment

1. **Test Backend**: Visit your backend URL
2. **Test Frontend**: Visit your frontend URL
3. **Test Full Flow**: Register, login, create posts

## 🛠️ Troubleshooting

- Check Render logs for build errors
- Verify environment variables are set correctly
- Ensure CORS origins are updated
- Test database connection

## 📝 Next Steps

After successful deployment:
1. Merge `day-7-deployment` to `master`
2. Update documentation with actual URLs
3. Set up monitoring and alerts
4. Plan for future deployments

## 🎉 Success Criteria

- [ ] Backend deployed and accessible
- [ ] Frontend deployed and accessible
- [ ] Database connected and working
- [ ] User registration/login working
- [ ] Posts creation working
- [ ] Profile management working
- [ ] CORS properly configured
- [ ] HTTPS working correctly

## 📚 Additional Resources

- [Render Documentation](https://render.com/docs)
- [Flask Production Deployment](https://flask.palletsprojects.com/en/2.3.x/deploying/)
- [React Production Build](https://create-react-app.dev/docs/production-build/)
- [PostgreSQL on Render](https://render.com/docs/databases) 