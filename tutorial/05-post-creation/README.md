# Day 5: Post Creation UI

## 🎯 Goal

Build Post Creation UI (frontend) and implement the necessary backend logic for storing posts.

## 📚 Learning Outcomes

- Create post creation interface.
- Implement rich text editing.
- Handle media uploads.
- Create post storage system.
- Implement post validation.
- Design user-friendly post creation flow.

## 🚀 Getting Started

Ensure your Day 4 Profile Backend is complete and working. You should understand rich text editing and media handling. The backend and frontend should be set up and running.

## 🛠️ Tasks

1.  **Create and Switch to a New Branch**

    > **IMPORTANT:** Always create a new branch for each distinct piece of work.

    ```bash
    # First, ensure you are on your 'master' branch and it's up-to-date
    git checkout master
    git pull origin master  # Get any potential updates from your own repository's master

    # Now, create and switch to a new branch for this day's assignment/feature
    git checkout -b day-5-post-creation
    ```

    > **What's happening?** You're creating an independent line of development for this day's tasks.

2.  **Set Up Development Environment**

    - **Backend Virtual Environment (if not already active):**
      ```bash
      cd app/backend
      source venv/bin/activate  # On Windows use: venv\Scripts\activate
      ```
    - **Install Additional Dependencies:**
      ```bash
      pip install Flask Flask-SQLAlchemy Flask-Migrate Pillow python-magic
      ```
    - **Frontend (already set up from previous days):**
      - Ensure your frontend directory has all Node.js dependencies installed via:
        ```bash
        cd app/frontend
        npm install
        ```

3.  **Database Setup (IMPORTANT STEP)**

    - **Reset Database to Clean State:**
      ```bash
      cd app/backend
      python dev_reset_db.py
      ```
      > **Why?** This removes any sample data and ensures a clean database for testing post creation.

4.  **Frontend Implementation**

    - **Create Post Creation Form:**
      - Design a form for post content, including sections for text, media, and a preview.
      - Implement a rich text editor for the main post body to allow formatted input.
      - Add functionality for media uploads (images/videos).
      - Create a post preview component to show how the post will look before submission.
      - Implement client-side form validation for post content and media, along with loading states during submission.

5.  **Backend Implementation**

    - **Create Post Model and Endpoints:**
      - Define a `Post` database model with fields such as `id`, `user_id` (foreign key to the User model), `content`, `media_url` (nullable), `created_at`, etc.
      - Implement the `POST /api/posts` endpoint for handling post creation requests.
      - Set up the necessary logic for media storage and validation on the server side.
      - Add post metadata and consider initial indexing for future search functionality.

6.  **Media Handling**

    - **Implement Image and Video Upload:**
      - Set up file upload handling on the backend for both images and videos.
      - Validate uploaded file types and sizes to ensure they meet requirements.
      - Process and securely store media files on the server (e.g., in a dedicated uploads folder).
      - Generate accessible media URLs that the frontend can use to display the uploaded content.

7.  **Run the Application**

    ```bash
    # Start the backend server (in one terminal)
    cd app/backend
    source venv/bin/activate
    python main.py

    # Start the frontend development server (in another terminal)
    cd app/frontend
    npm run dev
    ```

    The application will be available at:

    - Frontend: `http://localhost:5173/posts/create`
    - Backend API: `http://localhost:5000`

8.  **Testing**

    - Test post creation with text-only content.
    - Test post creation with both text and image media.
    - Test post creation with both text and video media.
    - Test media uploads for various image and video formats/sizes.
    - Test form validation and ensure appropriate error handling is displayed.
    - Test loading states and user feedback during post submission.

## ⚠️ Common Issues & Solutions

### 🔐 Authentication Issues

#### Problem: "Unauthorized" when creating posts

**Solution:**

- Ensure you're logged in and have a valid JWT token
- Check that the token is being sent in the Authorization header
- Verify the token format: `Bearer <your-token>`

#### Problem: "Profile not found" after login

**Solution:**

- Run `python dev_reset_db.py` to reset the database
- Create a new user account through signup
- The system auto-creates profiles for new users

### 🌐 CORS Issues

#### Problem: CORS errors when uploading media

**Solution:**

- Ensure Flask-CORS is properly configured in `main.py`
- Check that the frontend is making requests to the correct backend URL
- Verify the CORS origins include `http://localhost:5173`

#### Problem: Preflight OPTIONS request fails

**Solution:**

- Add explicit CORS configuration for file uploads:

```python
CORS(app, origins=['http://localhost:5173'], methods=['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'])
```

### 📁 File Upload Issues

#### Problem: "File not found" when uploading images

**Solution:**

- Ensure the `uploads/` directory structure exists:
  ```bash
  mkdir -p app/backend/uploads/posts
  mkdir -p app/backend/uploads/thumbnails
  ```
- Check file permissions on upload directories
- Verify file size limits (default: 10MB)

#### Problem: Images not displaying after upload

**Solution:**

- Check that the file URLs are correctly generated
- Ensure the upload directory is accessible via web server
- Verify the file paths in the database match the actual file locations

#### Problem: Thumbnails not generating

**Solution:**

- Ensure Pillow is installed: `pip install Pillow`
- Check that the thumbnails directory exists and has write permissions
- Verify the image processing code is working correctly

### 🗄️ Database Issues

#### Problem: "Table 'posts' doesn't exist"

**Solution:**

- Run `python dev_reset_db.py` to create all tables
- Ensure you're in the correct directory (`app/backend`)
- Check that the virtual environment is activated

#### Problem: Import errors with Post model

**Solution:**

- Use absolute imports: `from models.post import Post`
- Never use relative imports like `from ..models.post import Post`
- Ensure the models are properly imported in `main.py`

### 🔧 Development Server Issues

#### Problem: Frontend shows "Module not found" errors

**Solution:**

- Run `npm install` to install all dependencies
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`
- Check that all import paths are correct

#### Problem: Backend server won't start

**Solution:**

- Check if port 5000 is already in use:
  ```bash
  lsof -i :5000  # Linux/Mac
  netstat -ano | findstr :5000  # Windows
  ```
- Kill the process using the port if needed
- Ensure all dependencies are installed

### 📱 Frontend Issues

#### Problem: Form data not being sent correctly

**Solution:**

- Use `FormData` for file uploads, not JSON
- Don't set `Content-Type` header manually for FormData (browser sets it)
- Ensure the form field names match what the backend expects

#### Problem: Rich text editor not working

**Solution:**

- Check that all required dependencies are installed
- Verify the editor component is properly imported
- Ensure the editor state is being managed correctly

### 🔄 API Integration Issues

#### Problem: Posts not being created

**Solution:**

- Check the browser's Network tab to see the actual request/response
- Verify the API endpoint URL is correct (`/api/posts/` with trailing slash)
- Ensure the request body format matches what the backend expects

#### Problem: Media files not uploading

**Solution:**

- Check file size limits
- Verify file type validation
- Ensure the upload endpoint is working with curl first:
  ```bash
  curl -X POST http://localhost:5000/api/posts/upload/media \
    -H "Authorization: Bearer <your-token>" \
    -F "file=@test-image.jpg"
  ```

## 🔄 Git Workflow

1.  **Develop and Save Progress**

    ```bash
    git add .
    git commit -m "Day 5: Implement post creation UI and backend logic"
    ```

2.  **Push Your Changes to Your Repository**

    ```bash
    git push -u origin day-5-post-creation
    ```

3.  **Merge After Completion**

    ```bash
    git checkout master
    git pull origin master
    git merge day-5-post-creation
    git push origin master
    ```

## 🧪 Testing Checklist

Before submitting your work, ensure you've tested:

- [ ] **Text-only posts** can be created successfully
- [ ] **Image uploads** work with various formats (JPG, PNG, GIF)
- [ ] **Video uploads** work with common formats (MP4, MOV)
- [ ] **File size validation** prevents oversized uploads
- [ ] **File type validation** prevents invalid file types
- [ ] **Form validation** shows appropriate error messages
- [ ] **Loading states** display during upload/submission
- [ ] **Success feedback** is shown after successful post creation
- [ ] **Navigation** works correctly after post creation
- [ ] **Posts appear** in the posts list after creation

## 📸 Preview

<img src="post-creation.png" alt="Post Creation UI" width="120"/>

![Create Post Desktop View](create-post-desk.png)
![Create Post Mobile View](create-post-mobile.png)

## ✅ Deliverable

A fully functional post creation system with:

- Rich text editing.
- Media upload and preview.
- Proper validation and error handling.
- Clean, documented code.
- All tests passing.

## 🆘 Getting Help

### Before Asking for Help

1. **Check this troubleshooting section** for common issues
2. **Test with curl** to isolate frontend/backend issues
3. **Check browser console** for JavaScript errors
4. **Check backend logs** for Python errors
5. **Verify database state** with `python dev_reset_db.py`

### Debugging Tips

#### Backend Debugging

```python
# Add debug prints to your post creation endpoint
print(f"DEBUG: User ID = {current_user.id}")
print(f"DEBUG: Content length = {len(content)}")
print(f"DEBUG: Files received = {len(files)}")
```

#### Frontend Debugging

```javascript
// Add console logs to your form submission
console.log("DEBUG: Form data =", formData);
console.log("DEBUG: Files =", files);
console.log("DEBUG: API response =", response);
```

### Useful Commands

```bash
# Reset everything and start fresh
cd app/backend && python dev_reset_db.py
cd app/frontend && npm run dev

# Test API directly
curl -X POST http://localhost:5000/api/posts/ \
  -H "Authorization: Bearer <your-token>" \
  -F "content=Test post" \
  -F "media=@test-image.jpg"

# Check file permissions
ls -la app/backend/uploads/
```
