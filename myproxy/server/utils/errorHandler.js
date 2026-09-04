/**
 * Error Handler Utility
 * Handles all proxy-related errors gracefully
 */

class ProxyError extends Error {
  constructor(message, statusCode = 500, originalError = null) {
    super(message);
    this.name = 'ProxyError';
    this.statusCode = statusCode;
    this.originalError = originalError;
  }
}

/**
 * Validate URL format and protocol
 * @param {string} url - URL to validate
 * @returns {boolean} - True if valid
 */
function validateURL(url) {
  try {
    const parsed = new URL(url);
    // Only allow http and https
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      throw new Error('Invalid protocol');
    }
    // Check for valid hostname
    if (!parsed.hostname) {
      throw new Error('Invalid hostname');
    }
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Sanitize URL input
 * @param {string} url - Raw URL input
 * @returns {string} - Sanitized URL with protocol
 */
function sanitizeURL(url) {
  // Remove whitespace
  url = url.trim();
  
  // Add protocol if missing
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    // Default to https
    url = 'https://' + url;
  }
  
  // Remove any dangerous characters
  url = url.replace(/[<>"{}|\\^`\s]/g, '');
  
  return url;
}

/**
 * Handle fetch errors
 * @param {Error} error - Error object
 * @returns {ProxyError} - Formatted proxy error
 */
function handleFetchError(error) {
  console.error('[Proxy Error]', error.message);
  
  if (error.code === 'ECONNREFUSED') {
    return new ProxyError(
      'Connection refused - target server unreachable',
      503,
      error
    );
  }
  
  if (error.code === 'ENOTFOUND') {
    return new ProxyError(
      'Domain not found - invalid URL or DNS failure',
      404,
      error
    );
  }
  
  if (error.code === 'ETIMEDOUT') {
    return new ProxyError(
      'Request timeout - target server too slow',
      504,
      error
    );
  }
  
  if (error.code === 'ECONNRESET') {
    return new ProxyError(
      'Connection reset by target server',
      502,
      error
    );
  }
  
  if (error.message.includes('certificate')) {
    return new ProxyError(
      'SSL certificate error - security verification failed',
      525,
      error
    );
  }
  
  return new ProxyError(
    `Proxy error: ${error.message}`,
    500,
    error
  );
}

/**
 * Generate error HTML response
 * @param {ProxyError} error - Proxy error object
 * @returns {string} - HTML error page
 */
function generateErrorHTML(error) {
  const statusCode = error.statusCode || 500;
  const message = error.message;
  
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Proxy Error ${statusCode}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 20px;
        }
        
        .error-container {
            background: white;
            border-radius: 10px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            padding: 40px;
            max-width: 600px;
            text-align: center;
        }
        
        .error-code {
            font-size: 72px;
            font-weight: bold;
            color: #667eea;
            margin-bottom: 20px;
        }
        
        .error-title {
            font-size: 28px;
            color: #333;
            margin-bottom: 15px;
        }
        
        .error-message {
            font-size: 16px;
            color: #666;
            margin-bottom: 30px;
            line-height: 1.6;
        }
        
        .error-suggestions {
            background: #f5f5f5;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 30px;
            text-align: left;
        }
        
        .error-suggestions h3 {
            color: #333;
            margin-bottom: 10px;
            font-size: 16px;
        }
        
        .error-suggestions ul {
            list-style: none;
            padding-left: 0;
        }
        
        .error-suggestions li {
            color: #666;
            font-size: 14px;
            margin-bottom: 8px;
            padding-left: 20px;
            position: relative;
        }
        
        .error-suggestions li:before {
            content: "→";
            position: absolute;
            left: 0;
            color: #667eea;
        }
        
        .back-button {
            display: inline-block;
            padding: 12px 30px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            text-decoration: none;
            border-radius: 5px;
            font-size: 16px;
            transition: transform 0.2s;
        }
        
        .back-button:hover {
            transform: translateY(-2px);
        }
    </style>
</head>
<body>
    <div class="error-container">
        <div class="error-code">${statusCode}</div>
        <div class="error-title">Unable to Load Page</div>
        <div class="error-message">${message}</div>
        
        <div class="error-suggestions">
            <h3>What you can try:</h3>
            <ul>
                <li>Check your internet connection</li>
                <li>Verify the URL is correct</li>
                <li>Try again in a few moments</li>
                <li>Check if the target site is down</li>
                <li>Disable browser extensions</li>
            </ul>
        </div>
        
        <button class="back-button" onclick="window.history.back()">Go Back</button>
    </div>
</body>
</html>`;
}

module.exports = {
  ProxyError,
  validateURL,
  sanitizeURL,
  handleFetchError,
  generateErrorHTML
};
