let currentPostId = null;
let isSlugManuallyEdited = false;
let isSeoTitleManuallyEdited = false;
let isSeoDescManuallyEdited = false;

function onSlugManualEdit() { isSlugManuallyEdited = true; }
function onSeoTitleManualEdit() { isSeoTitleManuallyEdited = true; }
function onSeoDescManualEdit() { isSeoDescManuallyEdited = true; }

        // On document load
        window.addEventListener('DOMContentLoaded', () => {
            if (window.blogSystem && window.blogSystem.isLoggedIn()) {
                showDashboard();
            } else {
                showLogin();
            }
        });

        // Toggle Login view vs Dashboard
        function showLogin() {
            document.getElementById('loginView').style.display = 'flex';
            document.getElementById('dashboardView').style.display = 'none';
        }

        function showDashboard() {
            document.getElementById('loginView').style.display = 'none';
            document.getElementById('dashboardView').style.display = 'grid';
            renderPostsList();
        }

        // Handle Admin Login Form
        function handleLogin(e) {
            e.preventDefault();
            if (!window.blogSystem) {
                alert('Blog system failed to load. Please hard-refresh with Ctrl+Shift+R.');
                return false;
            }
            const user = document.getElementById('username').value;
            const pass = document.getElementById('password').value;
            
            const success = window.blogSystem.login(user, pass);
            if (success) {
                document.getElementById('loginError').style.display = 'none';
                showDashboard();
            } else {
                const err = document.getElementById('loginError');
                err.style.display = 'flex';
                err.style.animation = 'shake 0.3s';
                setTimeout(() => err.style.animation = '', 300);
            }
            return false;
        }

        // Logout
        function handleLogout() {
            window.blogSystem.logout();
            showLogin();
        }

        // Render Dashboard Lists
        function renderPostsList() {
            const listContainer = document.getElementById('adminPostsList');
            listContainer.innerHTML = '';
            
            const posts = window.blogSystem.getPosts();
            
            posts.forEach(post => {
                const card = document.createElement('div');
                card.className = 'admin-post-card';
                card.innerHTML = `
                    <div class="post-card-img" style="background-image: url('${post.image}')"></div>
                    <div class="post-card-body">
                        <span class="post-card-tag">${post.category}</span>
                        <h3 class="post-card-title">${post.title}</h3>
                        <p class="post-card-meta">By ${post.author} • ${post.date}</p>
                        <div class="post-card-actions">
                            <button class="btn-action btn-action-edit" onclick="editBlogPost('${post.id}')">
                                <i class="fas fa-edit"></i> Edit
                            </button>
                            <button class="btn-action btn-action-delete" onclick="confirmDeletePost('${post.id}')">
                                <i class="fas fa-trash-alt"></i> Delete
                            </button>
                        </div>
                    </div>
                `;
                listContainer.appendChild(card);
            });
        }

        // Tab Switching
        function switchTab(tab) {
            const secPosts = document.getElementById('section-posts');
            const secEditor = document.getElementById('section-editor');
            const navPosts = document.getElementById('nav-posts');
            const navEditor = document.getElementById('nav-editor');

            if (tab === 'posts') {
                secPosts.style.display = 'block';
                secEditor.style.display = 'none';
                navPosts.classList.add('active');
                navEditor.classList.remove('active');
                renderPostsList();
            } else {
                secPosts.style.display = 'none';
                secEditor.style.display = 'block';
                navPosts.classList.remove('active');
                navEditor.classList.add('active');
            }
        }

        // Open clean editor
        function openNewPost() {
            currentPostId = null;
            isSlugManuallyEdited = false;
            isSeoTitleManuallyEdited = false;
            isSeoDescManuallyEdited = false;

            document.getElementById('editorTitle').textContent = 'Write New Blog Post';
            document.getElementById('postTitle').value = '';
            document.getElementById('postSlug').value = '';
            document.getElementById('postExcerpt').value = '';
            document.getElementById('postSeoTitle').value = '';
            document.getElementById('postSeoDesc').value = '';
            document.getElementById('postCategory').value = 'Compliance';
            document.getElementById('postAuthor').value = 'DNT Editorial';
            
            // Format current date: e.g. "Jun 4, 2026"
            const options = { month: 'short', day: 'numeric', year: 'numeric' };
            document.getElementById('postDate').value = new Date().toLocaleDateString('en-US', options);
            
            const defImage = 'https://images.unsplash.com/photo-1772588627354-ca3617853217?crop=entropy&cs=srgb&fm=jpg&q=85&w=800';
            document.getElementById('postImageUrl').value = defImage;
            
            document.getElementById('postBody').innerHTML = '<p>Start writing your blog content here...</p>';
            document.getElementById('postBodyHTML').value = '<p>Start writing your blog content here...</p>';
            
            // Reset preset selections
            document.querySelectorAll('.preset-thumb').forEach(el => el.classList.remove('active'));
            
            toggleEditorMode('visual');
            updateLivePreview();
            switchTab('editor');
        }

        // Edit Post
        function editBlogPost(id) {
            const post = window.blogSystem.getPostById(id);
            if (!post) return;
            
            currentPostId = post.id;
            isSlugManuallyEdited = true;
            isSeoTitleManuallyEdited = true;
            isSeoDescManuallyEdited = true;

            document.getElementById('editorTitle').textContent = 'Edit Blog Post';
            document.getElementById('postTitle').value = post.title;
            document.getElementById('postSlug').value = post.id || '';
            document.getElementById('postExcerpt').value = post.excerpt || '';
            document.getElementById('postSeoTitle').value = post.seoTitle || '';
            document.getElementById('postSeoDesc').value = post.seoDesc || '';
            document.getElementById('postCategory').value = post.category;
            document.getElementById('postAuthor').value = post.author || 'DNT Editorial';
            document.getElementById('postDate').value = post.date || '';
            document.getElementById('postImageUrl').value = post.image || '';
            
            document.getElementById('postBody').innerHTML = post.content || '';
            document.getElementById('postBodyHTML').value = post.content || '';
            
            toggleEditorMode('visual');
            updateLivePreview();
            switchTab('editor');
        }

        // Delete post
        function confirmDeletePost(id) {
            if (confirm('Are you sure you want to delete this blog post?')) {
                const success = window.blogSystem.deletePost(id);
                showToast(success ? 'Post deleted successfully!' : 'Default posts cannot be deleted permanently.');
                renderPostsList();
            }
        }

        // Save Form Publish
        function saveBlogPost() {
            const title = document.getElementById('postTitle').value.trim();
            if (!title) {
                alert('Please enter a blog title.');
                return;
            }
            
            const category = document.getElementById('postCategory').value;
            const excerpt = document.getElementById('postExcerpt').value.trim();
            const author = document.getElementById('postAuthor').value.trim() || 'DNT Editorial';
            const date = document.getElementById('postDate').value.trim() || new Date().toLocaleDateString('en-US');
            const image = document.getElementById('postImageUrl').value.trim();
            
            const slug = document.getElementById('postSlug').value.trim() || window.blogSystem.slugify(title);
            const seoTitle = document.getElementById('postSeoTitle').value.trim();
            const seoDesc = document.getElementById('postSeoDesc').value.trim();
            
            let content = '';
            if (document.getElementById('postBody').style.display !== 'none') {
                content = document.getElementById('postBody').innerHTML;
            } else {
                content = document.getElementById('postBodyHTML').value;
            }

            const postData = {
                id: slug,
                title,
                category,
                excerpt,
                author,
                date,
                image,
                content,
                seoTitle,
                seoDesc
            };

            window.blogSystem.savePost(postData, currentPostId);
            showToast('Blog Published Successfully!');
            
            // Redirect back to list
            setTimeout(() => {
                // Navigate back to listing view
                switchTab('posts');
            }, 1000);
        }

        // Rich-Text Actions
        function execCmd(command, arg = null) {
            document.execCommand(command, false, arg);
            document.getElementById('postBody').focus();
            updateLivePreview();
        }

        function insertHyperlink() {
            const url = prompt('Enter the link URL:');
            if (url) execCmd('createLink', url);
        }

        function insertImageLink() {
            const url = prompt('Enter the image URL:');
            if (url) execCmd('insertImage', url);
        }

        // Editor mode switcher
        function toggleEditorMode(mode) {
            const btnVisual = document.getElementById('tab-visual');
            const btnHtml = document.getElementById('tab-html');
            const btnPrev = document.getElementById('tab-preview');
            
            const bodyVisual = document.getElementById('postBody');
            const bodyHtml = document.getElementById('postBodyHTML');
            const bodyPrev = document.getElementById('sitePreview');
            const toolbar = document.getElementById('wysiwygToolbar');

            // Reset buttons
            btnVisual.classList.remove('active');
            btnHtml.classList.remove('active');
            btnPrev.classList.remove('active');

            // Hide all
            bodyVisual.style.display = 'none';
            bodyHtml.style.display = 'none';
            bodyPrev.style.display = 'none';
            toolbar.style.opacity = '1';
            toolbar.style.pointerEvents = 'all';

            if (mode === 'visual') {
                btnVisual.classList.add('active');
                bodyVisual.style.display = 'block';
                bodyVisual.innerHTML = bodyHtml.value;
            } else if (mode === 'html') {
                btnHtml.classList.add('active');
                bodyHtml.style.display = 'block';
                bodyHtml.value = bodyVisual.innerHTML;
            } else {
                btnPrev.classList.add('active');
                bodyPrev.style.display = 'block';
                toolbar.style.opacity = '0.3';
                toolbar.style.pointerEvents = 'none';
                updateLivePreview();
            }
        }

        function syncVisualFromHTML() {
            document.getElementById('postBody').innerHTML = document.getElementById('postBodyHTML').value;
            updateLivePreview();
        }

        // Preset images selector
        function setPresetImage(url) {
            document.getElementById('postImageUrl').value = url;
            
            // Mark active
            document.querySelectorAll('.preset-thumb').forEach(el => {
                if (el.style.backgroundImage.includes(url)) {
                    el.classList.add('active');
                } else {
                    el.classList.remove('active');
                }
            });
            updateLivePreview();
        }

        // Upload Local Image Files
        function triggerFileInput() {
            document.getElementById('localFileInput').click();
        }

        function handleLocalImageUpload(e) {
            const file = e.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = function(evt) {
                document.getElementById('postImageUrl').value = evt.target.result;
                updateLivePreview();
                showToast('Image uploaded and parsed!');
            };
            reader.readAsDataURL(file);
        }

        // Live Preview renderer
        function updateLivePreview() {
            const titleVal = document.getElementById('postTitle').value;
            if (!isSlugManuallyEdited) {
                document.getElementById('postSlug').value = window.blogSystem.slugify(titleVal);
            }
            if (!isSeoTitleManuallyEdited) {
                document.getElementById('postSeoTitle').value = titleVal ? (titleVal + ' | DNT Blog') : '';
            }

            const excerptVal = document.getElementById('postExcerpt').value;
            if (!isSeoDescManuallyEdited) {
                document.getElementById('postSeoDesc').value = excerptVal;
            }

            document.getElementById('prevCategory').textContent = document.getElementById('postCategory').value;
            document.getElementById('prevTitle').textContent = titleVal || 'Enter Blog Title';
            document.getElementById('prevAuthor').textContent = document.getElementById('postAuthor').value || 'DNT Editorial';
            document.getElementById('prevDate').textContent = document.getElementById('postDate').value || 'Today';
            
            const imgUrl = document.getElementById('postImageUrl').value;
            const imgEl = document.getElementById('prevImage');
            if (imgUrl) {
                imgEl.src = imgUrl;
                imgEl.style.display = 'block';
            } else {
                imgEl.style.display = 'none';
            }

            let text = '';
            if (document.getElementById('postBody').style.display !== 'none') {
                text = document.getElementById('postBody').innerHTML;
            } else {
                text = document.getElementById('postBodyHTML').value;
            }
            document.getElementById('prevContent').innerHTML = text;
        }

        // Toast feedback notifier
        function showToast(message) {
            const toast = document.getElementById('statusToast');
            document.getElementById('toastMessage').textContent = message;
            toast.style.display = 'flex';
            setTimeout(() => toast.classList.add('show'), 10);
            
            setTimeout(() => {
                toast.classList.remove('show');
                setTimeout(() => toast.style.display = 'none', 300);
            }, 3000);
        }

        // Download Page compiler
        function downloadStaticHTML() {
            const title = document.getElementById('postTitle').value.trim() || 'Custom Blog Post';
            const category = document.getElementById('postCategory').value;
            const author = document.getElementById('postAuthor').value.trim() || 'DNT Editorial';
            const date = document.getElementById('postDate').value.trim() || new Date().toLocaleDateString('en-US');
            const image = document.getElementById('postImageUrl').value.trim();
            const excerpt = document.getElementById('postExcerpt').value.trim();
            
            const slug = document.getElementById('postSlug').value.trim() || window.blogSystem.slugify(title);
            const seoTitle = document.getElementById('postSeoTitle').value.trim() || (title + ' | DNT Blog');
            const seoDesc = document.getElementById('postSeoDesc').value.trim() || excerpt || title;

            let content = '';
            if (document.getElementById('postBody').style.display !== 'none') {
                content = document.getElementById('postBody').innerHTML;
            } else {
                content = document.getElementById('postBodyHTML').value;
            }

            // HTML static template code — no inline scripts to avoid HTML-parser conflicts
            var parts = [];
            parts.push('<!DOCTYPE html>');
            parts.push('<html lang="en">');
            parts.push('<head>');
            parts.push('<meta charset="UTF-8" />');
            parts.push('<meta name="viewport" content="width=device-width, initial-scale=1.0" />');
            parts.push('<title>' + seoTitle + '</title>');
            parts.push('<meta name="description" content="' + seoDesc + '" />');
            parts.push('<link rel="stylesheet" href="../../css/style.css" />');
            parts.push('<link rel="stylesheet" href="../../css/global-theme-override.css" />');
            parts.push('</head>');
            parts.push('<body>');
            parts.push('<div id="scroll-progress"></div>');
            parts.push('<nav id="main-nav" class="light-page" aria-label="Main Navigation">');
            parts.push('<div class="container"><div class="nav-inner">');
            parts.push('<a href="../../index.html" class="nav-logo">');
            parts.push('<div class="nav-logo-icon"><img src="../../assets/logo.svg" alt="DNT Logo"></div>');
            parts.push('<div class="nav-logo-text"><span class="nav-logo-name">Digital Next</span><span class="nav-logo-sub">Consultancy</span></div>');
            parts.push('</a>');
            parts.push('<div class="nav-right"><button class="menu-toggle" id="mobile-menu-btn" aria-label="Toggle Menu" style="--toggle-color:#000;"><span style="background:#000;"></span><span style="background:#000;"></span><span style="background:#000;"></span></button></div>');
            parts.push('<div class="nav-links">');
            parts.push('<a href="../../index.html" class="nav-link">Home</a>');
            parts.push('<a href="../../about.html" class="nav-link">About Us</a>');
            parts.push('<a href="../../blog.html" class="nav-link active">Blog</a>');
            parts.push('<a href="../../contact.html" class="nav-cta-btn">Free Consultation</a>');
            parts.push('</div></div></div></nav>');
            parts.push('<article class="section" style="padding-top:8rem">');
            parts.push('<div class="container" style="max-width:900px"><div class="reveal">');
            parts.push('<h1 class="section-title" style="font-size:clamp(2rem,5vw,3.5rem);margin:1rem 0;line-height:1.2">' + title + '</h1>');
            parts.push('<div style="display:flex;align-items:center;gap:1.5rem;color:var(--text-muted);font-size:.9rem;margin-bottom:2.5rem">');
            parts.push('<span>By <strong>' + author + '</strong></span><span>•</span><span>' + date + '</span>');
            parts.push('</div>');
            if (image) parts.push('<img src="' + image + '" alt="' + title + '" style="width:100%;border-radius:20px;margin-bottom:3rem;box-shadow:0 20px 50px rgba(0,0,0,.1)" />');
            parts.push('<div class="blog-content reveal card-text" style="line-height:1.8;font-size:1.1rem">');
            parts.push(content);
            parts.push('</div>');
            // Comments section — script loaded externally from js/comments.js
            parts.push('<div class="comments-section" style="margin-top:4rem;padding-top:2rem;border-top:1px solid var(--dark-border);">');
            parts.push('<h3 style="font-family:\'Outfit\',sans-serif;font-size:1.5rem;font-weight:700;margin-bottom:2rem;">Comments</h3>');
            parts.push('<div id="comments-list" style="margin-bottom:3rem;"></div>');
            parts.push('<div class="comment-form-container" style="background:#F8FAFC;padding:2rem;border-radius:16px;border:1px solid var(--dark-border);">');
            parts.push('<h4 style="font-family:\'Outfit\',sans-serif;font-size:1.2rem;font-weight:700;margin-bottom:1.5rem;">Leave a Reply</h4>');
            parts.push('<form id="comment-form" onsubmit="event.preventDefault(); submitComment();">');
            parts.push('<div style="margin-bottom:1.25rem;"><label style="display:block;font-size:0.85rem;font-weight:600;color:var(--text-muted);margin-bottom:0.5rem;">Your Name *</label>');
            parts.push('<input type="text" id="comment-author" required style="width:100%;padding:0.8rem 1rem;border:1px solid var(--dark-border);border-radius:10px;background:#FFF;color:var(--text-primary);font-size:0.95rem;outline:none;" /></div>');
            parts.push('<div style="margin-bottom:1.5rem;"><label style="display:block;font-size:0.85rem;font-weight:600;color:var(--text-muted);margin-bottom:0.5rem;">Comment *</label>');
            parts.push('<textarea id="comment-text" required rows="4" style="width:100%;padding:0.8rem 1rem;border:1px solid var(--dark-border);border-radius:10px;background:#FFF;color:var(--text-primary);font-size:0.95rem;outline:none;resize:vertical;font-family:inherit;"></textarea></div>');
            parts.push('<button type="submit" class="btn btn-gold" style="padding:0.8rem 2rem;font-family:\'Outfit\',sans-serif;font-weight:700;border:none;border-radius:10px;cursor:pointer;background:var(--gold);color:#FFF;">Post Comment</button>');
            parts.push('</form></div></div>');
            parts.push('</div></div></article>');
            parts.push('<footer style="margin-top:5rem;"><div class="container"><p style="text-align:center;color:var(--text-muted);font-size:0.9rem">&copy; 2026 Digital Next Consultancy Pvt. Ltd. All Rights Reserved.</p></div></footer>');
            parts.push('<sc' + 'ript src="../../js/blog-system.js"><' + '/sc' + 'ript>');
            parts.push('<sc' + 'ript src="../../js/comments.js"><' + '/sc' + 'ript>');
            parts.push('<sc' + 'ript src="../../js/script.js"><' + '/sc' + 'ript>');
            parts.push('</body></html>');
            const templateHtml = parts.join('\n');

            const blob = new Blob([templateHtml], { type: 'text/html' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            // slug filename
            const filename = slug + '.html';
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            showToast('Static page compiled and downloaded!');
        }
