# Web Page Source Viewer

Modern single-page application for viewing formatted source code of web pages.

## Features

- ✨ Clean architecture with vanilla JS without unnecessary dependencies
- 🎨 Modern responsive design
- 🔍 Automatic programming language detection
- 🖼️ Syntax highlighting with Prism.js
- 🔄 SPA routing via History API
- 🛡️ Security with Helmet and URL validation
- 📱 Fully responsive interface

## Installation and Launch

```bash
npm install
npm start
```

The application will be available at: <http://localhost:3000>

## Project Structure

```
web-page-preview/
├── server/
│   └── app.js          # Express server with API
├── public/
│   ├── index.html      # Main HTML page
│   ├── app.js          # Frontend logic and routing
│   └── styles.css      # Application styles
└── package.json        # Dependencies and scripts
```

## How to Use

1. Open the main page
2. Enter a web page URL (e.g., <https://example.com>)
3. Click "View Source" or press Enter
4. View the formatted source code with syntax highlighting

## Technologies

- **Backend**: Node.js + Express
- **Frontend**: Vanilla JavaScript (ES6+)
- **Code highlighting**: Prism.js
- **Security**: Helmet, CORS
- **Styles**: CSS3 with Flexbox/Grid

## API Endpoints

### GET /api/fetch-source?url=<URL>

Fetches and formats the source code of the specified page.

**Parameters:**

- `url` - Web page URL for analysis

**Response:**

```json
{
  "url": "https://example.com",
  "language": "html",
  "content": "<!DOCTYPE html>...",
  "formattedCode": "<span class=\"token\">...",
  "size": 1234,
  "contentType": "text/html"
}
```
