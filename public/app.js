class WebPagePreview {
    constructor() {
        this.elements = {
            homeView: document.getElementById('home-view'),
            sourceView: document.getElementById('source-view'),
            urlInput: document.getElementById('url-input'),
            submitBtn: document.getElementById('submit-btn'),
            backBtn: document.getElementById('back-btn'),
            loading: document.getElementById('loading'),
            errorMessage: document.getElementById('error-message'),
            errorText: document.getElementById('error-text'),
            retryBtn: document.getElementById('retry-btn'),
            sourceContainer: document.getElementById('source-container'),
            sourceCode: document.getElementById('source-code'),
            sourceUrl: document.getElementById('source-url'),
            sourceMeta: document.getElementById('source-meta')
        };
        
        this.currentUrl = '';
        this.init();
    }
    
    init() {
        this.bindEvents();
        this.handleInitialRoute();
    }
    
    bindEvents() {
        this.elements.submitBtn.addEventListener('click', () => this.handleSubmit());
        this.elements.urlInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.handleSubmit();
        });
        this.elements.backBtn.addEventListener('click', () => this.navigateHome());
        this.elements.retryBtn.addEventListener('click', () => this.fetchSourceCode(this.currentUrl));
        
        window.addEventListener('popstate', () => this.handleRoute());
    }
    
    handleInitialRoute() {
        const path = window.location.pathname;
        if (path.startsWith('/view/')) {
            const encodedUrl = path.substring(6);
            try {
                const decodedUrl = decodeURIComponent(encodedUrl);
                this.currentUrl = decodedUrl;
                this.showSourceView();
                this.fetchSourceCode(decodedUrl);
            } catch (error) {
                console.error('Invalid URL encoding:', error);
                this.navigateHome();
            }
        } else {
            this.showHomeView();
        }
    }
    
    handleRoute() {
        const path = window.location.pathname;
        if (path === '/' || path === '') {
            this.showHomeView();
        } else if (path.startsWith('/view/')) {
            this.handleInitialRoute();
        }
    }
    
    handleSubmit() {
        const url = this.elements.urlInput.value.trim();
        if (!url) {
            this.showError('Please enter a URL');
            return;
        }
        
        if (!this.isValidUrl(url)) {
            this.showError('Please enter a valid URL (must start with http:// or https://)');
            return;
        }
        
        this.navigateToView(url);
    }
    
    isValidUrl(string) {
        try {
            const url = new URL(string);
            return url.protocol === 'http:' || url.protocol === 'https:';
        } catch (_) {
            return false;
        }
    }
    
    navigateToView(url) {
        this.currentUrl = url;
        const encodedUrl = encodeURIComponent(url);
        const newPath = `/view/${encodedUrl}`;
        
        history.pushState({ url }, '', newPath);
        this.showSourceView();
        this.fetchSourceCode(url);
    }
    
    navigateHome() {
        history.pushState({}, '', '/');
        this.showHomeView();
        this.elements.urlInput.value = '';
        this.currentUrl = '';
    }
    
    showHomeView() {
        this.elements.homeView.classList.remove('hidden');
        this.elements.sourceView.classList.add('hidden');
        this.elements.urlInput.focus();
    }
    
    showSourceView() {
        this.elements.homeView.classList.add('hidden');
        this.elements.sourceView.classList.remove('hidden');
        this.hideError();
        this.hideSourceCode();
    }
    
    showLoading() {
        this.elements.loading.style.display = 'block';
        this.hideError();
        this.hideSourceCode();
        this.elements.submitBtn.disabled = true;
    }
    
    hideLoading() {
        this.elements.loading.style.display = 'none';
        this.elements.submitBtn.disabled = false;
    }
    
    showError(message) {
        this.elements.errorText.textContent = message;
        this.elements.errorMessage.classList.add('show');
        this.hideLoading();
        this.hideSourceCode();
    }
    
    hideError() {
        this.elements.errorMessage.classList.remove('show');
    }
    
    showSourceCode(data) {
        this.elements.sourceUrl.textContent = data.url;
        this.elements.sourceMeta.textContent = 
            `${data.language} • ${this.formatFileSize(data.size)} • ${data.contentType}`;
        
        this.elements.sourceCode.innerHTML = data.formattedCode;
        this.elements.sourceCode.className = `language-${data.language}`;
        
        this.elements.sourceContainer.classList.add('show');
        this.hideLoading();
        this.hideError();
    }
    
    hideSourceCode() {
        this.elements.sourceContainer.classList.remove('show');
    }
    
    formatFileSize(bytes) {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    }
    
    async fetchSourceCode(url) {
        this.showLoading();
        
        try {
            const apiUrl = `/api/fetch-source?url=${encodeURIComponent(url)}`;
            const response = await fetch(apiUrl);
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || `HTTP ${response.status}`);
            }
            
            this.showSourceCode(data);
            
        } catch (error) {
            console.error('Fetch error:', error);
            this.showError(
                error.message || 'Failed to fetch the source code. Please check the URL and try again.'
            );
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new WebPagePreview();
});