# Day 14: Messaging Backend

## 🎯 Goal

Integrate Messaging Backend Logic (Flask) to send and receive messages.

## 📚 Learning Outcomes

- Implement WebSocket server.
- Create message handling system.
- Design message storage.
- Implement real-time updates.
- Create message delivery system.
- Handle message persistence.

## 🚀 Getting Started

Ensure your Day 13 Messaging UI is complete and tested. You should understand WebSocket and database design. The backend and frontend should be set up and running.

## 🛠️ Tasks

1.  **Create and Switch to a New Branch**

    > **IMPORTANT:** Always create a new branch for each distinct piece of work.

    ```bash
    # First, ensure you are on your 'master' branch and it's up-to-date
    git checkout master
    git pull origin master  # Get any potential updates from your own repository's master

    # Now, create and switch to a new branch for this day's assignment/feature
    git checkout -b day-14-messaging-backend
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
      pip install Flask-SocketIO python-socketio SQLAlchemy
      ```
    - **Frontend (already set up from previous days):**
      - Ensure your frontend directory has all Node.js dependencies installed via `npm install`.

3.  **Backend Implementation**

    - **Set Up WebSocket Server:**
      - Configure and initialize a WebSocket server using `Flask-SocketIO` within your Flask application.
      - Define WebSocket event handlers for sending and receiving messages (e.g., `connect`, `disconnect`, `message` events).
      - Implement message storage logic, ensuring messages are persisted in the database.
      - Add message validation before processing and storing messages.
      - Create a message delivery system to broadcast messages to relevant users/conversations.
      - Implement functionality to retrieve and send message history when a user joins a conversation.
    - **Real-time Features (Conceptual for tutorial, as real-time is _not_ fully required):**
      - Set up WebSocket event handlers for basic real-time interactions.
      - _Optionally, for a more advanced tutorial_, consider creating a basic typing indicator system.
      - _Optionally_, implement read receipt functionality for messages.
      - _Optionally_, implement online status tracking for users.
      - _Optionally_, create a message status system (e.g., sent, delivered).
      - _Optionally_, add a basic notification service for new messages.
    - **Data Management:**
      - **Design Message System:**
        - Create a message schema in your database (e.g., `Message` table with fields like `sender_id`, `recipient_id`, `content`, `timestamp`).
        - Consider a `Conversation` table to group messages.
        - Implement message queries to retrieve messages for specific conversations or users.
        - Set up basic message indexing for efficient retrieval.
        - _Optionally_, add message search functionality.
        - _Optionally_, implement message deletion and archiving capabilities.

4.  **Run the Application**

    ```bash
    # Start the backend server (in one terminal)
    cd backend
    flask run

    # Start the frontend development server (in another terminal)
    cd frontend
    npm run dev
    ```

    The application will be available at:

    - Frontend: `http://localhost:3000/messages`
    - Backend API: `http://localhost:5000`

5.  **Testing**

    - Test WebSocket connections between frontend and backend.
    - Test basic message delivery system (sending and receiving messages).
    - Test persistence of messages in the database.
    - Test real-time features (if implemented, e.g., typing indicators).
    - Test error handling for failed message sends or WebSocket disconnections.
    - Conduct basic performance tests for message handling.

## 🔄 Git Workflow

1.  **Develop and Save Your Progress**

    ```bash
    git add .
    git commit -m "Day 14: Implement messaging backend with WebSocket support"
    ```

2.  **Push Your Changes to Your Repository**

    ```bash
    git push -u origin day-14-messaging-backend
    ```

3.  **Merge After Completion**

    ```bash
    git checkout master
    git pull origin master
    git merge day-14-messaging-backend
    git push origin master
    ```

## ✅ Deliverable

A robust messaging backend system with:

- Working WebSocket server.
- Complete message handling.
- Basic real-time features (as per tutorial scope, real-time not fully required).
- Data persistence for messages.
- Error handling.
- Clean, documented code.
- All tests passing.
