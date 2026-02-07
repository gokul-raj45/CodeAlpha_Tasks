const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

const JWT_SECRET = 'your-secret-key-change-in-production';

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'public', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'post-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: function (req, file, cb) {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  }
});

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// Initialize database
const db = new sqlite3.Database('./socialmedia.db', (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to SQLite database');
    initializeDatabase();
  }
});

// Initialize database tables
function initializeDatabase() {
  db.serialize(() => {
    // Users table
    db.run(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      full_name TEXT,
      bio TEXT,
      profile_picture TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Add profile_picture column to existing users table if it doesn't exist
    db.run(`ALTER TABLE users ADD COLUMN profile_picture TEXT`, (err) => {
      // Ignore error if column already exists
    });

    // Posts table
    db.run(`CREATE TABLE IF NOT EXISTS posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      content TEXT NOT NULL,
      image_url TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )`);

    // Comments table
    db.run(`CREATE TABLE IF NOT EXISTS comments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      post_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      content TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )`);

    // Likes table
    db.run(`CREATE TABLE IF NOT EXISTS likes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      post_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(post_id, user_id),
      FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )`);

    // Follows table
    db.run(`CREATE TABLE IF NOT EXISTS follows (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      follower_id INTEGER NOT NULL,
      following_id INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(follower_id, following_id),
      FOREIGN KEY (follower_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (following_id) REFERENCES users(id) ON DELETE CASCADE
    )`);

    // Shares table
    db.run(`CREATE TABLE IF NOT EXISTS shares (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      post_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(post_id, user_id),
      FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )`);

    // Add image_url column to existing posts table if it doesn't exist
    db.run(`ALTER TABLE posts ADD COLUMN image_url TEXT`, (err) => {
      // Ignore error if column already exists
    });

    console.log('Database tables initialized');
  });
}

// Middleware to verify JWT token
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
}

// ===== AUTHENTICATION ROUTES =====

// Register
app.post('/api/register', async (req, res) => {
  const { username, email, password, full_name } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ error: 'Username, email, and password are required' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    
    db.run(
      'INSERT INTO users (username, email, password, full_name) VALUES (?, ?, ?, ?)',
      [username, email, hashedPassword, full_name || username],
      function(err) {
        if (err) {
          if (err.message.includes('UNIQUE constraint')) {
            return res.status(400).json({ error: 'Username or email already exists' });
          }
          return res.status(500).json({ error: 'Error creating user' });
        }

        const token = jwt.sign({ id: this.lastID, username }, JWT_SECRET);
        res.json({ token, user: { id: this.lastID, username, email, full_name: full_name || username } });
      }
    );
  } catch (error) {
    res.status(500).json({ error: 'Error processing request' });
  }
});

// Login
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  db.get('SELECT * FROM users WHERE username = ? OR email = ?', [username, username], async (err, user) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET);
    res.json({ 
      token, 
      user: { 
        id: user.id, 
        username: user.username, 
        email: user.email, 
        full_name: user.full_name || user.username,
        bio: user.bio 
      } 
    });
  });
});

// Get current user
app.get('/api/me', authenticateToken, (req, res) => {
  db.get('SELECT id, username, email, full_name, bio, profile_picture FROM users WHERE id = ?', [req.user.id], (err, user) => {
    if (err || !user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ user });
  });
});

// Search users
app.get('/api/users/search', authenticateToken, (req, res) => {
  const searchQuery = req.query.q || '';
  
  if (!searchQuery || searchQuery.trim().length < 2) {
    return res.json({ users: [] });
  }

  const query = `%${searchQuery}%`;
  
  db.all(
    `SELECT id, username, full_name, email, bio, profile_picture,
     (SELECT COUNT(*) FROM follows WHERE follower_id = ? AND following_id = users.id) as is_following
     FROM users
     WHERE username LIKE ? OR full_name LIKE ? OR email LIKE ?
     AND id != ?
     LIMIT 20`,
    [req.user.id, query, query, query, req.user.id],
    (err, users) => {
      if (err) {
        return res.status(500).json({ error: 'Error searching users' });
      }
      res.json({ users });
    }
  );
});

// ===== USER PROFILE ROUTES =====

// Get user profile
app.get('/api/users/:id', authenticateToken, (req, res) => {
  const userId = parseInt(req.params.id);

  db.get(
    `SELECT id, username, full_name, bio, profile_picture, created_at,
     (SELECT COUNT(*) FROM posts WHERE user_id = ?) as post_count,
     (SELECT COUNT(*) FROM follows WHERE follower_id = ?) as following_count,
     (SELECT COUNT(*) FROM follows WHERE following_id = ?) as followers_count
     FROM users WHERE id = ?`,
    [userId, userId, userId, userId],
    (err, user) => {
      if (err || !user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Check if current user follows this user
      db.get(
        'SELECT COUNT(*) as is_following FROM follows WHERE follower_id = ? AND following_id = ?',
        [req.user.id, userId],
        (err, follow) => {
          user.is_following = follow.is_following > 0;
          res.json({ user });
        }
      );
    }
  );
});

// Update profile
app.put('/api/users/:id', authenticateToken, (req, res) => {
  const userId = parseInt(req.params.id);

  if (req.user.id !== userId) {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  const { full_name, bio } = req.body;

  db.run(
    'UPDATE users SET full_name = ?, bio = ? WHERE id = ?',
    [full_name, bio, userId],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Error updating profile' });
      }
      res.json({ message: 'Profile updated successfully' });
    }
  );
});

// ===== POST ROUTES =====

// Upload image for post
app.post('/api/posts/upload-image', authenticateToken, upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No image file provided' });
  }
  res.json({ imageUrl: `/uploads/${req.file.filename}` });
});

// Upload profile picture
app.post('/api/users/upload-profile-picture', authenticateToken, upload.single('profile_picture'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No image file provided' });
  }
  
  const profilePictureUrl = `/uploads/${req.file.filename}`;
  
  // Update user's profile picture
  db.run(
    'UPDATE users SET profile_picture = ? WHERE id = ?',
    [profilePictureUrl, req.user.id],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Error updating profile picture' });
      }
      res.json({ profilePictureUrl });
    }
  );
});

// Create post
app.post('/api/posts', authenticateToken, (req, res) => {
  const { content, image_url } = req.body;

  if (!content || content.trim() === '') {
    return res.status(400).json({ error: 'Post content is required' });
  }

  db.run(
    'INSERT INTO posts (user_id, content, image_url) VALUES (?, ?, ?)',
    [req.user.id, content, image_url || null],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Error creating post' });
      }
      res.json({ message: 'Post created successfully', post_id: this.lastID });
    }
  );
});

// Get all posts (feed)
app.get('/api/posts', authenticateToken, (req, res) => {
  db.all(
    `SELECT p.*, u.username, u.full_name, u.bio, u.profile_picture,
     (SELECT COUNT(*) FROM likes WHERE post_id = p.id) as like_count,
     (SELECT COUNT(*) FROM likes WHERE post_id = p.id AND user_id = ?) as is_liked,
     (SELECT COUNT(*) FROM comments WHERE post_id = p.id) as comment_count,
     (SELECT COUNT(*) FROM shares WHERE post_id = p.id) as share_count
     FROM posts p
     JOIN users u ON p.user_id = u.id
     ORDER BY p.created_at DESC`,
    [req.user.id],
    (err, posts) => {
      if (err) {
        return res.status(500).json({ error: 'Error fetching posts' });
      }
      res.json({ posts });
    }
  );
});

// Get posts by user
app.get('/api/users/:id/posts', authenticateToken, (req, res) => {
  const userId = parseInt(req.params.id);

  db.all(
    `SELECT p.*, u.username, u.full_name, u.bio, u.profile_picture,
     (SELECT COUNT(*) FROM likes WHERE post_id = p.id) as like_count,
     (SELECT COUNT(*) FROM likes WHERE post_id = p.id AND user_id = ?) as is_liked,
     (SELECT COUNT(*) FROM comments WHERE post_id = p.id) as comment_count,
     (SELECT COUNT(*) FROM shares WHERE post_id = p.id) as share_count
     FROM posts p
     JOIN users u ON p.user_id = u.id
     WHERE p.user_id = ?
     ORDER BY p.created_at DESC`,
    [req.user.id, userId],
    (err, posts) => {
      if (err) {
        return res.status(500).json({ error: 'Error fetching posts' });
      }
      res.json({ posts });
    }
  );
});

// Delete post
app.delete('/api/posts/:id', authenticateToken, (req, res) => {
  const postId = parseInt(req.params.id);

  db.get('SELECT user_id FROM posts WHERE id = ?', [postId], (err, post) => {
    if (err || !post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    if (post.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    db.run('DELETE FROM posts WHERE id = ?', [postId], (err) => {
      if (err) {
        return res.status(500).json({ error: 'Error deleting post' });
      }
      res.json({ message: 'Post deleted successfully' });
    });
  });
});

// ===== COMMENT ROUTES =====

// Create comment
app.post('/api/posts/:id/comments', authenticateToken, (req, res) => {
  const postId = parseInt(req.params.id);
  const { content } = req.body;

  if (!content || content.trim() === '') {
    return res.status(400).json({ error: 'Comment content is required' });
  }

  db.run(
    'INSERT INTO comments (post_id, user_id, content) VALUES (?, ?, ?)',
    [postId, req.user.id, content],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Error creating comment' });
      }
      res.json({ message: 'Comment created successfully', comment_id: this.lastID });
    }
  );
});

// Get comments for a post
app.get('/api/posts/:id/comments', authenticateToken, (req, res) => {
  const postId = parseInt(req.params.id);

  db.all(
    `SELECT c.*, u.username, u.full_name
     FROM comments c
     JOIN users u ON c.user_id = u.id
     WHERE c.post_id = ?
     ORDER BY c.created_at ASC`,
    [postId],
    (err, comments) => {
      if (err) {
        return res.status(500).json({ error: 'Error fetching comments' });
      }
      res.json({ comments });
    }
  );
});

// ===== LIKE ROUTES =====

// Toggle like on post
app.post('/api/posts/:id/like', authenticateToken, (req, res) => {
  const postId = parseInt(req.params.id);

  db.get('SELECT * FROM likes WHERE post_id = ? AND user_id = ?', [postId, req.user.id], (err, like) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    if (like) {
      // Unlike
      db.run('DELETE FROM likes WHERE post_id = ? AND user_id = ?', [postId, req.user.id], (err) => {
        if (err) {
          return res.status(500).json({ error: 'Error unliking post' });
        }
        res.json({ message: 'Post unliked', liked: false });
      });
    } else {
      // Like
      db.run('INSERT INTO likes (post_id, user_id) VALUES (?, ?)', [postId, req.user.id], (err) => {
        if (err) {
          return res.status(500).json({ error: 'Error liking post' });
        }
        res.json({ message: 'Post liked', liked: true });
      });
    }
  });
});

// ===== FOLLOW ROUTES =====

// Follow/Unfollow user
app.post('/api/users/:id/follow', authenticateToken, (req, res) => {
  const followingId = parseInt(req.params.id);

  if (req.user.id === followingId) {
    return res.status(400).json({ error: 'Cannot follow yourself' });
  }

  db.get('SELECT * FROM follows WHERE follower_id = ? AND following_id = ?', [req.user.id, followingId], (err, follow) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    if (follow) {
      // Unfollow
      db.run('DELETE FROM follows WHERE follower_id = ? AND following_id = ?', [req.user.id, followingId], (err) => {
        if (err) {
          return res.status(500).json({ error: 'Error unfollowing user' });
        }
        res.json({ message: 'User unfollowed', following: false });
      });
    } else {
      // Follow
      db.run('INSERT INTO follows (follower_id, following_id) VALUES (?, ?)', [req.user.id, followingId], (err) => {
        if (err) {
          return res.status(500).json({ error: 'Error following user' });
        }
        res.json({ message: 'User followed', following: true });
      });
    }
  });
});

// Get feed (posts from followed users)
app.get('/api/feed', authenticateToken, (req, res) => {
  db.all(
    `SELECT p.*, u.username, u.full_name, u.bio, u.profile_picture,
     (SELECT COUNT(*) FROM likes WHERE post_id = p.id) as like_count,
     (SELECT COUNT(*) FROM likes WHERE post_id = p.id AND user_id = ?) as is_liked,
     (SELECT COUNT(*) FROM comments WHERE post_id = p.id) as comment_count,
     (SELECT COUNT(*) FROM shares WHERE post_id = p.id) as share_count
     FROM posts p
     JOIN users u ON p.user_id = u.id
     WHERE p.user_id IN (SELECT following_id FROM follows WHERE follower_id = ?)
     OR p.user_id = ?
     ORDER BY p.created_at DESC`,
    [req.user.id, req.user.id, req.user.id],
    (err, posts) => {
      if (err) {
        return res.status(500).json({ error: 'Error fetching feed' });
      }
      res.json({ posts });
    }
  );
});

// Share post
app.post('/api/posts/:id/share', authenticateToken, (req, res) => {
  const postId = parseInt(req.params.id);

  db.get('SELECT * FROM shares WHERE post_id = ? AND user_id = ?', [postId, req.user.id], (err, share) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    if (share) {
      // Unshare
      db.run('DELETE FROM shares WHERE post_id = ? AND user_id = ?', [postId, req.user.id], (err) => {
        if (err) {
          return res.status(500).json({ error: 'Error unsharing post' });
        }
        res.json({ message: 'Post unshared', shared: false });
      });
    } else {
      // Share
      db.run('INSERT INTO shares (post_id, user_id) VALUES (?, ?)', [postId, req.user.id], (err) => {
        if (err) {
          return res.status(500).json({ error: 'Error sharing post' });
        }
        res.json({ message: 'Post shared', shared: true });
      });
    }
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
