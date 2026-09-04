/**
 * MyProxy Server
 * A complete browser proxy stack similar to Helios Browser
 * Runs on port 3000 with Express
 * 
 * Routes:
 *   GET /              - Health check
 *   GET /proxy?url=... - Proxy endpoint
 */

const express = require('express');
const fetch = require('node-fetch');
const { HttpsProxyAgent } = require('https-proxy-agent');
const url = require('url');
const path = require('path');

const {
  ProxyError,
  validateURL,
  sanitizeURL,
  handleFetchError,
  generateErrorHTML
} = require('./utils/errorHandler');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve frontend static files
const frontendPath = path.join(__dirname, '../frontend');
app.use(express.static(frontendPath));

/**
 * Browser-like user agent
 * Prevents blocking from CDNs and ad networks
 */
const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

/**
 * Squid proxy configuration (optional)
 * Set SQUID_PROXY env var to use: http://localhost:3128
 */
const SQUID_PROXY = process.env.SQUID_PROXY || null;

/**
 * Health check endpoint
 */
app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    message: 'MyProxy Server is running',
    version: '1.0.0',
    squid: SQUID_PROXY ? 'enabled' : 'disabled'
  });
});

/**
 * Main proxy endpoint
 * GET /proxy?url=<target_url>
 */
app.get('/proxy', async (req, res) => {
  try {
    const targetURL = req.query.url;
    
    // Validate URL parameter exists
    if (!targetURL) {
      return res.status(400).json({
        error: 'Missing URL parameter',
        message: 'Please provide a URL in the query string: /proxy?url=https://example.com'
      });
    }
    
    // Sanitize URL
    const sanitized = sanitizeURL(targetURL);
    
    // Validate URL format
    if (!validateURL(sanitized)) {
      return res.status(400).json({
        error: 'Invalid URL format',
        message: 'Please provide a valid HTTP or HTTPS URL'
      });
    }
    
    console.log(`[Proxy Request] ${sanitized}`);
    
    // Configure fetch options
    const fetchOptions = {
      method: 'GET',
      headers: {
        'User-Agent': USER_AGENT,
        'Accept': '*/*',
        'Accept-Encoding': 'gzip, deflate',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      },
      timeout: 15000, // 15 second timeout
      redirect: 'follow'
    };
    
    // Add Squid proxy if configured
    if (SQUID_PROXY) {
      console.log(`[Squid] Routing through ${SQUID_PROXY}`);
      fetchOptions.agent = new HttpsProxyAgent(SQUID_PROXY);
    }
    
    // Fetch the target URL
    const response = await fetch(sanitized, fetchOptions);
    
    // Check response status
    if (!response.ok) {
      console.warn(`[Response] Status ${response.status} for ${sanitized}`);
    }
    
    // Get content type
    const contentType = response.headers.get('content-type') || 'text/html; charset=utf-8';
    
    // Get response body
    const buffer = await response.buffer();
    
    // Set response headers
    res.set({
      'Content-Type': contentType,
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'X-Proxy-By': 'MyProxy/1.0.0',
      'X-Proxied-URL': sanitized,
      'X-Content-Type-Options': 'nosniff'
    });
    
    // Send response
    res.send(buffer);
    
  } catch (error) {
    // Handle errors
    const proxyError = handleFetchError(error);
    
    // Log error
    console.error(`[Error] ${proxyError.message}`);
    if (proxyError.originalError) {
      console.error(`[Original Error] ${proxyError.originalError.message}`);
    }
    
    // Send error response
    const errorHTML = generateErrorHTML(proxyError);
    res.status(proxyError.statusCode)
      .set('Content-Type', 'text/html; charset=utf-8')
      .send(errorHTML);
  }
});

/**
 * Search API endpoint
 * Supports: Google, DuckDuckGo, Bing, Brave Search
 */
app.get('/search', async (req, res) => {
  try {
    const query = req.query.q;
    const engine = req.query.engine || 'google';
    
    if (!query) {
      return res.status(400).json({
        error: 'Missing search query',
        message: 'Please provide a search query: /search?q=<query>&engine=<engine>'
      });
    }
    
    let searchURL;
    const encodedQuery = encodeURIComponent(query);
    
    switch (engine.toLowerCase()) {
      case 'duckduckgo':
        searchURL = `https://duckduckgo.com/?q=${encodedQuery}`;
        break;
      case 'bing':
        searchURL = `https://www.bing.com/search?q=${encodedQuery}`;
        break;
      case 'brave':
        searchURL = `https://search.brave.com/search?q=${encodedQuery}`;
        break;
      case 'google':
      default:
        searchURL = `https://www.google.com/search?q=${encodedQuery}`;
        break;
    }
    
    // Redirect to proxy endpoint
    res.redirect(`/proxy?url=${encodeURIComponent(searchURL)}`);
    
  } catch (error) {
    const proxyError = handleFetchError(error);
    const errorHTML = generateErrorHTML(proxyError);
    res.status(proxyError.statusCode)
      .set('Content-Type', 'text/html; charset=utf-8')
      .send(errorHTML);
  }
});

/**
 * 404 handler
 */
app.use((req, res) => {
  res.status(404).json({
    error: 'Not found',
    message: 'This endpoint does not exist',
    availableEndpoints: [
      'GET / (health check)',
      'GET /proxy?url=<url> (proxy endpoint)',
      'GET /search?q=<query>&engine=<engine> (search endpoint)'
    ]
  });
});

/**
 * Global error handler
 */
app.use((err, req, res, next) => {
  console.error('[Server Error]', err);
  
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'production' 
      ? 'An unexpected error occurred' 
      : err.message
  });
});

/**
 * Start server
 */
app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════╗
║   MyProxy Server Started           ║
╚════════════════════════════════════╝

🌐 Server:        http://localhost:${PORT}
📡 Proxy Route:    GET /proxy?url=<url>
🔍 Search Route:   GET /search?q=<query>&engine=<engine>
🦑 Squid Proxy:    ${SQUID_PROXY ? 'Enabled (' + SQUID_PROXY + ')' : 'Disabled'}
📂 Frontend:       Served from ${path.join(__dirname, '../frontend')}

Supported search engines:
  - google (default)
  - duckduckgo
  - bing
  - brave

Example requests:
  http://localhost:${PORT}/?url=https://example.com
  http://localhost:${PORT}/search?q=nodejs&engine=google

  `);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('[Server] Received SIGTERM, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('[Server] Received SIGINT, shutting down gracefully');
  process.exit(0);
});

module.exports = app;
