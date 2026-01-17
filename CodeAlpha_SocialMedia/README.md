# Social Media Platform

A mini social media application built with Express.js backend and vanilla HTML/CSS/JavaScript frontend.

## Features

- ✅ User authentication (Register/Login)
- ✅ User profiles with bio and statistics
- ✅ Create and delete posts
- ✅ Like/unlike posts
- ✅ Comment on posts
- ✅ Follow/unfollow users
- ✅ Feed showing all posts or posts from followed users
- ✅ Modern, responsive UI

## Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: SQLite
- **Authentication**: JWT (JSON Web Tokens)
- **Frontend**: HTML, CSS, JavaScript (Vanilla)

## Setup Instructions

1. **Install Dependencies**
   ```bash
   cd social-media-app
   npm install
   ```

2. **Start the Server**
   ```bash
   npm start
   ```
   Or for development with auto-reload:
   ```bash
   npm run dev
   ```

3. **Access the Application**
   - Open your browser and navigate to: `http://localhost:3000`
   - The app will automatically redirect to `index.html` for login/registration

## Project Structure

```
social-media-app/
├── server.js              # Express.js server and API routes
├── package.json           # Dependencies and scripts
├── socialmedia.db         # SQLite database (created automatically)
└── public/                # Frontend files
    ├── index.html         # Login/Register page
    ├── feed.html          # Main feed page
    ├── profile.html       # User profile page
    ├── styles.css         # All styling
    └── app.js             # Frontend JavaScript logic
```

## API Endpoints

### Authentication
- `POST /api/register` - Register new user
- `POST /api/login` - Login user
- `GET /api/me` - Get current user

### Users
- `GET /api/users/:id` - Get user profile
- `PUT /api/users/:id` - Update user profile
- `POST /api/users/:id/follow` - Follow/unfollow user

### Posts
- `POST /api/posts` - Create post
- `GET /api/posts` - Get all posts
- `GET /api/users/:id/posts` - Get user's posts
- `DELETE /api/posts/:id` - Delete post
- `POST /api/posts/:id/like` - Like/unlike post

### Comments
- `POST /api/posts/:id/comments` - Create comment
- `GET /api/posts/:id/comments` - Get post comments

### Feed
- `GET /api/feed` - Get posts from followed users

## Database Schema

- **users**: id, username, email, password, full_name, bio, created_at
- **posts**: id, user_id, content, created_at
- **comments**: id, post_id, user_id, content, created_at
- **likes**: id, post_id, user_id, created_at
- **follows**: id, follower_id, following_id, created_at

## Notes

- Passwords are hashed using bcryptjs
- JWT tokens are stored in localStorage
- The database is created automatically on first run
- Default JWT secret should be changed in production
