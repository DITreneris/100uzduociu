/**
 * Praktinių Promptų Rinkinys - Enhanced JavaScript v3.0
 * 
 * P2 Features:
 * - Fuse.js Fuzzy Search with Autocomplete
 * - Search History (last 5 terms)
 * - Progress Tracking System
 * - Favorites System  
 * - Recently Used Section
 * - Lazy Loading with Intersection Observer
 * - Performance Optimizations
 * 
 * Note: Uses Fuse.js from CDN (window.Fuse)
 */

(function() {
  'use strict';

  // ============================================
  // 1. STORAGE - Enhanced localStorage wrapper
  // ============================================
  const Storage = {
    isAvailable() {
      try {
        const test = '__storage_test__';
        localStorage.setItem(test, test);
        localStorage.removeItem(test);
        return true;
      } catch (e) {
        return false;
      }
    },

    get(key, defaultValue = null) {
      if (!this.isAvailable()) return defaultValue;
      try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
      } catch (e) {
        console.warn('Storage.get error:', e);
        return defaultValue;
      }
    },

    set(key, value) {
      if (!this.isAvailable()) return false;
      try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
      } catch (e) {
        console.warn('Storage.set error:', e);
        return false;
      }
    },

    remove(key) {
      if (!this.isAvailable()) return false;
      try {
        localStorage.removeItem(key);
        return true;
      } catch (e) {
        console.warn('Storage.remove error:', e);
        return false;
      }
    }
  };

  // ============================================
  // 2. USER PROGRESS - Tracking System
  // ============================================
  const UserProgress = {
    STORAGE_KEY: 'promptu_user_progress',
    
    getDefaultData() {
      return {
        favoritePrompts: [],
        recentlyUsed: [],
        copyCount: {},
        totalCopies: 0,
        lastVisited: null,
        searchHistory: [],
        completedPrompts: [],
        firstVisit: new Date().toISOString()
      };
    },

    getData() {
      return Storage.get(this.STORAGE_KEY, this.getDefaultData());
    },

    saveData(data) {
      data.lastVisited = new Date().toISOString();
      Storage.set(this.STORAGE_KEY, data);
    },

    recordCopy(promptId, promptTitle) {
      const data = this.getData();
      
      data.copyCount[promptId] = (data.copyCount[promptId] || 0) + 1;
      data.totalCopies++;
      
      const existingIndex = data.recentlyUsed.findIndex(p => p.id === promptId);
      if (existingIndex > -1) {
        data.recentlyUsed.splice(existingIndex, 1);
      }
      data.recentlyUsed.unshift({
        id: promptId,
        title: promptTitle,
        usedAt: new Date().toISOString()
      });
      data.recentlyUsed = data.recentlyUsed.slice(0, 10);
      
      this.saveData(data);
      this.updateUI();
    },

    toggleFavorite(promptId, promptTitle) {
      const data = this.getData();
      const existingIndex = data.favoritePrompts.findIndex(p => p.id === promptId);
      
      if (existingIndex > -1) {
        data.favoritePrompts.splice(existingIndex, 1);
        this.saveData(data);
        return false;
      } else {
        data.favoritePrompts.push({
          id: promptId,
          title: promptTitle,
          addedAt: new Date().toISOString()
        });
        this.saveData(data);
        return true;
      }
    },

    isFavorite(promptId) {
      const data = this.getData();
      return data.favoritePrompts.some(p => p.id === promptId);
    },

    addSearchTerm(term) {
      if (!term || term.length < 2) return;
      
      const data = this.getData();
      const existingIndex = data.searchHistory.indexOf(term);
      
      if (existingIndex > -1) {
        data.searchHistory.splice(existingIndex, 1);
      }
      
      data.searchHistory.unshift(term);
      data.searchHistory = data.searchHistory.slice(0, 5);
      
      this.saveData(data);
    },

    getSearchHistory() {
      return this.getData().searchHistory;
    },

    updateUI() {
      const data = this.getData();
      
      const statsEl = document.getElementById('user-stats');
      if (statsEl) {
        statsEl.innerHTML = `
          <span class="stat-item">📋 ${data.totalCopies} kopijos</span>
          <span class="stat-item">⭐ ${data.favoritePrompts.length} mėgstami</span>
        `;
      }

      this.renderRecentlyUsed();
      this.renderFavorites();
    },

    renderRecentlyUsed() {
      const container = document.getElementById('recently-used-container');
      if (!container) return;
      
      const data = this.getData();
      if (data.recentlyUsed.length === 0) {
        container.innerHTML = '<p class="empty-state">Dar nenaudojote jokių promptų. Pradėkite kopijuodami!</p>';
        return;
      }

      container.innerHTML = data.recentlyUsed.map(prompt => `
        <a href="#${prompt.id}" class="recent-item" data-prompt-id="${prompt.id}">
          <span class="recent-icon">🕐</span>
          <span class="recent-title">${this.escapeHtml(prompt.title)}</span>
        </a>
      `).join('');
    },

    renderFavorites() {
      const container = document.getElementById('favorites-container');
      if (!container) return;
      
      const data = this.getData();
      if (data.favoritePrompts.length === 0) {
        container.innerHTML = '<p class="empty-state">Dar neturite mėgstamų promptų. Spustelėkite ☆ norėdami pridėti!</p>';
        return;
      }

      container.innerHTML = data.favoritePrompts.map(prompt => `
        <a href="#${prompt.id}" class="favorite-item" data-prompt-id="${prompt.id}">
          <span class="favorite-icon">⭐</span>
          <span class="favorite-title">${this.escapeHtml(prompt.title)}</span>
          <button class="remove-favorite" data-prompt-id="${prompt.id}" aria-label="Pašalinti iš mėgstamų">✕</button>
        </a>
      `).join('');

      container.querySelectorAll('.remove-favorite').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          const id = btn.dataset.promptId;
          this.toggleFavorite(id, '');
          this.updateUI();
          Toast.success('Pašalinta iš mėgstamų');
        });
      });
    },

    escapeHtml(text) {
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    },

    init() {
      const data = this.getData();
      this.saveData(data);
      this.updateUI();
    }
  };

  // ============================================
  // 3. TOAST - Notification System
  // ============================================
  const Toast = {
    container: null,
    element: null,
    timeout: null,

    init() {
      this.container = document.querySelector('.toast-container');
      this.element = document.getElementById('toast');
    },

    show(message, type = 'success', duration = 2000) {
      if (!this.element) return;
      
      if (this.timeout) {
        clearTimeout(this.timeout);
      }

      this.element.textContent = message;
      this.element.className = `toast toast--${type} show`;

      this.timeout = setTimeout(() => {
        this.element.classList.remove('show');
      }, duration);
    },

    success(message, duration = 2000) {
      this.show(message, 'success', duration);
    },

    error(message, duration = 3000) {
      this.show(message, 'error', duration);
    }
  };

  // ============================================
  // 4. CLIPBOARD - Copy Functionality (Event Delegation)
  // ============================================
  const Clipboard = {
    async copy(text) {
      const cleanText = text.trim().replace(/\s+/g, ' ');

      if (navigator.clipboard && window.isSecureContext) {
        try {
          await navigator.clipboard.writeText(cleanText);
          return { success: true };
        } catch (err) {
          // Fall through to fallback
        }
      }

      return this.fallbackCopy(cleanText);
    },

    fallbackCopy(text) {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.cssText = 'position:fixed;opacity:0;left:-9999px;top:0';
      textarea.setAttribute('readonly', '');
      document.body.appendChild(textarea);
      
      try {
        textarea.select();
        textarea.setSelectionRange(0, 99999);
        const success = document.execCommand('copy');
        return { success };
      } catch (e) {
        return { success: false, error: e };
      } finally {
        document.body.removeChild(textarea);
      }
    },

    init() {
      // Single event delegation listener for all copy buttons
      document.body.addEventListener('click', async (e) => {
        const button = e.target.closest('.btn-copy');
        if (!button) return;
        
        e.preventDefault();
        await this.handleCopy(button);
      });
    },

    async handleCopy(button) {
      let textToCopy = button.getAttribute('data-copy') || button.getAttribute('data-prompt');
      
      if (!textToCopy) {
        const card = button.closest('.prompt-card');
        if (card) {
          const textEl = card.querySelector('.prompt-card__text');
          if (textEl) textToCopy = textEl.textContent;
        }
      }

      if (!textToCopy) return;

      const result = await this.copy(textToCopy);
      
      if (result.success) {
        const card = button.closest('.prompt-card');
        const promptId = card?.id || `prompt-${Date.now()}`;
        const titleEl = card?.querySelector('.prompt-card__title');
        const promptTitle = titleEl?.textContent || 'Nežinomas promptas';

        UserProgress.recordCopy(promptId, promptTitle);

        const originalHTML = button.innerHTML;
        button.innerHTML = '<span>✓</span> Nukopijuota!';
        button.classList.add('copied');

        if (card) {
          card.style.transform = 'scale(1.02)';
          card.style.boxShadow = '0 8px 24px rgba(5, 150, 105, 0.3)';
          setTimeout(() => {
            card.style.transform = '';
            card.style.boxShadow = '';
          }, 400);
        }

        Toast.success('Nukopijuota ✅');

        setTimeout(() => {
          button.innerHTML = originalHTML;
          button.classList.remove('copied');
        }, 2000);
      } else {
        Toast.error('Nepavyko nukopijuoti. Bandykite pažymėti tekstą rankiniu būdu.');
      }
    }
  };

  // ============================================
  // 5. FUZZY SEARCH with Fuse.js + Autocomplete
  // ============================================
  const FuzzySearch = {
    fuse: null,
    input: null,
    mobileInput: null,
    cards: null,
    depts: null,
    resultsEl: null,
    autocompleteEl: null,
    debounceTimer: null,
    prompts: [],
    selectedIndex: -1,

    init() {
      this.input = document.getElementById('search-prompts');
      this.mobileInput = document.getElementById('mobile-search-input');
      this.cards = document.querySelectorAll('.prompt-card');
      this.depts = document.querySelectorAll('.dept');
      this.resultsEl = document.getElementById('search-results');

      this.buildPromptsArray();

      // Check if Fuse.js is loaded from CDN
      if (typeof Fuse !== 'undefined') {
        this.initFuse();
      } else {
        console.warn('Fuse.js not loaded, using basic search');
      }

      this.createAutocomplete();

      if (this.input) {
        this.input.addEventListener('input', (e) => this.handleInput(e.target.value));
        this.input.addEventListener('focus', () => this.showAutocomplete());
        this.input.addEventListener('blur', () => setTimeout(() => this.hideAutocomplete(), 200));
        this.input.addEventListener('keydown', (e) => this.handleKeydown(e));
      }

      if (this.mobileInput) {
        this.mobileInput.addEventListener('input', () => {
          if (this.input) this.input.value = this.mobileInput.value;
          this.handleInput(this.mobileInput.value);
        });
      }
    },

    buildPromptsArray() {
      this.cards.forEach((card, index) => {
        const id = card.id || `prompt-${index}`;
        card.id = id; // Ensure each card has an ID
        
        const titleEl = card.querySelector('.prompt-card__title');
        const textEl = card.querySelector('.prompt-card__text');
        const keywords = card.getAttribute('data-keywords') || '';
        
        this.prompts.push({
          id: id,
          element: card,
          title: titleEl?.textContent || '',
          text: textEl?.textContent || '',
          keywords: keywords,
          dept: card.closest('.dept')
        });
      });
    },

    initFuse() {
      const options = {
        keys: [
          { name: 'title', weight: 0.4 },
          { name: 'text', weight: 0.3 },
          { name: 'keywords', weight: 0.3 }
        ],
        threshold: 0.35,
        distance: 100,
        minMatchCharLength: 2,
        includeScore: true,
        includeMatches: true,
        ignoreLocation: true
      };

      this.fuse = new Fuse(this.prompts, options);
    },

    createAutocomplete() {
      if (!this.input) return;

      const wrapper = this.input.closest('.search-box');
      if (!wrapper) return;

      this.autocompleteEl = document.createElement('div');
      this.autocompleteEl.className = 'search-autocomplete';
      this.autocompleteEl.setAttribute('role', 'listbox');
      this.autocompleteEl.style.display = 'none';
      wrapper.style.position = 'relative';
      wrapper.appendChild(this.autocompleteEl);
    },

    handleInput(value) {
      clearTimeout(this.debounceTimer);
      
      this.debounceTimer = setTimeout(() => {
        this.performSearch(value);
        this.updateAutocomplete(value);
      }, 150);
    },

    performSearch(query) {
      const trimmed = query.toLowerCase().trim();

      if (trimmed === '') {
        this.showAll();
        this.updateResults(null);
        return;
      }

      let results;
      
      if (this.fuse) {
        // Use Fuse.js fuzzy search
        results = this.fuse.search(trimmed);
        
        this.prompts.forEach(prompt => {
          prompt.element.style.display = 'none';
          this.removeHighlight(prompt.element.querySelector('.prompt-card__title'));
          this.removeHighlight(prompt.element.querySelector('.prompt-card__text'));
        });

        const visibleByDept = {};
        results.forEach(result => {
          const prompt = result.item;
          prompt.element.style.display = '';
          
          if (result.matches) {
            result.matches.forEach(match => {
              if (match.key === 'title') {
                this.highlightMatches(prompt.element.querySelector('.prompt-card__title'), match.indices);
              } else if (match.key === 'text') {
                this.highlightMatches(prompt.element.querySelector('.prompt-card__text'), match.indices);
              }
            });
          }

          if (prompt.dept) {
            const deptId = prompt.dept.getAttribute('data-dept') || prompt.dept.id;
            visibleByDept[deptId] = (visibleByDept[deptId] || 0) + 1;
          }
        });

        this.depts.forEach(dept => {
          const deptId = dept.getAttribute('data-dept') || dept.id;
          dept.style.display = visibleByDept[deptId] > 0 ? '' : 'none';
        });

        this.updateResults(results.length);
      } else {
        // Fallback: basic search
        this.basicSearch(trimmed);
      }

      if (trimmed.length >= 3) {
        UserProgress.addSearchTerm(trimmed);
      }
    },

    basicSearch(query) {
      let visibleCount = 0;
      const visibleByDept = {};

      this.cards.forEach(card => {
        const title = card.querySelector('.prompt-card__title');
        const text = card.querySelector('.prompt-card__text');
        const keywords = card.getAttribute('data-keywords') || '';

        const titleText = title ? title.textContent.toLowerCase() : '';
        const cardText = text ? text.textContent.toLowerCase() : '';
        const matches = titleText.includes(query) || cardText.includes(query) || keywords.toLowerCase().includes(query);

        card.style.display = matches ? '' : 'none';
        
        if (matches) {
          visibleCount++;
          this.highlightText(title, query);
          this.highlightText(text, query);
        } else {
          this.removeHighlight(title);
          this.removeHighlight(text);
        }

        const dept = card.closest('.dept');
        if (dept) {
          const deptId = dept.getAttribute('data-dept') || dept.id;
          if (!visibleByDept[deptId]) visibleByDept[deptId] = 0;
          if (matches) visibleByDept[deptId]++;
        }
      });

      this.depts.forEach(dept => {
        const deptId = dept.getAttribute('data-dept') || dept.id;
        dept.style.display = visibleByDept[deptId] > 0 ? '' : 'none';
      });

      this.updateResults(visibleCount);
    },

    highlightText(element, query) {
      if (!element) return;

      const originalText = element.getAttribute('data-original') || element.textContent;
      element.setAttribute('data-original', originalText);

      const lowerText = originalText.toLowerCase();
      const lowerQuery = query.toLowerCase();
      let result = '';
      let lastIndex = 0;
      let index = lowerText.indexOf(lowerQuery);

      while (index !== -1) {
        result += this.escapeHtml(originalText.slice(lastIndex, index));
        result += '<mark>' + this.escapeHtml(originalText.slice(index, index + query.length)) + '</mark>';
        lastIndex = index + query.length;
        index = lowerText.indexOf(lowerQuery, lastIndex);
      }
      result += this.escapeHtml(originalText.slice(lastIndex));

      element.innerHTML = result;
    },

    highlightMatches(element, indices) {
      if (!element || !indices || indices.length === 0) return;

      const originalText = element.getAttribute('data-original') || element.textContent;
      element.setAttribute('data-original', originalText);

      let result = '';
      let lastIndex = 0;

      const sortedIndices = [...indices].sort((a, b) => a[0] - b[0]);
      
      sortedIndices.forEach(([start, end]) => {
        if (start >= lastIndex) {
          result += this.escapeHtml(originalText.slice(lastIndex, start));
          result += '<mark>' + this.escapeHtml(originalText.slice(start, end + 1)) + '</mark>';
          lastIndex = end + 1;
        }
      });
      
      result += this.escapeHtml(originalText.slice(lastIndex));
      element.innerHTML = result;
    },

    updateAutocomplete(value) {
      if (!this.autocompleteEl) return;
      
      const history = UserProgress.getSearchHistory();
      const trimmed = value.toLowerCase().trim();
      
      const filteredHistory = trimmed 
        ? history.filter(h => h.toLowerCase().includes(trimmed))
        : history;

      const suggestions = [];
      if (trimmed.length >= 2 && this.fuse) {
        const results = this.fuse.search(trimmed, { limit: 3 });
        results.forEach(r => {
          if (!suggestions.includes(r.item.title)) {
            suggestions.push(r.item.title);
          }
        });
      }

      let html = '';
      
      if (filteredHistory.length > 0) {
        html += '<div class="autocomplete-section">';
        html += '<div class="autocomplete-label">🕐 Istorija</div>';
        filteredHistory.forEach((term, i) => {
          html += `<div class="autocomplete-item" data-term="${this.escapeHtml(term)}" data-index="${i}">${this.escapeHtml(term)}</div>`;
        });
        html += '</div>';
      }

      if (suggestions.length > 0) {
        html += '<div class="autocomplete-section">';
        html += '<div class="autocomplete-label">💡 Pasiūlymai</div>';
        suggestions.forEach((term, i) => {
          html += `<div class="autocomplete-item" data-term="${this.escapeHtml(term)}" data-index="${filteredHistory.length + i}">${this.escapeHtml(term)}</div>`;
        });
        html += '</div>';
      }

      this.autocompleteEl.innerHTML = html;
      this.selectedIndex = -1;
      
      this.autocompleteEl.querySelectorAll('.autocomplete-item').forEach(item => {
        item.addEventListener('click', () => {
          this.input.value = item.dataset.term;
          this.performSearch(item.dataset.term);
          this.hideAutocomplete();
        });
      });

      if (html) {
        this.showAutocomplete();
      } else {
        this.hideAutocomplete();
      }
    },

    showAutocomplete() {
      if (this.autocompleteEl && this.autocompleteEl.innerHTML) {
        this.autocompleteEl.style.display = 'block';
      }
    },

    hideAutocomplete() {
      if (this.autocompleteEl) {
        this.autocompleteEl.style.display = 'none';
      }
    },

    handleKeydown(e) {
      const items = this.autocompleteEl?.querySelectorAll('.autocomplete-item');
      
      if (e.key === 'Escape') {
        this.hideAutocomplete();
        this.input.blur();
      } else if (e.key === 'ArrowDown' && items?.length) {
        e.preventDefault();
        this.selectedIndex = Math.min(this.selectedIndex + 1, items.length - 1);
        this.updateSelectedItem(items);
      } else if (e.key === 'ArrowUp' && items?.length) {
        e.preventDefault();
        this.selectedIndex = Math.max(this.selectedIndex - 1, -1);
        this.updateSelectedItem(items);
      } else if (e.key === 'Enter' && this.selectedIndex >= 0 && items?.[this.selectedIndex]) {
        e.preventDefault();
        const term = items[this.selectedIndex].dataset.term;
        this.input.value = term;
        this.performSearch(term);
        this.hideAutocomplete();
      }
    },

    updateSelectedItem(items) {
      items.forEach((item, i) => {
        item.classList.toggle('selected', i === this.selectedIndex);
      });
    },

    showAll() {
      this.prompts.forEach(prompt => {
        prompt.element.style.display = '';
        this.removeHighlight(prompt.element.querySelector('.prompt-card__title'));
        this.removeHighlight(prompt.element.querySelector('.prompt-card__text'));
      });

      this.depts.forEach(dept => {
        dept.style.display = '';
      });
    },

    removeHighlight(element) {
      if (!element) return;
      const original = element.getAttribute('data-original');
      if (original) {
        element.textContent = original;
        element.removeAttribute('data-original');
      }
    },

    escapeHtml(text) {
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    },

    updateResults(count) {
      if (!this.resultsEl) return;

      if (count === null) {
        this.resultsEl.style.display = 'none';
        return;
      }

      this.resultsEl.style.display = 'block';
      
      if (count === 0) {
        this.resultsEl.textContent = 'Nerasta užduočių pagal šį raktažodį';
      } else {
        const word = count === 1 ? 'užduotis' : (count >= 2 && count < 10) ? 'užduotys' : 'užduočių';
        this.resultsEl.textContent = `Rasta ${count} ${word}`;
      }
    },

    focus() {
      if (this.input) {
        this.input.focus();
        this.input.select();
      }
    }
  };

  // ============================================
  // 6. LAZY LOADING - Intersection Observer
  // ============================================
  const LazyLoader = {
    observer: null,

    init() {
      if (!('IntersectionObserver' in window)) {
        document.querySelectorAll('.dept').forEach(dept => {
          dept.classList.add('dept--loaded');
        });
        return;
      }

      this.observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('dept--loaded');
            this.observer.unobserve(entry.target);
          }
        });
      }, {
        rootMargin: '200px 0px',
        threshold: 0.01
      });

      document.querySelectorAll('.dept').forEach(dept => {
        this.observer.observe(dept);
      });
    }
  };

  // ============================================
  // 7. FAVORITES SYSTEM
  // ============================================
  const Favorites = {
    init() {
      document.querySelectorAll('.prompt-card').forEach((card, index) => {
        const promptId = card.id || `prompt-${index}`;
        card.id = promptId;

        const actionsEl = card.querySelector('.prompt-card__actions');
        if (actionsEl && !actionsEl.querySelector('.btn-favorite')) {
          const isFav = UserProgress.isFavorite(promptId);
          const favBtn = document.createElement('button');
          favBtn.className = `btn-favorite ${isFav ? 'is-favorite' : ''}`;
          favBtn.innerHTML = isFav ? '⭐' : '☆';
          favBtn.setAttribute('aria-label', isFav ? 'Pašalinti iš mėgstamų' : 'Pridėti prie mėgstamų');
          favBtn.dataset.promptId = promptId;
          
          actionsEl.appendChild(favBtn);
        }
      });

      document.addEventListener('click', (e) => {
        const favBtn = e.target.closest('.btn-favorite');
        if (!favBtn) return;

        e.preventDefault();
        const card = favBtn.closest('.prompt-card');
        const promptId = favBtn.dataset.promptId;
        const titleEl = card?.querySelector('.prompt-card__title');
        const promptTitle = titleEl?.textContent || 'Nežinomas promptas';

        const isNowFavorite = UserProgress.toggleFavorite(promptId, promptTitle);
        
        favBtn.classList.toggle('is-favorite', isNowFavorite);
        favBtn.innerHTML = isNowFavorite ? '⭐' : '☆';
        favBtn.setAttribute('aria-label', isNowFavorite ? 'Pašalinti iš mėgstamų' : 'Pridėti prie mėgstamų');
        
        Toast.success(isNowFavorite ? 'Pridėta prie mėgstamų ⭐' : 'Pašalinta iš mėgstamų');
        
        UserProgress.updateUI();
      });
    }
  };

  // ============================================
  // 8. NAVIGATION
  // ============================================
  const Navigation = {
    toggle: null,
    navList: null,
    overlay: null,

    init() {
      this.toggle = document.getElementById('nav-toggle');
      this.navList = document.getElementById('primary-nav');
      this.overlay = document.getElementById('nav-overlay');

      if (!this.toggle || !this.navList) return;

      this.toggle.addEventListener('click', () => {
        const expanded = this.toggle.getAttribute('aria-expanded') === 'true';
        this.setExpanded(!expanded);
      });

      this.navList.addEventListener('click', (e) => {
        if (e.target && e.target.closest('a')) {
          this.setExpanded(false);
        }
      });

      if (this.overlay) {
        this.overlay.addEventListener('click', () => {
          this.setExpanded(false);
          this.toggle.focus();
        });
      }
    },

    setExpanded(expanded) {
      this.toggle.setAttribute('aria-expanded', String(expanded));
      if (this.overlay) {
        this.overlay.classList.toggle('active', expanded);
      }
    }
  };

  // ============================================
  // 9. PROGRESS BAR
  // ============================================
  const Progress = {
    bar: null,

    init() {
      this.bar = document.getElementById('progress-bar');
      if (!this.bar) return;

      let ticking = false;
      window.addEventListener('scroll', () => {
        if (!ticking) {
          requestAnimationFrame(() => {
            this.update();
            ticking = false;
          });
          ticking = true;
        }
      }, { passive: true });
      
      this.update();
    },

    update() {
      if (!this.bar) return;
      
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      
      this.bar.style.width = progress + '%';
    }
  };

  // ============================================
  // 10. BACK TO TOP
  // ============================================
  const BackToTop = {
    button: null,
    threshold: 400,

    init() {
      this.button = document.getElementById('back-to-top');
      if (!this.button) return;

      let ticking = false;
      window.addEventListener('scroll', () => {
        if (!ticking) {
          requestAnimationFrame(() => {
            this.toggle();
            ticking = false;
          });
          ticking = true;
        }
      }, { passive: true });
      
      this.button.addEventListener('click', () => this.scrollToTop());
      this.toggle();
    },

    toggle() {
      if (!this.button) return;
      
      if (window.scrollY > this.threshold) {
        this.button.classList.add('visible');
      } else {
        this.button.classList.remove('visible');
      }
    },

    scrollToTop() {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // ============================================
  // 11. MOBILE UI
  // ============================================
  const MobileUI = {
    searchBtn: null,
    sectionsBtn: null,
    searchModal: null,

    init() {
      this.searchBtn = document.getElementById('mobile-search-btn');
      this.sectionsBtn = document.getElementById('mobile-sections-btn');
      this.searchModal = document.getElementById('mobile-search-modal');

      if (this.searchBtn) {
        this.searchBtn.addEventListener('click', () => this.openSearchModal());
      }

      if (this.sectionsBtn) {
        this.sectionsBtn.addEventListener('click', () => this.toggleSections());
      }

      if (this.searchModal) {
        this.searchModal.addEventListener('click', (e) => {
          if (e.target === this.searchModal) {
            this.closeSearchModal();
          }
        });

        const closeBtn = this.searchModal.querySelector('.mobile-search-close');
        if (closeBtn) {
          closeBtn.addEventListener('click', () => this.closeSearchModal());
        }
      }
    },

    openSearchModal() {
      if (!this.searchModal) return;
      this.searchModal.classList.add('active');
      
      const input = document.getElementById('mobile-search-input');
      if (input) {
        setTimeout(() => input.focus(), 100);
      }
    },

    closeSearchModal() {
      if (!this.searchModal) return;
      this.searchModal.classList.remove('active');
    },

    toggleSections() {
      const toggle = document.getElementById('nav-toggle');
      if (toggle) {
        toggle.click();
      }
    }
  };

  window.closeMobileSearch = function() {
    MobileUI.closeSearchModal();
  };

  // ============================================
  // 12. KEYBOARD SHORTCUTS
  // ============================================
  const Keyboard = {
    init() {
      document.addEventListener('keydown', (e) => {
        const target = e.target;
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
          if (e.key === 'Escape') {
            target.blur();
            MobileUI.closeSearchModal();
          }
          return;
        }

        switch (e.key) {
          case '/':
            e.preventDefault();
            FuzzySearch.focus();
            break;
          case 'Escape':
            Navigation.setExpanded(false);
            MobileUI.closeSearchModal();
            break;
        }
      });
    }
  };

  // ============================================
  // 13. FORM VALIDATION
  // ============================================
  const Form = {
    form: null,
    successMsg: null,
    fields: [],
    submitted: false,

    init() {
      this.form = document.getElementById('contact-form');
      this.successMsg = document.getElementById('form-success');
      
      if (!this.form || !this.successMsg) return;

      this.fields = [
        { el: this.form.querySelector('#name'), errorEl: this.form.querySelector('#name-error'), label: 'Vardas' },
        { el: this.form.querySelector('#email'), errorEl: this.form.querySelector('#email-error'), label: 'El. paštas' },
        { el: this.form.querySelector('#message'), errorEl: this.form.querySelector('#message-error'), label: 'Pasiūlymas' }
      ].filter(f => f.el);

      this.form.addEventListener('submit', (e) => this.handleSubmit(e));

      this.fields.forEach(field => {
        field.el.addEventListener('input', () => {
          if (this.submitted) this.validateField(field);
        });
        field.el.addEventListener('blur', () => {
          if (this.submitted) this.validateField(field);
        });
      });
    },

    handleSubmit(e) {
      e.preventDefault();
      this.submitted = true;
      this.clearErrors();

      let firstInvalid = null;
      
      for (const field of this.fields) {
        const invalid = this.validateField(field);
        if (invalid && !firstInvalid) {
          firstInvalid = field.el;
        }
      }

      if (firstInvalid) {
        firstInvalid.focus();
        this.successMsg.classList.remove('active');
        return;
      }

      this.successMsg.classList.add('active');
      this.successMsg.focus();
      this.form.reset();
      this.clearErrors();

      setTimeout(() => {
        this.successMsg.classList.remove('active');
      }, 5000);
    },

    validateField(field) {
      const { el, errorEl, label } = field;

      if (el.validity.valid) {
        el.setAttribute('aria-invalid', 'false');
        if (errorEl) errorEl.textContent = '';
        return false;
      }

      let message = '';
      if (el.validity.valueMissing) {
        message = `Laukas „${label}" yra privalomas.`;
      } else if (el.validity.typeMismatch) {
        message = label === 'El. paštas'
          ? 'Įveskite galiojantį el. pašto adresą.'
          : `Laukas „${label}" turi neteisingą formatą.`;
      } else if (el.validity.tooShort) {
        message = `Laukas „${label}" per trumpas.`;
      } else {
        message = el.validationMessage;
      }

      el.setAttribute('aria-invalid', 'true');
      if (errorEl) errorEl.textContent = message;
      return true;
    },

    clearErrors() {
      for (const { el, errorEl } of this.fields) {
        el.removeAttribute('aria-invalid');
        if (errorEl) errorEl.textContent = '';
      }
    }
  };

  // ============================================
  // INITIALIZATION
  // ============================================
  function init() {
    Toast.init();
    UserProgress.init();
    Navigation.init();
    FuzzySearch.init();
    LazyLoader.init();
    Favorites.init();
    Clipboard.init();
    Progress.init();
    BackToTop.init();
    MobileUI.init();
    Keyboard.init();
    Form.init();

    console.log('📋 Praktinių Promptų Rinkinys v3.0 initialized (P2 Enhanced)');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.PromptuRinkinys = {
    Storage,
    UserProgress,
    Toast,
    Clipboard,
    FuzzySearch,
    Progress,
    BackToTop,
    MobileUI,
    Favorites
  };

})();
