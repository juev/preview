const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const fetch = require('node-fetch').default;
const Prism = require('prismjs');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet({
  contentSecurityPolicy: false
}));
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

function isValidUrl(string) {
  try {
    const url = new URL(string);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch (_) {
    return false;
  }
}

function detectLanguage(url, content, responseContentType = '') {
  const urlPath = url.toLowerCase();
  const contentType = content.substring(0, 200).toLowerCase();
  const httpContentType = responseContentType.toLowerCase();
  
  if (httpContentType.includes('application/json') || httpContentType.includes('text/json')) {
    return 'json';
  }
  
  try {
    JSON.parse(content);
    if (contentType.trim().startsWith('{') || contentType.trim().startsWith('[')) {
      return 'json';
    }
  } catch (e) {}
  
  if (urlPath.includes('.js') || contentType.includes('javascript')) return 'javascript';
  if (urlPath.includes('.css') || contentType.includes('text/css')) return 'css';
  if (urlPath.includes('.json')) return 'json';
  if (urlPath.includes('.xml') || contentType.includes('<?xml')) return 'xml';
  if (contentType.includes('<!doctype html') || contentType.includes('<html')) return 'html';
  
  return 'markup';
}

function formatCode(content, language) {
  try {
    if (!Prism.languages[language]) {
      require(`prismjs/components/prism-${language}`);
    }
    return Prism.highlight(content, Prism.languages[language], language);
  } catch (error) {
    return Prism.highlight(content, Prism.languages.markup, 'markup');
  }
}

app.get('/api/fetch-source', async (req, res) => {
  const { url } = req.query;
  
  if (!url) {
    return res.status(400).json({ error: 'URL parameter is required' });
  }
  
  if (!isValidUrl(url)) {
    return res.status(400).json({ error: 'Invalid URL format' });
  }
  
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; WebPagePreview/1.0)'
      },
      timeout: 10000
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const content = await response.text();
    const responseContentType = response.headers.get('content-type') || '';
    const language = detectLanguage(url, content, responseContentType);
    const formattedCode = formatCode(content, language);
    
    res.json({
      url,
      language,
      content,
      formattedCode,
      size: content.length,
      contentType: response.headers.get('content-type') || 'unknown'
    });
    
  } catch (error) {
    console.error('Fetch error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch URL', 
      details: error.message 
    });
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});