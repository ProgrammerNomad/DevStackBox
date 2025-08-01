/**
 * Internationalization (i18n) Configuration for DevStackBox
 * Manages multi-language support using i18next
 */

class I18nManager {
    constructor() {
        this.currentLanguage = 'en';
        this.supportedLanguages = {
            en: { name: 'English', flag: '🇺🇸' },
            hi: { name: 'हिंदी', flag: '🇮🇳' }
        };
        this.isInitialized = false;
    }

    async init() {
        try {
            console.log('Initializing i18next...');
            
            // Check if i18next is available
            if (typeof window.i18next === 'undefined') {
                console.error('i18next not loaded');
                return false;
            }

            // Get references to the libraries
            const i18next = window.i18next;
            const httpBackend = window.i18nextHttpBackend;
            const languageDetector = window.i18nextBrowserLanguageDetector;

            console.log('i18next available:', !!i18next);
            console.log('HttpBackend available:', !!httpBackend);
            console.log('LanguageDetector available:', !!languageDetector);
            
            if (!httpBackend || !languageDetector) {
                console.error('i18next plugins not loaded properly');
                return false;
            }
            
            // Initialize i18next
            await i18next
                .use(httpBackend)
                .use(languageDetector)
                .init({
                    fallbackLng: 'en',
                    debug: false,
                    supportedLngs: Object.keys(this.supportedLanguages),
                    
                    // Detection options
                    detection: {
                        order: ['localStorage', 'navigator', 'htmlTag'],
                        caches: ['localStorage'],
                        lookupLocalStorage: 'devstackbox-language'
                    },

                    // Backend options
                    backend: {
                        loadPath: './locales/{{lng}}/{{ns}}.json'
                    },

                    // Interpolation options
                    interpolation: {
                        escapeValue: false // not needed for DOM manipulation
                    }
                });

            this.currentLanguage = i18next.language;
            this.isInitialized = true;
            console.log('i18next initialized with language:', this.currentLanguage);
            
            // Setup language switcher event listeners
            this.setupLanguageSwitcher();
            
            // Update all text content
            this.updateContent();
            
            // Update language switcher UI
            this.updateLanguageSwitcher();
            
            return true;
        } catch (error) {
            console.error('Failed to initialize i18next:', error);
            return false;
        }
    }

    setupLanguageSwitcher() {
        const languageSwitcher = document.getElementById('languageSwitcher');
        const languageDropdown = document.getElementById('languageDropdown');
        const languageOptions = document.querySelectorAll('.language-option');

        if (!languageSwitcher || !languageDropdown) {
            console.warn('Language switcher elements not found');
            return;
        }

        // Toggle dropdown
        languageSwitcher.addEventListener('click', (e) => {
            e.stopPropagation();
            languageDropdown.classList.toggle('hidden');
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!languageSwitcher.contains(e.target) && !languageDropdown.contains(e.target)) {
                languageDropdown.classList.add('hidden');
            }
        });

        // Handle language selection
        languageOptions.forEach(option => {
            option.addEventListener('click', async (e) => {
                e.preventDefault();
                const selectedLang = option.getAttribute('data-lang');
                if (selectedLang && selectedLang !== this.currentLanguage) {
                    await this.changeLanguage(selectedLang);
                }
                languageDropdown.classList.add('hidden');
            });
        });
    }

    async changeLanguage(lng) {
        try {
            console.log('Changing language to:', lng);
            
            if (!this.isInitialized) {
                console.error('i18next not initialized');
                return;
            }

            await window.i18next.changeLanguage(lng);
            this.currentLanguage = lng;
            this.updateContent();
            this.updateLanguageSwitcher();
            
            // Update document language attribute
            document.documentElement.lang = lng;
            
            console.log('Language changed to:', lng);
            
            // Show notification
            if (window.devStackBox && window.devStackBox.showNotification) {
                const langName = this.supportedLanguages[lng].name;
                window.devStackBox.showNotification(`Language changed to ${langName}`, 'success', 3000);
            }
        } catch (error) {
            console.error('Failed to change language:', error);
        }
    }

    updateContent() {
        if (!this.isInitialized) return;

        // Update page title
        document.title = this.t('app.title');

        // Update all elements with data-i18n attribute
        const elements = document.querySelectorAll('[data-i18n]');
        
        elements.forEach(element => {
            const key = element.getAttribute('data-i18n');
            
            // Handle special attribute cases like [title], [placeholder], etc.
            if (key.startsWith('[') && key.includes(']')) {
                const match = key.match(/\[([^\]]+)\](.+)/);
                if (match) {
                    const attribute = match[1];
                    const translationKey = match[2];
                    const translation = this.t(translationKey);
                    element.setAttribute(attribute, translation);
                }
            } else {
                const translation = this.t(key);
                if (element.tagName === 'INPUT' && (element.type === 'text' || element.type === 'search')) {
                    element.placeholder = translation;
                } else {
                    element.textContent = translation;
                }
            }
        });

        // Update elements with data-i18n-html attribute (for HTML content)
        const htmlElements = document.querySelectorAll('[data-i18n-html]');
        htmlElements.forEach(element => {
            const key = element.getAttribute('data-i18n-html');
            element.innerHTML = this.t(key);
        });

        // Update dynamic content that might have been created after initial load
        this.updateDynamicContent();
    }

    updateDynamicContent() {
        // Update any dynamically created content that needs translation
        // This can be extended as needed for specific UI components
        
        // Update modal titles, button texts, etc.
        const modals = document.querySelectorAll('.modal-content');
        modals.forEach(modal => {
            const elementsInModal = modal.querySelectorAll('[data-i18n]');
            elementsInModal.forEach(element => {
                const key = element.getAttribute('data-i18n');
                if (key && !key.startsWith('[')) {
                    element.textContent = this.t(key);
                }
            });
        });
    }

    updateLanguageSwitcher() {
        const switcher = document.getElementById('languageSwitcher');
        if (switcher) {
            const currentLang = this.supportedLanguages[this.currentLanguage];
            const flagSpan = switcher.querySelector('.language-flag');
            const textSpan = switcher.querySelector('.language-text');
            
            if (flagSpan) flagSpan.textContent = currentLang.flag;
            if (textSpan) textSpan.textContent = currentLang.name;
        }

        // Update active state in dropdown
        const languageOptions = document.querySelectorAll('.language-option');
        languageOptions.forEach(option => {
            const lang = option.getAttribute('data-lang');
            if (lang === this.currentLanguage) {
                option.classList.add('bg-blue-50', 'text-blue-700');
            } else {
                option.classList.remove('bg-blue-50', 'text-blue-700');
            }
        });
    }

    t(key, options = {}) {
        if (!this.isInitialized) {
            console.warn('i18next not initialized yet, returning key:', key);
            return key;
        }
        return window.i18next.t(key, options);
    }

    getCurrentLanguage() {
        return this.currentLanguage;
    }

    getSupportedLanguages() {
        return this.supportedLanguages;
    }

    isReady() {
        return this.isInitialized;
    }
}

// Create global instance
window.i18nManager = new I18nManager();
