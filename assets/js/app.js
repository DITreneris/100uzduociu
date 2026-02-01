/**
 * Praktinių Promptų Rinkinys - JavaScript
 * Versija: 2.0
 * 
 * Moduliai:
 * 1. Storage - localStorage wrapper su error handling
 * 2. Toast - pranešimų sistema
 * 3. Clipboard - kopijavimo funkcionalumas
 * 4. Navigation - mobile meniu
 * 5. Search - paieška su highlight
 * 6. Progress - scroll progress bar
 * 7. BackToTop - grįžimo mygtukas
 * 8. MobileUI - mobile bottom bar ir modal
 * 9. Keyboard - klaviatūros shortcuts
 * 10. Form - formos validacija
 */

(function() {
  'use strict';

  // ============================================
  // 1. STORAGE - localStorage wrapper
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
  // 2. TOAST - pranešimų sistema
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
      
      // Clear previous timeout
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
  // 3. CLIPBOARD - kopijavimo funkcionalumas
  // ============================================
  const Clipboard = {
    async copy(text) {
      const cleanText = text.trim().replace(/\s+/g, ' ');

      // Modern Clipboard API
      if (navigator.clipboard && window.isSecureContext) {
        try {
          await navigator.clipboard.writeText(cleanText);
          return { success: true };
        } catch (err) {
          // Fall through to fallback
        }
      }

      // Fallback for older browsers or non-HTTPS
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
        textarea.setSelectionRange(0, 99999); // For mobile
        const success = document.execCommand('copy');
        return { success };
      } catch (e) {
        return { success: false, error: e };
      } finally {
        document.body.removeChild(textarea);
      }
    },

    init() {
      document.querySelectorAll('.btn-copy').forEach(button => {
        button.addEventListener('click', async (e) => {
          e.preventDefault();
          
          // Get text to copy
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
            // Visual feedback on button
            const originalHTML = button.innerHTML;
            button.innerHTML = '<span>✓</span> Nukopijuota!';
            button.classList.add('copied');

            // Card animation
            const card = button.closest('.prompt-card');
            if (card) {
              card.style.transform = 'scale(1.02)';
              card.style.boxShadow = '0 8px 24px rgba(5, 150, 105, 0.3)';
              setTimeout(() => {
                card.style.transform = '';
                card.style.boxShadow = '';
              }, 400);
            }

            // Toast
            Toast.success('Nukopijuota ✅');

            // Reset button
            setTimeout(() => {
              button.innerHTML = originalHTML;
              button.classList.remove('copied');
            }, 2000);
          } else {
            Toast.error('Nepavyko nukopijuoti. Bandykite pažymėti tekstą rankiniu būdu.');
          }
        });
      });
    }
  };

  // ============================================
  // 4. NAVIGATION - mobile meniu
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

      // Focus trap for mobile menu
      this.navList.addEventListener('keydown', (e) => {
        if (e.key !== 'Tab') return;
        if (window.innerWidth >= 640) return;

        const links = Array.from(this.navList.querySelectorAll('a'));
        const firstLink = links[0];
        const lastLink = links[links.length - 1];

        if (e.shiftKey && document.activeElement === firstLink) {
          e.preventDefault();
          lastLink.focus();
        } else if (!e.shiftKey && document.activeElement === lastLink) {
          e.preventDefault();
          firstLink.focus();
        }
      });
    },

    setExpanded(expanded) {
      this.toggle.setAttribute('aria-expanded', String(expanded));
      if (this.overlay) {
        this.overlay.classList.toggle('active', expanded);
      }
    }
  };

  // ============================================
  // 5. SEARCH - paieška su highlight
  // ============================================
  const Search = {
    input: null,
    mobileInput: null,
    cards: null,
    depts: null,
    resultsEl: null,

    init() {
      this.input = document.getElementById('search-prompts');
      this.mobileInput = document.getElementById('mobile-search-input');
      this.cards = document.querySelectorAll('.prompt-card');
      this.depts = document.querySelectorAll('.dept');
      this.resultsEl = document.getElementById('search-results');

      if (this.input) {
        this.input.addEventListener('input', () => this.handleSearch(this.input.value));
      }

      // Sync mobile search
      if (this.mobileInput && this.input) {
        this.mobileInput.addEventListener('input', () => {
          this.input.value = this.mobileInput.value;
          this.handleSearch(this.mobileInput.value);
        });
      }
    },

    handleSearch(value) {
      const query = value.toLowerCase().trim();

      if (query === '') {
        this.showAll();
        this.updateResults(null);
        return;
      }

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

        // Track by department
        const dept = card.closest('.dept');
        if (dept) {
          const deptId = dept.getAttribute('data-dept') || dept.id;
          if (!visibleByDept[deptId]) visibleByDept[deptId] = 0;
          if (matches) visibleByDept[deptId]++;
        }
      });

      // Show/hide departments
      this.depts.forEach(dept => {
        const deptId = dept.getAttribute('data-dept') || dept.id;
        dept.style.display = visibleByDept[deptId] > 0 ? '' : 'none';
      });

      this.updateResults(visibleCount);
    },

    showAll() {
      this.cards.forEach(card => {
        card.style.display = '';
        const title = card.querySelector('.prompt-card__title');
        const text = card.querySelector('.prompt-card__text');
        this.removeHighlight(title);
        this.removeHighlight(text);
      });

      this.depts.forEach(dept => {
        dept.style.display = '';
      });
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
  // 6. PROGRESS - scroll progress bar
  // ============================================
  const Progress = {
    bar: null,

    init() {
      this.bar = document.getElementById('progress-bar');
      if (!this.bar) return;

      window.addEventListener('scroll', () => this.update(), { passive: true });
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
  // 7. BACK TO TOP - grįžimo mygtukas
  // ============================================
  const BackToTop = {
    button: null,
    threshold: 400,

    init() {
      this.button = document.getElementById('back-to-top');
      if (!this.button) return;

      window.addEventListener('scroll', () => this.toggle(), { passive: true });
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
  // 8. MOBILE UI - bottom bar ir modal
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

      // Close modal on backdrop click
      if (this.searchModal) {
        this.searchModal.addEventListener('click', (e) => {
          if (e.target === this.searchModal) {
            this.closeSearchModal();
          }
        });
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

  // Global function for inline onclick
  window.closeMobileSearch = function() {
    MobileUI.closeSearchModal();
  };

  // ============================================
  // 9. KEYBOARD - klaviatūros shortcuts
  // ============================================
  const Keyboard = {
    init() {
      document.addEventListener('keydown', (e) => {
        // Skip if in input field
        const target = e.target;
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
          // Only handle Escape in inputs
          if (e.key === 'Escape') {
            target.blur();
            MobileUI.closeSearchModal();
          }
          return;
        }

        switch (e.key) {
          case '/':
            e.preventDefault();
            Search.focus();
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
  // 10. FORM - formos validacija
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

      // Success
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
    Clipboard.init();
    Navigation.init();
    Search.init();
    Progress.init();
    BackToTop.init();
    MobileUI.init();
    Keyboard.init();
    Form.init();

    // Log initialization
    console.log('📋 Praktinių Promptų Rinkinys v2.0 initialized');
  }

  // Run when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Export for potential external use
  window.PromptuRinkinys = {
    Storage,
    Toast,
    Clipboard,
    Search,
    Progress,
    BackToTop,
    MobileUI
  };

})();
