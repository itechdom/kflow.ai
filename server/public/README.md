# Public

This directory contains static files that are served directly to clients.

## Purpose

- Serve static assets (HTML, CSS, JavaScript, images)
- Host frontend files if serving a monolith application
- Store publicly accessible resources

## Examples

- `index.html` - Main HTML file
- `css/` - Stylesheets
- `js/` - Client-side JavaScript
- `images/` - Image assets
- `fonts/` - Web fonts
- `favicon.ico` - Site favicon

## Express Configuration

To serve static files in Express:

```javascript
// In app.js
app.use(express.static('public'));
```

This allows files in `/public` to be accessed directly:
- `/public/index.html` → `http://localhost:3001/index.html`
- `/public/css/style.css` → `http://localhost:3001/css/style.css`

## When to use

- When serving static frontend files from the same server
- When hosting public assets (images, fonts, etc.)
- When building a monolithic application (server + frontend together)

**Note:** For modern applications, consider using a separate frontend build process and CDN for static assets.

