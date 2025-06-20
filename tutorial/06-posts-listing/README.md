# Day 6: Posts Listing UI

## 🎯 Goal

Implement Posts Listing UI (frontend) and integrate with the backend API to fetch existing posts.

## 📚 Learning Outcomes

- Create responsive post listing components.
- Implement infinite scrolling.
- Handle post data fetching.
- Create post filtering system.
- Implement post sorting.
- Design efficient data loading.

## 🚀 Getting Started

Ensure your Day 5 Post Creation is complete and tested. You should understand React hooks and API integration. The backend and frontend should be set up and running.

## 🛠️ Tasks

1.  **Create and Switch to a New Branch**

    > **IMPORTANT:** Always create a new branch for each distinct piece of work.

    ```bash
    # First, ensure you are on your 'master' branch and it's up-to-date
    git checkout master
    git pull origin master  # Get any potential updates from your own repository's master

    # Now, create and switch to a new branch for this day's assignment/feature
    git checkout -b day-6-posts-listing
    ```

    > **What's happening?** You're creating an independent line of development for this day's tasks.

2.  **Set Up Development Environment**

    - **Backend Virtual Environment (if not already active):**
      ```bash
      cd backend
      source venv/bin/activate  # On Windows use: venv\Scripts\activate
      ```
    - **Install Additional Dependencies:**
      ```bash
      pip install Flask Flask-SQLAlchemy Flask-Migrate
      ```
    - **Frontend (already set up from previous days):**
      - Ensure your frontend directory has all Node.js dependencies installed via:
        ```bash
        npm install
        ```

3.  **Frontend Implementation**

    - **Create Post List Component:**
      - Design a responsive list component for displaying posts.
      - Implement infinite scroll functionality within the component, potentially using a custom React hook.
      - Add UI elements and logic for post filtering and sorting options.
      - Implement appropriate loading and error states to enhance user experience.

4.  **Backend Integration**

    - **Create Post Listing Endpoints:**
      - Implement the `GET /api/posts` endpoint on the Flask backend. This endpoint should support pagination (e.g., using `limit` and `offset` query parameters), filtering, and sorting parameters.
      - Optimize database queries for performance when fetching posts.
      - Consider adding data caching for frequently accessed posts to reduce database load.

5.  **Performance Optimization**

    - Implement lazy loading for images and data within the post list to improve initial load times.
    - Add request debouncing for filters and search inputs to prevent excessive API calls.
    - Utilize virtual scrolling (if dealing with very large lists) to efficiently render only visible items.
    - Optimize API calls and React component re-renders to ensure a smooth user interface.

6.  **Run the Application**

    ```bash
    # Start the backend server (in one terminal)
    cd backend
    flask run

    # Start the frontend development server (in another terminal)
    cd frontend
    npm run dev
    ```

    The application will be available at:

    - Frontend: `http://localhost:3000/posts`
    - Backend API: `http://localhost:5000`

7.  **Testing**

    - Test infinite scroll functionality with large data sets.
    - Test filtering and sorting functionality with various criteria.
    - Test loading and error states are displayed correctly during data fetching.
    - Test overall performance and responsiveness of the post listing UI.

## 🔄 Git Workflow

1.  **Develop and Save Your Progress**

    ```bash
    git add .
    git commit -m "Day 6: Implement posts listing UI and backend integration"
    ```

2.  **Push Your Changes to Your Repository**

    ```bash
    git push -u origin day-6-posts-listing
    ```

3.  **Merge After Completion**

    ```bash
    git checkout master
    git pull origin master
    git merge day-6-posts-listing
    git push origin master
    ```

## 📸 Preview

<img src="posts-listing.png" alt="Posts Listing UI" width="120"/>

![Posts Listing Desktop View](post-listing-desk.png)
![Posts Listing Mobile View](post-listing-mobile.png)

## Overview

{{ Add any additional contextual overview about this day's module here, or leave blank if not applicable. }}

## ✅ Deliverable

A performant and responsive post listing system with:

- Infinite scrolling.
- Filtering and sorting.
- Efficient data loading.
- Proper error handling.
- Clean, documented code.
- All tests passing.
