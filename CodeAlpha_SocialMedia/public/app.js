// API Base URL
const API_BASE = 'https://codealpha-tasks-f8j1.onrender.com/api';


// Token Management
function getToken() {
    return localStorage.getItem('token');
}

function setToken(token) {
    localStorage.setItem('token', token);
}

function removeToken() {
    localStorage.removeItem('token');
}

function getAuthHeaders() {
    const token = getToken();
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
}

// Authentication Functions
function showLogin() {
    document.getElementById('loginForm').classList.add('active');
    document.getElementById('registerForm').classList.remove('active');
    document.querySelectorAll('.tab-btn')[0].classList.add('active');
    document.querySelectorAll('.tab-btn')[1].classList.remove('active');
    document.getElementById('authMessage').textContent = '';
}

function showRegister() {
    document.getElementById('loginForm').classList.remove('active');
    document.getElementById('registerForm').classList.add('active');
    document.querySelectorAll('.tab-btn')[0].classList.remove('active');
    document.querySelectorAll('.tab-btn')[1].classList.add('active');
    document.getElementById('authMessage').textContent = '';
}

// Handle Login
if (document.getElementById('loginForm')) {
    document.getElementById('loginForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('loginUsername').value;
        const password = document.getElementById('loginPassword').value;
        const messageEl = document.getElementById('authMessage');

        try {
            const response = await fetch(`${API_BASE}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();

            if (response.ok) {
                setToken(data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                window.location.href = 'feed.html';
            } else {
                messageEl.textContent = data.error || 'Login failed';
                messageEl.className = 'message error';
            }
        } catch (error) {
            messageEl.textContent = 'Error connecting to server';
            messageEl.className = 'message error';
        }
    });
}

// Handle Register
if (document.getElementById('registerForm')) {
    document.getElementById('registerForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('regUsername').value;
        const email = document.getElementById('regEmail').value;
        const full_name = document.getElementById('regFullName').value;
        const password = document.getElementById('regPassword').value;
        const messageEl = document.getElementById('authMessage');

        try {
            const response = await fetch(`${API_BASE}/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, email, password, full_name })
            });

            const data = await response.json();

            if (response.ok) {
                setToken(data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                window.location.href = 'feed.html';
            } else {
                messageEl.textContent = data.error || 'Registration failed';
                messageEl.className = 'message error';
            }
        } catch (error) {
            messageEl.textContent = 'Error connecting to server';
            messageEl.className = 'message error';
        }
    });
}

// Check Authentication
function checkAuth() {
    const token = getToken();
    const currentPath = window.location.pathname;

    if (!token && currentPath.includes('feed.html') || !token && currentPath.includes('profile.html')) {
        window.location.href = 'index.html';
    } else if (token && currentPath.includes('index.html')) {
        window.location.href = 'feed.html';
    }
}

// Logout
function logout() {
    removeToken();
    localStorage.removeItem('user');
    window.location.href = 'index.html';
}

// Load Current User
async function loadCurrentUser() {
    try {
        const response = await fetch(`${API_BASE}/me`, {
            headers: getAuthHeaders()
        });
        
        if (response.ok) {
            const data = await response.json();
            const user = data.user;
            localStorage.setItem('user', JSON.stringify(user));
            
            if (document.getElementById('currentUsername')) {
                document.getElementById('currentUsername').textContent = user.full_name || user.username || 'User';
            }
            if (document.getElementById('currentUserEmail')) {
                document.getElementById('currentUserEmail').textContent = user.email || '';
            }
            if (document.getElementById('createPostAvatar')) {
                const avatarEl = document.getElementById('createPostAvatar');
                if (user.profile_picture) {
                    let img = avatarEl.querySelector('img');
                    if (!img) {
                        img = document.createElement('img');
                        avatarEl.appendChild(img);
                    }
                    img.src = user.profile_picture;
                    img.alt = 'Profile';
                    img.style.display = 'block';
                    const span = avatarEl.querySelector('span');
                    if (span) span.style.display = 'none';
                } else {
                    const initial = (user.full_name || user.username || 'U')[0].toUpperCase();
                    const span = avatarEl.querySelector('span');
                    if (span) {
                        span.textContent = initial;
                        span.style.display = 'flex';
                    } else {
                        avatarEl.textContent = initial;
                    }
                    const img = avatarEl.querySelector('img');
                    if (img) img.style.display = 'none';
                }
            }
        } else {
            // Fallback to localStorage
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            if (document.getElementById('currentUsername')) {
                document.getElementById('currentUsername').textContent = user.full_name || user.username || 'User';
            }
            if (document.getElementById('currentUserEmail')) {
                document.getElementById('currentUserEmail').textContent = user.email || '';
            }
            if (document.getElementById('createPostAvatar')) {
                const avatarEl = document.getElementById('createPostAvatar');
                const initial = (user.full_name || user.username || 'U')[0].toUpperCase();
                const span = avatarEl.querySelector('span');
                if (span) {
                    span.textContent = initial;
                    span.style.display = 'flex';
                } else {
                    avatarEl.textContent = initial;
                }
                const img = avatarEl.querySelector('img');
                if (img) img.style.display = 'none';
            }
        }
    } catch (error) {
        // Fallback to localStorage
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        if (document.getElementById('currentUsername')) {
            document.getElementById('currentUsername').textContent = user.full_name || user.username || 'User';
        }
        if (document.getElementById('currentUserEmail')) {
            document.getElementById('currentUserEmail').textContent = user.email || '';
        }
        if (document.getElementById('createPostAvatar')) {
            const initial = (user.full_name || user.username || 'U')[0].toUpperCase();
            document.getElementById('createPostAvatar').textContent = initial;
        }
    }
}

// Search Users
let searchTimeout;
async function searchUsers(query) {
    if (!query || query.trim().length < 2) {
        document.getElementById('searchResults').innerHTML = '';
        document.getElementById('searchResults').style.display = 'none';
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/users/search?q=${encodeURIComponent(query)}`, {
            headers: getAuthHeaders()
        });

        const data = await response.json();

        if (response.ok) {
            displaySearchResults(data.users || []);
        }
    } catch (error) {
        console.error('Error searching users:', error);
    }
}

function displaySearchResults(users) {
    const resultsContainer = document.getElementById('searchResults');
    if (!resultsContainer) return;

    if (users.length === 0) {
        resultsContainer.innerHTML = '<div class="search-result-item">No users found</div>';
        resultsContainer.style.display = 'block';
        return;
    }

    resultsContainer.innerHTML = users.map(user => {
        const initial = (user.full_name || user.username || 'U')[0].toUpperCase();
        return `
            <div class="search-result-item" onclick="viewUserProfile(${user.id})">
                <div class="search-result-avatar">
                    ${user.profile_picture ? `<img src="${user.profile_picture}" alt="${user.full_name || user.username}">` : `<span>${initial}</span>`}
                </div>
                <div class="search-result-info">
                    <div class="search-result-name">${user.full_name || user.username}</div>
                    ${user.bio ? `<div class="search-result-bio">${escapeHtml(user.bio)}</div>` : ''}
                </div>
                ${user.is_following ? '<span class="search-following-badge">Following</span>' : ''}
            </div>
        `;
    }).join('');

    resultsContainer.style.display = 'block';
}

// Initialize search
if (document.getElementById('searchInput')) {
    document.getElementById('searchInput').addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            searchUsers(e.target.value);
        }, 300);
    });

    // Hide search results when clicking outside
    document.addEventListener('click', (e) => {
        const searchContainer = document.querySelector('.search-container');
        const searchResults = document.getElementById('searchResults');
        if (searchContainer && searchResults && !searchContainer.contains(e.target)) {
            searchResults.style.display = 'none';
        }
    });
}

// Load Feed
async function loadFeed(type = 'all') {
    const container = document.getElementById('postsContainer');
    if (!container) return;

    container.innerHTML = '<div class="loading">Loading posts...</div>';

    try {
        const endpoint = type === 'following' ? '/feed' : '/posts';
        const response = await fetch(`${API_BASE}${endpoint}`, {
            headers: getAuthHeaders()
        });

        const data = await response.json();

        if (response.ok) {
            displayPosts(data.posts || []);
        } else {
            container.innerHTML = `<div class="empty-state">Error loading posts: ${data.error}</div>`;
        }
    } catch (error) {
        container.innerHTML = '<div class="empty-state">Error connecting to server</div>';
    }
}

// Display Posts
function displayPosts(posts) {
    const container = document.getElementById('postsContainer') || document.getElementById('userPostsContainer');
    if (!container) return;

    if (posts.length === 0) {
        container.innerHTML = '<div class="empty-state">No posts found. Be the first to post!</div>';
        return;
    }

    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    const userInitial = (currentUser.full_name || currentUser.username || 'U')[0].toUpperCase();

    container.innerHTML = posts.map((post, index) => {
        const authorInitial = (post.full_name || post.username || 'U')[0].toUpperCase();
        const profilePic = post.profile_picture || null;
        return `
        <div class="post-card" data-post-id="${post.id}" style="animation-delay: ${index * 0.1}s;">
            <div class="post-header">
                <div class="post-author">
                    <div class="post-author-avatar" onclick="viewUserProfile(${post.user_id})">
                        ${profilePic ? `<img src="${profilePic}" alt="${post.full_name || post.username}">` : `<span>${authorInitial}</span>`}
                    </div>
                    <div class="post-author-info">
                        <span class="post-author-name" onclick="viewUserProfile(${post.user_id})">${post.full_name || post.username}</span>
                        <span class="post-time">${formatTime(post.created_at)}</span>
                        ${post.bio ? `<span class="post-bio">${escapeHtml(post.bio)}</span>` : ''}
                    </div>
                </div>
                ${post.user_id === currentUser.id ? 
                    `<button class="delete-btn" onclick="deletePost(${post.id})" title="Delete post">&times;</button>` : ''}
            </div>
            <div class="post-body">
                ${post.content && post.content.trim() !== ' ' ? `<div class="post-content">${escapeHtml(post.content)}</div>` : ''}
                ${post.image_url ? `<div class="post-image-container"><img src="${post.image_url}" alt="Post image" class="post-image" onclick="openImageModal('${post.image_url}')"></div>` : ''}
            </div>
            <div class="post-engagement">
                ${post.like_count > 0 ? `<div class="engagement-stats">
                    <span class="like-count">👍 ${post.like_count}</span>
                    ${post.comment_count > 0 ? `<span class="comment-count">${post.comment_count} comments</span>` : ''}
                    ${post.share_count > 0 ? `<span class="share-count">${post.share_count} shares</span>` : ''}
                </div>` : ''}
            </div>
            <div class="post-actions">
                <button class="post-action ${post.is_liked ? 'liked' : ''}" onclick="toggleLike(${post.id})">
                    <span class="action-icon">👍</span>
                    <span class="action-text">Like</span>
                    ${post.like_count > 0 ? `<span class="action-count">${post.like_count}</span>` : ''}
                </button>
                <button class="post-action" onclick="showComments(${post.id})">
                    <span class="action-icon">💬</span>
                    <span class="action-text">Comment</span>
                    ${post.comment_count > 0 ? `<span class="action-count">${post.comment_count}</span>` : ''}
                </button>
                <button class="post-action" onclick="sharePost(${post.id})">
                    <span class="action-icon">🔗</span>
                    <span class="action-text">Share</span>
                    ${post.share_count > 0 ? `<span class="action-count">${post.share_count}</span>` : ''}
                </button>
            </div>
        </div>
    `}).join('');
}

// Format Time
function formatTime(dateString) {
    if (!dateString) return 'Just now';
    
    const date = new Date(dateString);
    const now = new Date();
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
        return 'Just now';
    }
    
    const diffMs = now - date;
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    const diffWeeks = Math.floor(diffDays / 7);
    const diffMonths = Math.floor(diffDays / 30);
    const diffYears = Math.floor(diffDays / 365);

    if (diffSecs < 10) return 'Just now';
    if (diffSecs < 60) return `${diffSecs}s ago`;
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    if (diffWeeks < 4) return `${diffWeeks}w ago`;
    if (diffMonths < 12) return `${diffMonths}mo ago`;
    if (diffYears < 1) return `${diffMonths}mo ago`;
    return `${diffYears}y ago`;
}

// Escape HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML.replace(/\n/g, '<br>');
}

// Image upload handling
if (document.getElementById('postImage')) {
    document.getElementById('postImage').addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const submitBtn = document.getElementById('submitPostBtn');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Uploading...';

        try {
            const formData = new FormData();
            formData.append('image', file);

            const response = await fetch(`${API_BASE}/posts/upload-image`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${getToken()}`
                },
                body: formData
            });

            const data = await response.json();

            if (response.ok) {
                document.getElementById('previewImage').src = data.imageUrl;
                document.getElementById('imagePreview').style.display = 'block';
                document.getElementById('postImage').dataset.imageUrl = data.imageUrl;
            } else {
                alert(data.error || 'Error uploading image');
            }
        } catch (error) {
            alert('Error uploading image');
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Post';
        }
    });
}

// Remove image preview
function removeImagePreview() {
    document.getElementById('imagePreview').style.display = 'none';
    document.getElementById('previewImage').src = '';
    document.getElementById('postImage').value = '';
    delete document.getElementById('postImage').dataset.imageUrl;
}

// Create Post
if (document.getElementById('createPostForm')) {
    document.getElementById('createPostForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const content = document.getElementById('postContent').value.trim();
        const imageUrl = document.getElementById('postImage').dataset.imageUrl || null;
        const submitBtn = document.getElementById('submitPostBtn');

        if (!content && !imageUrl) {
            alert('Please add some content or an image');
            return;
        }

        submitBtn.disabled = true;
        submitBtn.textContent = 'Posting...';

        try {
            const response = await fetch(`${API_BASE}/posts`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getToken()}`
                },
                body: JSON.stringify({ content: content || ' ', image_url: imageUrl })
            });

            const data = await response.json();

            if (response.ok) {
                document.getElementById('postContent').value = '';
                removeImagePreview();
                loadFeed('all');
            } else {
                alert(data.error || 'Error creating post');
            }
        } catch (error) {
            alert('Error connecting to server');
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Post';
        }
    });
}

// Toggle Like
async function toggleLike(postId) {
    try {
        const response = await fetch(`${API_BASE}/posts/${postId}/like`, {
            method: 'POST',
            headers: getAuthHeaders()
        });

        const data = await response.json();

        if (response.ok) {
            // Reload the feed to update like counts
            const activeTab = document.querySelector('.feed-tabs .tab-btn.active');
            if (activeTab) {
                const type = activeTab.textContent === 'Following' ? 'following' : 'all';
                loadFeed(type);
            } else {
                loadFeed('all');
            }
        } else {
            alert(data.error || 'Error liking post');
        }
    } catch (error) {
        alert('Error connecting to server');
    }
}

// Share Post
async function sharePost(postId) {
    try {
        const response = await fetch(`${API_BASE}/posts/${postId}/share`, {
            method: 'POST',
            headers: getAuthHeaders()
        });

        const data = await response.json();

        if (response.ok) {
            // Reload the feed to update share counts
            const activeTab = document.querySelector('.feed-tabs .tab-btn.active');
            if (activeTab) {
                const type = activeTab.textContent === 'Following' ? 'following' : 'all';
                loadFeed(type);
            } else {
                loadFeed('all');
            }
        } else {
            alert(data.error || 'Error sharing post');
        }
    } catch (error) {
        alert('Error connecting to server');
    }
}

// Open Image Modal
function openImageModal(imageUrl) {
    const modal = document.createElement('div');
    modal.className = 'image-modal';
    modal.innerHTML = `
        <div class="image-modal-content">
            <span class="image-modal-close" onclick="this.closest('.image-modal').remove()">&times;</span>
            <img src="${imageUrl}" alt="Full size image">
        </div>
    `;
    document.body.appendChild(modal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });
}

// Delete Post
async function deletePost(postId) {
    if (!confirm('Are you sure you want to delete this post?')) return;

    try {
        const response = await fetch(`${API_BASE}/posts/${postId}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });

        const data = await response.json();

        if (response.ok) {
            const postElement = document.querySelector(`[data-post-id="${postId}"]`);
            if (postElement) {
                postElement.style.animation = 'fadeOut 0.3s ease-out';
                setTimeout(() => {
                    postElement.remove();
                }, 300);
            }
        } else {
            alert(data.error || 'Error deleting post');
        }
    } catch (error) {
        alert('Error connecting to server');
    }
}

// Comments
let currentPostId = null;

function showComments(postId) {
    currentPostId = postId;
    const modal = document.getElementById('commentModal');
    if (modal) {
        modal.classList.add('show');
        modal.style.display = 'block';
        loadComments(postId);
    }
}

function closeCommentModal() {
    const modal = document.getElementById('commentModal');
    if (modal) {
        modal.classList.remove('show');
        setTimeout(() => {
            modal.style.display = 'none';
        }, 300);
        currentPostId = null;
    }
}

async function loadComments(postId) {
    const container = document.getElementById('commentsList');
    if (!container) return;

    container.innerHTML = '<div class="loading">Loading comments...</div>';

    try {
        const response = await fetch(`${API_BASE}/posts/${postId}/comments`, {
            headers: getAuthHeaders()
        });

        const data = await response.json();

        if (response.ok) {
            const comments = data.comments || [];
            if (comments.length === 0) {
                container.innerHTML = '<div class="empty-state">No comments yet</div>';
            } else {
                container.innerHTML = comments.map((comment, index) => `
                    <div class="comment-item" style="animation-delay: ${index * 0.1}s;">
                        <div class="comment-header">
                            <span class="comment-author">${comment.full_name || comment.username}</span>
                            <span class="comment-time">${formatTime(comment.created_at)}</span>
                        </div>
                        <div class="comment-content">${escapeHtml(comment.content)}</div>
                    </div>
                `).join('');
            }
        } else {
            container.innerHTML = `<div class="empty-state">Error loading comments</div>`;
        }
    } catch (error) {
        container.innerHTML = '<div class="empty-state">Error connecting to server</div>';
    }
}

// Comment Form
if (document.getElementById('commentForm')) {
    document.getElementById('commentForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!currentPostId) return;

        const content = document.getElementById('commentContent').value;
        const submitBtn = e.target.querySelector('button[type="submit"]');

        submitBtn.disabled = true;
        submitBtn.textContent = 'Posting...';

        try {
            const response = await fetch(`${API_BASE}/posts/${currentPostId}/comments`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify({ content })
            });

            const data = await response.json();

            if (response.ok) {
                document.getElementById('commentContent').value = '';
                loadComments(currentPostId);
                // Reload feed to update comment counts
                const activeTab = document.querySelector('.feed-tabs .tab-btn.active');
                if (activeTab) {
                    const type = activeTab.textContent === 'Following' ? 'following' : 'all';
                    loadFeed(type);
                }
            } else {
                alert(data.error || 'Error posting comment');
            }
        } catch (error) {
            alert('Error connecting to server');
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Post Comment';
        }
    });
}

// Close modal when clicking outside
window.onclick = function(event) {
    const commentModal = document.getElementById('commentModal');
    const editModal = document.getElementById('editModal');
    if (event.target === commentModal) {
        closeCommentModal();
    }
    if (event.target === editModal) {
        closeEditModal();
    }
}

// Add smooth scroll behavior
document.documentElement.style.scrollBehavior = 'smooth';

// Profile Functions
function viewProfile() {
    window.location.href = 'profile.html';
}

function viewUserProfile(userId) {
    window.location.href = `profile.html?id=${userId}`;
}

async function loadCurrentUserProfile() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.id) {
        await loadProfile(user.id, true);
    }
}

async function loadProfile(userId, isOwn = false) {
    isOwnProfile = isOwn;
    
    try {
        const response = await fetch(`${API_BASE}/users/${userId}`, {
            headers: getAuthHeaders()
        });

        const data = await response.json();

        if (response.ok) {
            const user = data.user;
            document.getElementById('profileName').textContent = user.full_name || user.username;
            document.getElementById('profileBio').textContent = user.bio || 'No bio yet';
            
            // Update profile avatar
            const profileAvatarContainer = document.getElementById('profileAvatarContainer');
            const profileInitial = document.getElementById('profileInitial');
            if (user.profile_picture) {
                if (profileInitial) profileInitial.style.display = 'none';
                if (profileAvatarContainer) {
                    let img = profileAvatarContainer.querySelector('img');
                    if (!img) {
                        img = document.createElement('img');
                        profileAvatarContainer.appendChild(img);
                    }
                    img.src = user.profile_picture;
                    img.alt = user.full_name || user.username;
                    img.style.display = 'block';
                }
            } else {
                if (profileInitial) {
                    profileInitial.style.display = 'flex';
                    profileInitial.textContent = (user.full_name || user.username || 'U')[0].toUpperCase();
                }
                const img = profileAvatarContainer?.querySelector('img');
                if (img) img.style.display = 'none';
            }
            
            document.getElementById('postCount').textContent = user.post_count || 0;
            document.getElementById('followersCount').textContent = user.followers_count || 0;
            document.getElementById('followingCount').textContent = user.following_count || 0;

            // Show/hide buttons
            const followBtn = document.getElementById('followBtn');
            const editBtn = document.getElementById('editProfileBtn');
            const profilePictureInput = document.getElementById('profilePictureInput');
            
            if (isOwn) {
                if (followBtn) followBtn.style.display = 'none';
                if (editBtn) editBtn.style.display = 'inline-block';
                if (profilePictureInput) {
                    profileAvatarContainer.style.cursor = 'pointer';
                    profileAvatarContainer.onclick = () => profilePictureInput.click();
                }
            } else {
                if (followBtn) {
                    followBtn.style.display = 'inline-block';
                    followBtn.textContent = user.is_following ? 'Unfollow' : 'Follow';
                }
                if (editBtn) editBtn.style.display = 'none';
                if (profilePictureInput) profilePictureInput.style.display = 'none';
            }

            // Load user posts
            loadUserPosts(userId);
        } else {
            alert(data.error || 'Error loading profile');
        }
    } catch (error) {
        alert('Error connecting to server');
    }
}

async function loadUserPosts(userId) {
    const container = document.getElementById('userPostsContainer');
    if (!container) return;

    container.innerHTML = '<div class="loading">Loading posts...</div>';

    try {
        const response = await fetch(`${API_BASE}/users/${userId}/posts`, {
            headers: getAuthHeaders()
        });

        const data = await response.json();

        if (response.ok) {
            displayPosts(data.posts || []);
        } else {
            container.innerHTML = `<div class="empty-state">Error loading posts</div>`;
        }
    } catch (error) {
        container.innerHTML = '<div class="empty-state">Error connecting to server</div>';
    }
}

async function toggleFollow() {
    const urlParams = new URLSearchParams(window.location.search);
    const userId = parseInt(urlParams.get('id'));

    if (!userId) return;

    try {
        const response = await fetch(`${API_BASE}/users/${userId}/follow`, {
            method: 'POST',
            headers: getAuthHeaders()
        });

        const data = await response.json();

        if (response.ok) {
            loadProfile(userId, false);
        } else {
            alert(data.error || 'Error updating follow status');
        }
    } catch (error) {
        alert('Error connecting to server');
    }
}

// Edit Profile Modal
function showEditModal() {
    const modal = document.getElementById('editModal');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    if (modal) {
        document.getElementById('editFullName').value = user.full_name || '';
        document.getElementById('editBio').value = user.bio || '';
        
        // Update profile picture preview
        const preview = document.getElementById('profilePicturePreview');
        if (preview) {
            if (user.profile_picture) {
                preview.innerHTML = `<img src="${user.profile_picture}" alt="Profile picture">`;
            } else {
                preview.innerHTML = '<span>No image</span>';
            }
        }
        
        modal.classList.add('show');
        modal.style.display = 'block';
    }
}

// Handle profile picture upload in edit modal
if (document.getElementById('editProfilePicture')) {
    document.getElementById('editProfilePicture').addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            const formData = new FormData();
            formData.append('profile_picture', file);

            const response = await fetch(`${API_BASE}/users/upload-profile-picture`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${getToken()}`
                },
                body: formData
            });

            const data = await response.json();

            if (response.ok) {
                // Update preview
                const preview = document.getElementById('profilePicturePreview');
                if (preview) {
                    preview.innerHTML = `<img src="${data.profilePictureUrl}" alt="Profile picture">`;
                }
                
                // Update user in localStorage
                const user = JSON.parse(localStorage.getItem('user') || '{}');
                user.profile_picture = data.profilePictureUrl;
                localStorage.setItem('user', JSON.stringify(user));
            } else {
                alert(data.error || 'Error uploading profile picture');
            }
        } catch (error) {
            alert('Error uploading profile picture');
        }
    });
}

function closeEditModal() {
    const modal = document.getElementById('editModal');
    if (modal) {
        modal.classList.remove('show');
        setTimeout(() => {
            modal.style.display = 'none';
        }, 300);
    }
}

// Edit Profile Form
if (document.getElementById('editProfileForm')) {
    document.getElementById('editProfileForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const full_name = document.getElementById('editFullName').value;
        const bio = document.getElementById('editBio').value;

        try {
            const response = await fetch(`${API_BASE}/users/${user.id}`, {
                method: 'PUT',
                headers: getAuthHeaders(),
                body: JSON.stringify({ full_name, bio })
            });

            const data = await response.json();

            if (response.ok) {
                user.full_name = full_name;
                user.bio = bio;
                // Get updated user data including profile picture
                const meResponse = await fetch(`${API_BASE}/me`, {
                    headers: getAuthHeaders()
                });
                if (meResponse.ok) {
                    const meData = await meResponse.json();
                    Object.assign(user, meData.user);
                }
                localStorage.setItem('user', JSON.stringify(user));
                closeEditModal();
                loadProfile(user.id, true);
            } else {
                alert(data.error || 'Error updating profile');
            }
        } catch (error) {
            alert('Error connecting to server');
        }
    });
}
