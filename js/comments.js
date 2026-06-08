/* =============================================
   DNT BLOG — COMMENTS ENGINE
   Stored in localStorage per post slug
   ============================================= */

(function () {
  var PREFIX = 'dnt_blog_comments_';
  var slug = window.location.pathname.split('/').pop().replace('.html', '') || 'default';
  var KEY = PREFIX + slug;

  function getComments() {
    try { return JSON.parse(localStorage.getItem(KEY)) || []; }
    catch (e) { return []; }
  }

  function saveComments(comments) {
    try { localStorage.setItem(KEY, JSON.stringify(comments)); }
    catch (e) { console.error(e); }
  }

  function renderComments() {
    var list = document.getElementById('comments-list');
    if (!list) return;
    var comments = getComments();
    if (comments.length === 0) {
      list.innerHTML = '<p style="color:var(--text-muted);font-size:0.95rem;font-style:italic;">No comments yet. Be the first to share your thoughts!</p>';
      return;
    }
    list.innerHTML = comments.map(function (c) {
      return '<div style="display:flex;gap:1rem;margin-bottom:1.5rem;padding-bottom:1.5rem;border-bottom:1px solid rgba(0,0,0,0.05);align-items:flex-start;">' +
        '<div style="width:40px;height:40px;border-radius:50%;background:var(--gold);color:#FFF;display:flex;align-items:center;justify-content:center;font-weight:700;font-family:\'Outfit\',sans-serif;font-size:0.95rem;flex-shrink:0;">' +
        c.name.charAt(0).toUpperCase() + '</div>' +
        '<div><div style="display:flex;align-items:center;gap:0.5rem;margin-bottom:0.25rem;">' +
        '<strong style="font-family:\'Outfit\',sans-serif;font-size:0.95rem;color:var(--text-primary);">' + c.name + '</strong>' +
        '<span style="font-size:0.75rem;color:var(--text-muted);">' + c.date + '</span></div>' +
        '<p style="font-size:0.95rem;line-height:1.6;color:var(--text-primary);margin:0;">' + c.text + '</p></div></div>';
    }).join('');
  }

  window.submitComment = function () {
    var authorInput = document.getElementById('comment-author');
    var textInput   = document.getElementById('comment-text');
    if (!authorInput || !textInput) return;
    var name = authorInput.value.trim();
    var text = textInput.value.trim();
    if (!name || !text) return;
    var comments = getComments();
    comments.push({
      name: name,
      text: text,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    });
    saveComments(comments);
    authorInput.value = '';
    textInput.value   = '';
    renderComments();
  };

  document.addEventListener('DOMContentLoaded', renderComments);
})();
