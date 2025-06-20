# Day 7: first-deployment

## 🎯 Goal

Deploy Milestone 1 of the application, including frontend to Netlify/AWS and backend to Python Anywhere.

## 📚 Learning Outcomes

- Deploy React application to Netlify/AWS
- Deploy Flask backend to Python Anywhere
- Configure production environment
- Set up environment variables
- Implement CORS for production
- Configure domain settings

## 🚀 Getting Started

Ensure your **Day 6 Posts Listing** is complete and tested. You should have accounts on **Netlify/AWS** and **Python Anywhere**, and optionally a domain name for custom deployment.

## 🛠️ Tasks

### Create and Switch to a New Branch

> **IMPORTANT:** Always create a new branch for each distinct piece of work.

```bash
# First, ensure you are on your 'master' branch and it's up-to-date
git checkout master
git pull origin master  # Get any potential updates from your own repository's master

# Now, create and switch to a new branch for this day's assignment/feature
git checkout -b day-7-deployment
```

> **What's happening?** You're creating an independent line of development for this day's tasks.

### Set Up Deployment Environment

#### Prepare Frontend for Deployment

```bash
cd frontend
npm run build
```

#### Prepare Backend for Deployment

```bash
cd backend
pip freeze > requirements.txt
```

### Frontend Deployment

- Deploy the production build to **Netlify or AWS**
- Configure **environment variables** in the deployment dashboard
- Set up **build settings** and **custom domain** (if available)
- Implement **SSL** for secure access

### Backend Deployment

- Deploy backend to **Python Anywhere**
- Set up a **virtual environment** and install dependencies
- Configure **WSGI** for Flask
- Set up **environment variables** and **database**
- Implement **SSL** for backend API

### Production Configuration

- Update frontend **API endpoints** to point to the deployed backend
- Configure **CORS** for production
- Set up **error logging and monitoring**
- Configure **backups and security measures**

### Run the Application

- Access the deployed frontend via **Netlify/AWS URL** or **custom domain**
- Access the backend API via **Python Anywhere URL** or **custom domain**

### Testing

- Test **production build and deployment**
- Test **API endpoints** from frontend to backend
- Test **SSL configuration** for both frontend and backend
- Test **error handling and monitoring**
- Test **backup and restore procedures**

## 🔄 Git Workflow

### Develop and Save Your Progress

```bash
git add .
git commit -m "Day 7: Deploy milestone 1 to production"
```

### Push Your Changes to Your Repository

```bash
git push -u origin day-7-deployment
```

### Merge After Completion

```bash
git checkout master
git pull origin master
git merge day-7-deployment
git push origin master
```

## Overview

> This module marks your first full-cycle deployment, from code to cloud. It integrates lessons on environment setup, cloud platform workflows, and production debugging. Use it as a reference for future infrastructure rollouts.

## ✅ Deliverable

A fully deployed application with:

- Frontend live on **Netlify/AWS**
- Backend live on **Python Anywhere**
- Proper **configuration and security** measures
- All **tests passing** in production
- Clean, **documented deployment steps**
