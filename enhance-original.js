/**
 * Script to add UX enhancements to the original index.html
 * Preserves ALL original content, just adds new CSS and JS features
 */

const fs = require('fs');
const path = require('path');

const inputFile = path.join(__dirname, 'index.html');
const outputFile = path.join(__dirname, 'index-v3.html');

// Read original file
let content = fs.readFileSync(inputFile, 'utf-8');

console.log('Reading original index.html...');

// ============================================
// ADDITIONAL CSS TO INSERT
// ============================================
const additionalCSS = `
    /* ============================================
       UX ENHANCEMENTS - ADDED CSS
       ============================================ */

    /* 1. PROGRESS BAR (scroll indicator) */
    .progress-bar {
      position: fixed;
      top: 0;
      left: 0;
      width: 0%;
      height: 3px;
      background: linear-gradient(90deg, var(--color-accent), var(--color-success));
      z-index: 1000;
      transition: width 50ms linear;
    }

    /* 2. TOAST NOTIFICATION */
    .toast-container {
      position: fixed;
      bottom: var(--space-6);
      left: 50%;
      transform: translateX(-50%);
      z-index: 1000;
      pointer-events: none;
    }
    .toast {
      background: var(--color-surface);
      color: var(--color-text);
      padding: var(--space-3) var(--space-5);
      border-radius: var(--radius);
      box-shadow: var(--shadow-lg);
      opacity: 0;
      transform: translateY(20px);
      transition: all 0.3s ease;
      font-weight: 500;
      border: 1px solid var(--color-border);
    }
    .toast.show {
      opacity: 1;
      transform: translateY(0);
    }
    .toast--success { border-left: 4px solid var(--color-success); }
    .toast--error { border-left: 4px solid var(--color-error); }

    /* 3. BACK TO TOP BUTTON ENHANCEMENT */
    .back-to-top {
      position: fixed;
      bottom: var(--space-6);
      right: var(--space-6);
      width: 48px;
      height: 48px;
      background: var(--color-accent);
      color: white;
      border: none;
      border-radius: 50%;
      font-size: 1.5rem;
      cursor: pointer;
      box-shadow: var(--shadow-md);
      opacity: 0;
      visibility: hidden;
      transform: translateY(20px);
      transition: all var(--transition);
      z-index: 99;
    }
    .back-to-top.visible {
      opacity: 1;
      visibility: visible;
      transform: translateY(0);
    }
    .back-to-top:hover {
      background: var(--color-accent-hover);
      transform: translateY(-2px);
    }
    @media (max-width: 768px) {
      .back-to-top {
        bottom: 80px; /* Above mobile bottom bar */
        right: var(--space-4);
        width: 44px;
        height: 44px;
      }
    }

    /* 4. SEARCH HIGHLIGHT */
    mark {
      background: rgba(255, 171, 0, 0.4);
      color: inherit;
      padding: 0.1em 0.2em;
      border-radius: 2px;
    }
    @media (prefers-color-scheme: dark) {
      mark {
        background: rgba(251, 191, 36, 0.3);
      }
    }

    /* 5. SEARCH RESULTS COUNT */
    .search-results-count {
      padding: var(--space-2) var(--space-4);
      color: var(--color-muted);
      font-size: var(--font-size-sm);
      font-weight: 500;
    }

    /* 6. MOBILE BOTTOM BAR */
    .mobile-bottom-bar {
      display: none;
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      background: var(--color-header-bg);
      backdrop-filter: saturate(140%) blur(6px);
      border-top: 1px solid var(--color-border);
      padding: var(--space-2) var(--space-4);
      z-index: 100;
      box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.1);
    }
    @media (max-width: 768px) {
      .mobile-bottom-bar {
        display: flex;
        gap: var(--space-3);
        align-items: center;
      }
      body {
        padding-bottom: 70px;
      }
    }
    .mobile-bottom-bar__btn {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: var(--space-2);
      padding: var(--space-3);
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      border-radius: var(--radius);
      color: var(--color-text);
      font-family: inherit;
      font-size: var(--font-size-sm);
      font-weight: 600;
      cursor: pointer;
      min-height: 48px;
      transition: all var(--transition);
    }
    .mobile-bottom-bar__btn:hover,
    .mobile-bottom-bar__btn:focus {
      background: var(--color-accent);
      color: white;
      border-color: var(--color-accent);
    }

    /* 7. MOBILE SEARCH MODAL */
    .mobile-search-modal {
      display: none;
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.5);
      z-index: 200;
      align-items: flex-start;
      justify-content: center;
      padding-top: var(--space-8);
    }
    .mobile-search-modal.active {
      display: flex;
    }
    .mobile-search-modal__content {
      background: var(--color-bg);
      border-radius: var(--radius);
      padding: var(--space-4);
      width: calc(100% - var(--space-8));
      max-width: 500px;
      box-shadow: var(--shadow-lg);
    }

    /* 8. KEYBOARD HINT */
    .keyboard-hint {
      display: none;
      position: fixed;
      bottom: var(--space-4);
      left: var(--space-4);
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      padding: var(--space-2) var(--space-3);
      border-radius: var(--radius);
      font-size: 0.75rem;
      color: var(--color-muted);
      box-shadow: var(--shadow-sm);
      z-index: 50;
    }
    @media (min-width: 1024px) {
      .keyboard-hint { display: block; }
    }
    .keyboard-hint kbd {
      background: var(--color-bg);
      border: 1px solid var(--color-border);
      border-radius: 3px;
      padding: 2px 6px;
      font-family: var(--font-mono);
      font-size: 0.7rem;
    }

    /* 9. PROMPT CARD ENHANCEMENTS */
    .prompt-card {
      position: relative;
    }
    .prompt-card__text {
      max-width: 75ch;
      line-height: 1.7;
    }

    /* 10. BTN-COPY POSITIONING FIX */
    .btn-copy {
      min-height: 44px;
    }
`;

// ============================================
// ADDITIONAL HTML ELEMENTS
// ============================================
const additionalHTMLAfterBody = `
  <!-- Progress bar -->
  <div class="progress-bar" id="progress-bar"></div>
  
  <!-- Toast container -->
  <div class="toast-container">
    <div class="toast" id="toast"></div>
  </div>
`;

const additionalHTMLBeforeBodyEnd = `
  <!-- Back to top button -->
  <button id="back-to-top" class="back-to-top" aria-label="Grįžti į viršų">↑</button>

  <!-- Mobile bottom bar -->
  <div class="mobile-bottom-bar">
    <button class="mobile-bottom-bar__btn" id="mobile-search-btn">
      <span>🔍</span> Ieškoti
    </button>
    <button class="mobile-bottom-bar__btn" id="mobile-sections-btn">
      <span>📑</span> Skyriai
    </button>
  </div>

  <!-- Mobile search modal -->
  <div class="mobile-search-modal" id="mobile-search-modal">
    <div class="mobile-search-modal__content">
      <input 
        type="search" 
        id="mobile-search-input" 
        class="search-input" 
        placeholder="🔍 Ieškoti..."
        style="width: 100%; margin-bottom: var(--space-3);">
      <div id="mobile-search-results" class="search-results-count"></div>
      <button class="btn btn--primary" style="width: 100%; margin-top: var(--space-3);" onclick="closeMobileSearch()">Uždaryti</button>
    </div>
  </div>

  <!-- Keyboard shortcuts hint -->
  <div class="keyboard-hint">
    <kbd>/</kbd> Paieška &nbsp;|&nbsp; <kbd>Esc</kbd> Uždaryti
  </div>
`;

// ============================================
// ADDITIONAL JAVASCRIPT
// ============================================
const additionalJS = `
    // ============================================
    // UX ENHANCEMENTS - ADDED JAVASCRIPT
    // ============================================

    // 1. TOAST NOTIFICATION
    function showToast(message, type = 'success', duration = 2000) {
      const toast = document.getElementById('toast');
      if (!toast) return;
      toast.textContent = message;
      toast.className = 'toast toast--' + type + ' show';
      setTimeout(() => toast.classList.remove('show'), duration);
    }

    // 2. ENHANCED COPY with TOAST
    document.querySelectorAll('.btn-copy').forEach(button => {
      button.addEventListener('click', async (e) => {
        // Get prompt text - try data-copy first, then data-prompt
        let promptText = button.getAttribute('data-copy') || button.getAttribute('data-prompt');
        if (!promptText) {
          // Try to get from sibling prompt-card__text
          const card = button.closest('.prompt-card');
          if (card) {
            const textEl = card.querySelector('.prompt-card__text');
            if (textEl) promptText = textEl.textContent;
          }
        }
        if (!promptText) return;
        
        // Clean whitespace
        const cleanText = promptText.trim().replace(/\\s+/g, ' ');
        
        try {
          await navigator.clipboard.writeText(cleanText);
          showToast('Nukopijuota ✅', 'success', 2000);
        } catch (err) {
          // Fallback
          const textarea = document.createElement('textarea');
          textarea.value = cleanText;
          textarea.style.cssText = 'position:fixed;opacity:0;left:-9999px';
          document.body.appendChild(textarea);
          textarea.select();
          try {
            document.execCommand('copy');
            showToast('Nukopijuota ✅', 'success', 2000);
          } catch (e) {
            showToast('Nepavyko nukopijuoti. Pažymėkite tekstą.', 'error', 3000);
          }
          document.body.removeChild(textarea);
        }
      });
    });

    // 3. PROGRESS BAR
    function updateProgressBar() {
      const progressBar = document.getElementById('progress-bar');
      if (!progressBar) return;
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      progressBar.style.width = progress + '%';
    }
    window.addEventListener('scroll', updateProgressBar, { passive: true });

    // 4. BACK TO TOP
    const backToTopBtn = document.getElementById('back-to-top');
    function toggleBackToTop() {
      if (!backToTopBtn) return;
      if (window.scrollY > 400) {
        backToTopBtn.classList.add('visible');
      } else {
        backToTopBtn.classList.remove('visible');
      }
    }
    window.addEventListener('scroll', toggleBackToTop, { passive: true });
    if (backToTopBtn) {
      backToTopBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }

    // 5. SEARCH WITH HIGHLIGHT
    const searchInput = document.getElementById('search-prompts');
    if (searchInput) {
      searchInput.addEventListener('input', () => {
        const query = searchInput.value.toLowerCase().trim();
        const cards = document.querySelectorAll('.prompt-card');
        let visibleCount = 0;
        
        cards.forEach(card => {
          const text = card.textContent.toLowerCase();
          const keywords = card.getAttribute('data-keywords') || '';
          const matches = query === '' || text.includes(query) || keywords.toLowerCase().includes(query);
          
          card.style.display = matches ? '' : 'none';
          if (matches) visibleCount++;
          
          // Highlight matches
          if (query && matches) {
            const titleEl = card.querySelector('.prompt-card__title');
            const textEl = card.querySelector('.prompt-card__text');
            if (titleEl) highlightText(titleEl, query);
            if (textEl) highlightText(textEl, query);
          } else {
            removeHighlights(card);
          }
        });
        
        // Show/hide departments based on visible cards
        document.querySelectorAll('.dept').forEach(dept => {
          const visibleCards = dept.querySelectorAll('.prompt-card[style=""], .prompt-card:not([style])');
          const hasVisible = Array.from(visibleCards).some(c => c.style.display !== 'none');
          dept.style.display = query === '' || hasVisible ? '' : 'none';
        });
      });
    }

    function highlightText(element, query) {
      const originalText = element.getAttribute('data-original') || element.textContent;
      element.setAttribute('data-original', originalText);
      // Simple case-insensitive highlight without regex
      const lowerText = originalText.toLowerCase();
      const lowerQuery = query.toLowerCase();
      let result = '';
      let lastIndex = 0;
      let index = lowerText.indexOf(lowerQuery);
      while (index !== -1) {
        result += originalText.slice(lastIndex, index);
        result += '<mark>' + originalText.slice(index, index + query.length) + '</mark>';
        lastIndex = index + query.length;
        index = lowerText.indexOf(lowerQuery, lastIndex);
      }
      result += originalText.slice(lastIndex);
      element.innerHTML = result;
    }

    function removeHighlights(card) {
      card.querySelectorAll('[data-original]').forEach(el => {
        el.textContent = el.getAttribute('data-original');
        el.removeAttribute('data-original');
      });
    }

    // 6. MOBILE BOTTOM BAR
    const mobileSearchBtn = document.getElementById('mobile-search-btn');
    const mobileSectionsBtn = document.getElementById('mobile-sections-btn');
    const mobileSearchModal = document.getElementById('mobile-search-modal');
    const mobileSearchInput = document.getElementById('mobile-search-input');

    if (mobileSearchBtn) {
      mobileSearchBtn.addEventListener('click', () => {
        if (mobileSearchModal) mobileSearchModal.classList.add('active');
        if (mobileSearchInput) mobileSearchInput.focus();
      });
    }

    if (mobileSectionsBtn) {
      mobileSectionsBtn.addEventListener('click', () => {
        // Toggle navigation
        const nav = document.getElementById('primary-nav');
        if (nav) {
          const isExpanded = nav.classList.contains('nav__list--expanded');
          nav.classList.toggle('nav__list--expanded', !isExpanded);
        }
      });
    }

    function closeMobileSearch() {
      if (mobileSearchModal) mobileSearchModal.classList.remove('active');
    }

    // Sync mobile search with main search
    if (mobileSearchInput && searchInput) {
      mobileSearchInput.addEventListener('input', () => {
        searchInput.value = mobileSearchInput.value;
        searchInput.dispatchEvent(new Event('input'));
      });
    }

    // 7. KEYBOARD SHORTCUTS
    document.addEventListener('keydown', (e) => {
      // / to focus search
      if (e.key === '/' && !e.ctrlKey && !e.metaKey) {
        const target = e.target;
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;
        e.preventDefault();
        if (searchInput) searchInput.focus();
      }
      
      // Esc to close
      if (e.key === 'Escape') {
        closeMobileSearch();
        const nav = document.getElementById('primary-nav');
        if (nav) nav.classList.remove('nav__list--expanded');
      }
    });

    // Initialize
    updateProgressBar();
    toggleBackToTop();
`;

// ============================================
// INSERT CSS
// ============================================
content = content.replace('</style>', additionalCSS + '\n  </style>');
console.log('✓ Added enhanced CSS');

// ============================================
// INSERT HTML AFTER <body>
// ============================================
content = content.replace(/<body([^>]*)>/, '<body$1>' + additionalHTMLAfterBody);
console.log('✓ Added progress bar and toast');

// ============================================
// INSERT HTML BEFORE </body>
// ============================================
content = content.replace('</body>', additionalHTMLBeforeBodyEnd + '\n</body>');
console.log('✓ Added mobile bottom bar and back-to-top');

// ============================================
// INSERT JS BEFORE </script>
// ============================================
// Find the main script section and add before its closing tag
const lastScriptEnd = content.lastIndexOf('</script>');
if (lastScriptEnd !== -1) {
  content = content.slice(0, lastScriptEnd) + additionalJS + '\n  </script>' + content.slice(lastScriptEnd + 9);
  console.log('✓ Added enhanced JavaScript');
}

// ============================================
// WRITE OUTPUT
// ============================================
fs.writeFileSync(outputFile, content, 'utf-8');
console.log(`\n✅ Created ${outputFile}`);

// Verify
const promptCards = (content.match(/<article class="prompt-card"/g) || []).length;
const sections = (content.match(/class="dept"/g) || []).length;
const hasStart = content.includes('id="start"');
console.log(`\nVerification:`);
console.log(`- Prompt cards: ${promptCards}`);
console.log(`- Departments: ${sections}`);
console.log(`- "Pradėti" section: ${hasStart ? 'YES' : 'NO'}`);
console.log(`- Progress bar: ${content.includes('id="progress-bar"') ? 'YES' : 'NO'}`);
console.log(`- Toast: ${content.includes('id="toast"') ? 'YES' : 'NO'}`);
console.log(`- Mobile bar: ${content.includes('mobile-bottom-bar') ? 'YES' : 'NO'}`);
