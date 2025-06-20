# Day 4: profile-edit-backend

## 🎯 Goal

Implement backend functionality for user profile management, including data updates, image handling, and frontend integration.

## 📚 Learning Outcomes

- Create secure profile update endpoints
- Implement image upload and storage
- Set up file validation and processing
- Handle profile data validation
- Implement proper error handling
- Set up secure file serving
- Integrate frontend with backend

## 🚀 Getting Started

Ensure your Day 3 profile UI implementation is complete and working. You should have a good understanding of file handling in Flask, database operations, and basic image processing concepts. The frontend should be ready for backend integration.

## 🛠️ Tasks

### Create and Switch to a New Branch

> **IMPORTANT:** Always create a new branch for each distinct piece of work.

```bash
# First, ensure you are on your 'master' branch and it's up-to-date
git checkout master
git pull origin master  # Get any potential updates from your own repository's master

# Now, create and switch to a new branch for this day's assignment/feature
git checkout -b day-4-profile-backend
```

> **What's happening?** You're creating an independent line of development for this day's tasks.

### Set Up Development Environment

#### Backend Virtual Environment (if not already active):

```bash
cd backend
source venv/bin/activate  # On Windows use: venv\Scripts\activate
```

#### Install Additional Dependencies:

```bash
pip install Pillow python-magic Flask-Limiter
```

### Profile Data Management

#### Set up Profile Data Model

- Extend User model with profile fields
- Add validation rules for each field
- Use simple database creation (no complex migrations for beginners)
- Set up model relationships

**⚠️ Note:** For beginners, use `db.create_all()` instead of complex migration tools.

#### Create Profile Update Endpoint (PUT /api/profile)

- **Purpose:** Handle profile data updates
- **Request Body:** Profile fields to update
- **Backend Logic:**
  - Validate incoming data
  - Update user profile
  - Handle partial updates
  - Return updated profile
- **Responses:**
  - Success: 200 OK with updated profile
  - Error: 400 Bad Request for invalid data

### Image Upload Implementation

#### Set up File Upload Handling

- Configure upload directory
- Set up file size limits
- Implement file type validation
- Create secure file naming

#### Implement Image Processing

- Add image compression
- Handle image resizing
- Generate thumbnails
- Implement format conversion

#### Create Image Upload Endpoint (POST /api/profile/image)

- **Purpose:** Handle profile image uploads
- **Request Body:** Multipart form data with image
- **Backend Logic:**
  - Validate file type and size
  - Process and store image
  - Update user profile
  - Return image URL
- **Responses:**
  - Success: 200 OK with image URL
  - Error: 400 Bad Request for invalid file

### Frontend Integration

#### Implement Profile Data Endpoints

- Create `GET /api/profile` endpoint
- Add `PUT /api/profile` endpoint
- Create `POST /api/profile/image` endpoint
- Handle authentication headers

#### Set up Data Fetching

- Add loading states
- Implement error handling
- Cache profile data
- Handle offline scenarios

### Security Features

#### Basic File Validation

- Check file type (only allow images: jpg, png)
- Set maximum file size (5MB)
- Basic file naming (use timestamp)

#### Basic File Serving

- Set up secure file paths
- Basic access control (only logged-in users)
- Store files in a separate directory

### Run the Application

```bash
# Start the backend server
cd backend
flask run
```

The application will be available at:

- Backend API: http://localhost:5000

### Testing

- Test profile updates with valid and invalid data
- Test image uploads with various file types
- Test file size and type validation
- Test security measures and access control
- Test error handling and recovery
- Test rate limiting and abuse prevention
- Test frontend-backend integration

## 🔄 Git Workflow

### Develop and Save Your Progress

```bash
git add .
git commit -m "Day 4: Implement profile edit backend and frontend integration"
```

### Push Your Changes to Your Repository

```bash
git push -u origin day-4-profile-backend
```

### Merge After Completion

```bash
git checkout master
git pull origin master
git merge day-4-profile-backend
git push origin master
```

## ⚠️ Common Problems & Solutions

### 1. Import Errors & Package Structure

- **Problem:** `ModuleNotFoundError: No module named 'app'` or `ImportError: attempted relative import beyond top-level package`
- **Solution:**
  - Always use **absolute imports** (e.g., `from models.user import User`).
  - **Never use relative imports** like `from ..models.user import User`.
  - Always run your app from the **project root** (e.g., `python main.py` from `/your-project/app/backend`).

### 2. Blueprint Registration

- **Problem:** API route returns 404 even though it exists in your code.
- **Solution:**
  - Make sure all blueprints are imported and registered in `main.py`.
  - Add a debug print after registering blueprints to confirm:
    ```python
    print('>>> All blueprints registered!')
    ```
  - List all routes at startup to debug:
    ```python
    with app.app_context():
        print('>>> Registered routes:')
        for rule in app.url_map.iter_rules():
            print(rule)
    ```

### 3. Database Issues

- **Problem:** Tables not created, or profile not found for a user.
- **Solution:**
  - Use `db.create_all()` in your `main.py` to ensure tables are created.
  - **Auto-create a blank profile** for every new user on signup and on profile update if missing.  
    This avoids "Profile not found" errors.

### 4. JWT & Authentication Issues

- **Problem:** API returns 401 or 404, but curl works and frontend does not.
- **Solution:**
  - Always send the JWT token in the `Authorization` header:  
    `Authorization: Bearer <token>`
  - Make sure your frontend reads the token from `localStorage` and sends it with every API request.
  - If using curl, make sure the token matches the logged-in user in the frontend.
  - If you get `"Profile not found"` but login works, check if the user has a profile in the database.

### 5. Profile Not Found (404)

- **Problem:** User logs in but gets `"Profile not found"` on profile page or when saving changes.
- **Solution:**
  - **Auto-create a profile** for every new user on signup.
  - In the profile update endpoint, auto-create a profile if not found before updating.
  - This ensures every user always has a profile and avoids 404 errors.

### 6. CORS & API URL Confusion

- **Problem:** Frontend requests fail or hit the wrong port.
- **Solution:**
  - Set `API_URL` in your frontend to match your backend (e.g., `http://127.0.0.1:5000`).
  - Make sure CORS is enabled in Flask: `CORS(app)`.
  - Always check the **Network tab** in browser dev tools to see the real request and response.

### 7. Virtual Environment Issues

- **Problem:** Package not found or wrong Python version.
- **Solution:**
  - Always activate your virtual environment first:
    - Linux/Mac: `source venv/bin/activate`
    - Windows: `venv\Scripts\activate`
  - Install all dependencies listed in `requirements.txt`.

### 8. Debugging Tips

- **Print debug info** in your backend to confirm code is running.
- **Check the database** (with a tool or CLI) to confirm users and profiles exist.
- **Use curl** to test endpoints directly and compare with frontend requests.
- **Check request headers** in the browser to ensure JWT is sent.

---

## 🏆 Best Practices

- **Auto-create related records** (like profiles) on signup to avoid missing data errors.
- **Handle all error cases** in both backend and frontend, and show clear messages to users.
- **Keep your code modular** (use blueprints, context, and services).
- **Test each endpoint** with both curl and the frontend.
- **Document your troubleshooting steps** for future reference.

---

## ✅ Deliverable

A secure and robust backend system with:

- Working profile update endpoints
- Secure image upload and processing
- Proper validation and error handling
- Security measures implemented
- Frontend integration complete
- Clean, documented code
- All tests passing
