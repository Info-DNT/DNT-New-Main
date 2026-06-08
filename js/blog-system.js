/**
 * DNT Blog Management System - Core Controller
 * Handles local persistence, default content, and admin authentication
 */

const BLOG_STORAGE_KEY = 'dnt_blog_posts';
const AUTH_SESSION_KEY = 'dnt_admin_session';

// Pre-populated default posts
const defaultPosts = [];

class BlogSystem {
    constructor() {
        this.inMemoryPosts = [];
        this.inMemorySession = null;
        this.hasStorage = true;
        try {
            if (!localStorage.getItem(BLOG_STORAGE_KEY)) {
                localStorage.setItem(BLOG_STORAGE_KEY, JSON.stringify([]));
            }
        } catch (e) {
            console.warn("Storage access is restricted. Falling back to in-memory state.", e);
            this.hasStorage = false;
        }
    }

    // Helper: generate SEO friendly slug ID
    slugify(text) {
        return text.toString().toLowerCase().trim()
            .replace(/\s+/g, '-')
            .replace(/[^\w\-]+/g, '')
            .replace(/\-\-+/g, '-')
            .replace(/^-+/, '')
            .replace(/-+$/, '');
    }

    getPosts() {
        if (this.hasStorage) {
            try {
                const localData = localStorage.getItem(BLOG_STORAGE_KEY);
                const customPosts = localData ? JSON.parse(localData) : [];
                return [...customPosts, ...defaultPosts];
            } catch (e) {
                console.error("Storage read failed:", e);
            }
        }
        return [...this.inMemoryPosts, ...defaultPosts];
    }

    getPostById(id) {
        return this.getPosts().find(post => post.id === id);
    }

    savePost(postData, oldId = null) {
        if (this.hasStorage) {
            try {
                const localData = localStorage.getItem(BLOG_STORAGE_KEY);
                let customPosts = localData ? JSON.parse(localData) : [];

                const targetId = oldId || postData.id;
                if (targetId) {
                    const index = customPosts.findIndex(p => p.id === targetId);
                    if (index !== -1) {
                        // If ID (slug) is changed, make sure new ID is unique and migrate comments key
                        if (postData.id !== targetId) {
                            let uniqueId = postData.id;
                            let counter = 1;
                            while (this.getPostById(uniqueId)) {
                                uniqueId = `${postData.id}-${counter}`;
                                counter++;
                            }
                            postData.id = uniqueId;

                            // Migrate comments
                            try {
                                const oldKey = 'dnt_blog_comments_' + targetId;
                                const newKey = 'dnt_blog_comments_' + postData.id;
                                const comments = localStorage.getItem(oldKey);
                                if (comments) {
                                    localStorage.setItem(newKey, comments);
                                    localStorage.removeItem(oldKey);
                                }
                            } catch (e) {
                                console.warn("Failed to migrate comments on slug rename:", e);
                            }
                        }
                        customPosts[index] = { ...customPosts[index], ...postData };
                    } else {
                        customPosts.unshift(postData);
                    }
                } else {
                    postData.id = this.slugify(postData.title);
                    let uniqueId = postData.id;
                    let counter = 1;
                    while (this.getPostById(uniqueId)) {
                        uniqueId = `${postData.id}-${counter}`;
                        counter++;
                    }
                    postData.id = uniqueId;
                    customPosts.unshift(postData);
                }

                localStorage.setItem(BLOG_STORAGE_KEY, JSON.stringify(customPosts));
                return postData;
            } catch (e) {
                console.error("Storage write failed:", e);
            }
        }

        // In-memory fallback
        const targetId = oldId || postData.id;
        if (targetId) {
            const index = this.inMemoryPosts.findIndex(p => p.id === targetId);
            if (index !== -1) {
                if (postData.id !== targetId) {
                    let uniqueId = postData.id;
                    let counter = 1;
                    while (this.getPostById(uniqueId)) {
                        uniqueId = `${postData.id}-${counter}`;
                        counter++;
                    }
                    postData.id = uniqueId;
                }
                this.inMemoryPosts[index] = { ...this.inMemoryPosts[index], ...postData };
            } else {
                this.inMemoryPosts.unshift(postData);
            }
        } else {
            postData.id = this.slugify(postData.title);
            let uniqueId = postData.id;
            let counter = 1;
            while (this.getPostById(uniqueId)) {
                uniqueId = `${postData.id}-${counter}`;
                counter++;
            }
            postData.id = uniqueId;
            this.inMemoryPosts.unshift(postData);
        }
        return postData;
    }

    deletePost(id) {
        if (this.hasStorage) {
            try {
                const localData = localStorage.getItem(BLOG_STORAGE_KEY);
                let customPosts = localData ? JSON.parse(localData) : [];
                const originalLength = customPosts.length;
                customPosts = customPosts.filter(post => post.id !== id);
                localStorage.setItem(BLOG_STORAGE_KEY, JSON.stringify(customPosts));
                return customPosts.length < originalLength;
            } catch (e) {
                console.error("Storage delete failed:", e);
            }
        }

        const originalLength = this.inMemoryPosts.length;
        this.inMemoryPosts = this.inMemoryPosts.filter(post => post.id !== id);
        return this.inMemoryPosts.length < originalLength;
    }

    // Admin Auth
    login(username, password) {
        if (username === 'admin' && password === 'dnt2026') {
            if (this.hasStorage) {
                try {
                    sessionStorage.setItem(AUTH_SESSION_KEY, 'active');
                } catch (e) {
                    this.inMemorySession = 'active';
                }
            } else {
                this.inMemorySession = 'active';
            }
            return true;
        }
        return false;
    }

    logout() {
        if (this.hasStorage) {
            try {
                sessionStorage.removeItem(AUTH_SESSION_KEY);
            } catch (e) {
                this.inMemorySession = null;
            }
        } else {
            this.inMemorySession = null;
        }
    }

    isLoggedIn() {
        if (this.hasStorage) {
            try {
                return sessionStorage.getItem(AUTH_SESSION_KEY) === 'active';
            } catch (e) {
                return this.inMemorySession === 'active';
            }
        }
        return this.inMemorySession === 'active';
    }
}

// Global single instance
window.blogSystem = new BlogSystem();
