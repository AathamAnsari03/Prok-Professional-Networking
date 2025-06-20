# Day 2: authentication-backend

## 🎯 Goal

Implement the authentication backend using Flask, and integrate it with the frontend UI.

## 📚 Learning Outcomes

- Implement user authentication in Flask  
- Set up JWT token-based authentication  
- Create secure password hashing  
- Implement user registration and login endpoints  
- Connect frontend authentication UI with backend  
- Handle authentication errors and responses  

## 🚀 Getting Started

Ensure your Day 1 setup is complete and all dependencies are installed. You should have separate `frontend/` and `backend/` directories. Basic understanding of JWT and Flask routes/middleware is required.

## 🛠️ Tasks

### Create and Switch to a New Branch

> **IMPORTANT:** Never work directly on the main branch! Always create a new branch for each assignment or distinct piece of work.

```bash
# First, ensure you are on your 'main' branch and it's up-to-date
git checkout main
git pull origin main

# Now, create and switch to a new branch for this assignment
git checkout -b day-2-authentication
```

> **What's happening?** You're creating an isolated branch to implement your authentication logic without modifying the main branch prematurely.

### Set Up Development Environment

#### Backend Environment (Reactivate if needed)

```bash
cd backend
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

#### Install Backend Dependencies

```bash
pip install Flask-SQLAlchemy Flask-Migrate Werkzeug PyJWT Flask-JWT-Extended Flask-CORS Flask-Limiter email-validator
```

> These libraries will help manage your database, secure passwords, and enable token-based authentication with cross-origin support.

#### Frontend Preparation

Ensure your frontend already has dependencies installed from Day 1:

```bash
cd frontend
npm install
```

### Backend Implementation

#### Database Setup and User Model


## Prerequisites 

### 1. **Download MySQL Server**

- Go to the [MySQL Community Downloads page](https://dev.mysql.com/downloads/mysql/).
- Choose your operating system (Windows, macOS, Linux).
- Download and run the installer.
- Follow the setup instructions to install MySQL Server.
- Remember your MySQL **root password** during setup!

### 2. **Download MySQL Workbench**

- Go to the [MySQL Workbench Downloads page](https://dev.mysql.com/downloads/workbench/).
- Choose your operating system.
- Download and install MySQL Workbench.

### 3. **Start MySQL Server**

- On Windows: Use the MySQL Notifier or Services app.
- On macOS/Linux: Use your system’s service manager, e.g.:
  ```bash
  sudo service mysql start
  ```

### 4. **Open MySQL Workbench**

- Launch MySQL Workbench.
- Create a new connection using your MySQL username and password.
- Connect and start managing your databases!

---

**You’re ready to use MySQL for your project!**

---

- Create a `User` model with fields: `id`, `username`, `email`, and `password_hash`.
- Use `generate_password_hash` and `check_password_hash` from `werkzeug.security`.


## ⚙️ Database Configuration

By default, the backend connects to MySQL using the credentials in `app/backend/config.py`.

### 🔄 How to Change MySQL Username and Password

1. Open `app/backend/config.py` in your code editor.
2. Find the line that sets `SQLALCHEMY_DATABASE_URI`:
   ```python
   SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL', 'mysql://root:yourpassword@localhost/prok_db')
   ```
3. Replace `root` and `yourpassword` with your MySQL username and password:
   ```python
   SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL', 'mysql://admin:MyPass123@localhost/prok_db')
   ```
4. Save the file.

---

```bash
  cd app/backend
  # To create Database in MySQL
  mysql -u root -p
  # Enter your password, then in the MySQL shell:
  CREATE DATABASE prok_db;
  USE prok_db;
  exit

#### Registration Endpoint (POST `/api/signup`)

- **Purpose:** Allow new users to register
- **Input:** `username`, `email`, `password`
- **Logic:**
  - Hash password
  - Save new user
  - Validate uniqueness
- **Responses:**
  - `201 Created` – user created
  - `400 Bad Request` – invalid input or duplicate user

#### Login Endpoint (POST `/api/login`)

- **Purpose:** Authenticate users and issue JWT token
- **Input:** `username/email`, `password`
- **Logic:**
  - Verify credentials
  - Generate JWT token
  - Return token + user data
- **Responses:**
  - `200 OK` – success with token
  - `401 Unauthorized` – incorrect credentials

```bash
  # To run backend
  flask run
  # The backend API will be available at: http://localhost:5000
  ```


Certainly! Here’s a **Postman API Testing Guide** in README format, ready to copy-paste into your documentation:

---

## 🚦 API Testing with Postman

This guide will help you test your API endpoints using [Postman](https://www.postman.com/).

---

### 1. **Open Postman**

- Download and install Postman if you don’t have it: [Download Postman](https://www.postman.com/downloads/)

---

### 2. **Create a New Request**

- Click **"New"** → **"HTTP Request"**.

---

### 3. **Set Request Type and URL**

- Select the HTTP method (e.g., **POST**, **GET**).
- Enter your API endpoint URL, for example:
  ```
  http://localhost:5000/api/signup
  ```

---

### 4. **Set the Request Body**

- Click the **"Body"** tab.
- Select **"raw"**.
- Choose **"JSON"** from the dropdown menu.
- Enter your JSON data. For example, to register a user:
  ```json
  {
    "username": "testuser",
    "email": "testuser@example.com",
    "password": "TestPassword123"
  }
  ```

---

### 5. **Send the Request**

- Click the **"Send"** button.

---

### 6. **Check the Response**

- View the response status and message in the lower section of Postman.
  - Example success:  
    ```json
    {
      "message": "User created successfully"
    }
    ```
  - Example error:  
    ```json
    {
      "message": "Username or email already exists"
    }
    ```

---

### 7. **Test the Login Endpoint**

- Change the URL to:
  ```
  http://localhost:5000/api/login
  ```
- Use this JSON body:
  ```json
  {
    "username": "testuser",
    "password": "TestPassword123"
  }
  ```
- Click **"Send"** and check for a token in the response.

---

**You’re now ready to test any API endpoint with Postman!**

---

### Frontend Integration

#### Connect Login Form to Backend

- Send POST request to `/api/login` with form data
- Use `fetch` or `axios` to make request
- Display loading or error states

#### Handle Authentication Responses

- Show success or error messages based on backend response
- Use `useState` to manage feedback and message UI

#### Token Storage and Usage

- Store JWT token in `localStorage`
- Attach token to protected API requests

```js
localStorage.setItem("token", token)
```

### Security Features

- Enforce minimum password complexity
- Add basic rate limiting on auth endpoints
- Set up CORS between frontend and backend
- Sanitize all user inputs

### Run the Application

```bash
# Backend
cd backend
flask run

# Frontend
cd frontend
npm run dev
```

Application available at:

- Frontend: [http://localhost:3000](http://localhost:3000)  
- Backend API: [http://localhost:5000](http://localhost:5000)

### Testing

- Test registration with new and duplicate data
- Test login with valid/invalid credentials
- Confirm JWT token is returned and stored
- Access protected routes with/without token
- Verify frontend error messages display properly

---

### Git Workflow

1. **Develop and Save Your Progress**

```bash
git status
git add .
git commit -m "Day 2: Implement authentication backend and frontend integration"
```

> Use clear commit messages that explain the key changes you've made.

2. **Push Your Changes to Your Fork**

```bash
git push -u origin day-2-authentication
```

> Uploads your branch to your forked repo.

3. **Merge After Assignment Completion**

```bash
git checkout main
git pull origin main
git merge day-2-authentication
git push origin main
```

> Merge your work only once it's been tested and finalized.

---

## ✅ Deliverable

A fully functional authentication system:

- Secure user auth with JWT in Flask backend  
- Integrated frontend login with proper token handling  
- Error messaging and form feedback  
- All tests passing and code documented

