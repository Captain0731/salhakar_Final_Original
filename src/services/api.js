// API Service for Legal Platform - Complete Integration
// Primary server (pr) - First priority
const API_BASE_URL_PR = 'https://operantly-unchattering-ernie.ngrok-free.dev';

// Alternative server (ad) - Fallback
const API_BASE_URL_AD = 'https://unquestioned-gunnar-medially.ngrok-free.dev';

// Server configuration with identifiers
const API_SERVERS = [
  { url: API_BASE_URL_PR, id: 'pr', name: 'Primary Server' },
  { url: API_BASE_URL_AD, id: 'ad', name: 'Alternative Server' }
];

// Additional fallback URLs in case both primary servers fail
const FALLBACK_URLS = [
  'https://752ce8b44879.ngrok-free.app',
  'http://localhost:8000', // Local development fallback
  'https://your-production-api.com' // Production fallback
];

class ApiService {
  constructor() {
    // Start with primary server (pr)
    this.baseURL = API_BASE_URL_PR;
    this.currentServerId = 'pr'; // Track which server is currently active
    this.currentUrlIndex = 0;
    this.accessToken = localStorage.getItem('access_token');
    this.refreshToken = localStorage.getItem('refresh_token');
  }

  // Method to test API connectivity and switch URLs if needed
  async testConnectivity() {
    console.log('🔧 Testing API connectivity...');
    
    // Try primary servers first (pr, then ad)
    for (const server of API_SERVERS) {
      try {
        console.log(`🔄 Testing ${server.id} (${server.name}): ${server.url}`);
        const response = await fetch(`${server.url}/health`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'ngrok-skip-browser-warning': 'true'
          },
          signal: AbortSignal.timeout(5000) // 5 second timeout
        });
        
        if (response.ok) {
          console.log(`✅ ${server.id} server connectivity successful`);
          this.baseURL = server.url;
          this.currentServerId = server.id;
          return { success: true, serverId: server.id, serverName: server.name };
        } else {
          console.log(`⚠️ ${server.id} server returned status ${response.status}`);
        }
      } catch (error) {
        console.log(`❌ ${server.id} server connectivity error:`, error.message);
      }
    }
    
    // Try additional fallback URLs
    for (let i = 0; i < FALLBACK_URLS.length; i++) {
      try {
        console.log(`🔄 Trying fallback URL ${i + 1}: ${FALLBACK_URLS[i]}`);
        const fallbackResponse = await fetch(`${FALLBACK_URLS[i]}/health`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'ngrok-skip-browser-warning': 'true'
          },
          signal: AbortSignal.timeout(3000) // 3 second timeout for fallbacks
        });
        
        if (fallbackResponse.ok) {
          console.log(`✅ Fallback URL ${i + 1} successful`);
          this.baseURL = FALLBACK_URLS[i];
          this.currentServerId = 'fallback';
          this.currentUrlIndex = i;
          return { success: true, serverId: 'fallback', serverName: FALLBACK_URLS[i] };
        }
      } catch (fallbackError) {
        console.log(`❌ Fallback URL ${i + 1} failed:`, fallbackError.message);
      }
    }
    
    console.log('❌ All API endpoints failed');
    return { success: false, serverId: null, serverName: null };
  }

  // Get current server information
  getCurrentServerInfo() {
    return {
      url: this.baseURL,
      serverId: this.currentServerId,
      serverName: API_SERVERS.find(s => s.id === this.currentServerId)?.name || 'Fallback Server'
    };
  }

  // Helper method to format phone number for Twilio
  formatPhoneNumber(phoneNumber) {
    // Remove all non-digit characters
    const cleaned = phoneNumber.replace(/\D/g, '');
    
    // If it starts with 0, replace with +91 (India country code)
    if (cleaned.startsWith('0')) {
      return '+91' + cleaned.substring(1);
    }
    
    // If it starts with 91 and is 12 digits, add +
    if (cleaned.startsWith('91') && cleaned.length === 12) {
      return '+' + cleaned;
    }
    
    // If it's 10 digits, assume India and add +91
    if (cleaned.length === 10) {
      return '+91' + cleaned;
    }
    
    // If it already has +, return as is
    if (phoneNumber.startsWith('+')) {
      return phoneNumber;
    }
    
    // Default: add +91 for India
    return '+91' + cleaned;
  }

  // Helper method to get auth headers
  // According to API docs: Authorization: Bearer <access_token>
  getAuthHeaders() {
    // Check all possible token storage keys
    let token = localStorage.getItem('access_token') || 
                localStorage.getItem('accessToken') || 
                localStorage.getItem('token') ||
                this.accessToken;
    
    // Clear and return null if token is invalid/empty
    if (!token || token === 'null' || token === 'undefined') {
      return {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true'
      };
    }
    
    // Check if token is expired (but don't auto-refresh here to avoid infinite loops)
    // Auto-refresh will happen in handleResponse when we get a 401
    
    return {
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true',
      'Authorization': `Bearer ${token}` // API docs format: Bearer <access_token>
    };
  }

  // Helper method to get headers without authentication
  getPublicHeaders() {
    return {
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true'
    };
  }

  // Generic fetch method with automatic fallback between pr and ad servers
  async fetchWithFallback(url, options = {}) {
    const endpoint = url.startsWith('http') ? url : `${this.baseURL}${url}`;
    const isFullUrl = url.startsWith('http');
    
    // Try primary server (pr) first
    for (const server of API_SERVERS) {
      try {
        const fullUrl = isFullUrl ? url : `${server.url}${url}`;
        console.log(`🔄 Attempting request to ${server.id} (${server.name}): ${fullUrl}`);
        
        const response = await fetch(fullUrl, {
          ...options,
          headers: {
            ...options.headers,
            'ngrok-skip-browser-warning': 'true'
          },
          signal: options.signal || AbortSignal.timeout(10000) // 10 second timeout
        });
        
        if (response.ok) {
          // Update current server if successful
          this.baseURL = server.url;
          this.currentServerId = server.id;
          console.log(`✅ Request successful from ${server.id} (${server.name})`);
          
          // Add server source to response
          let data;
          try {
            data = await response.json();
          } catch (e) {
            // If response is not JSON, return as text
            data = await response.text();
          }
          
          if (data && typeof data === 'object') {
            data.db_source = server.id;
            data.server_source = server.id;
            data.server_name = server.name;
          }
          
          return { response, data, serverId: server.id };
        } else {
          console.log(`⚠️ ${server.id} server returned status ${response.status}, trying next server...`);
          
          // For authentication endpoints (login, signup), don't try other servers on 400/401 errors
          // These indicate invalid credentials, not server issues
          const isAuthEndpoint = url.includes('/auth/login') || url.includes('/auth/signup');
          if (isAuthEndpoint && (response.status === 400 || response.status === 401 || response.status === 403)) {
            let errorData = {};
            try {
              errorData = await response.json();
            } catch (e) {
              errorData = { error: `HTTP ${response.status}: ${response.statusText}` };
            }
            console.log(`❌ Authentication error from ${server.id} server (${response.status}), not trying fallback`);
            return { response, data: errorData, serverId: server.id, error: true };
          }
          
          // For other 401 errors (non-auth endpoints), don't try other servers
          if (response.status === 401) {
            let errorData = {};
            try {
              errorData = await response.json();
            } catch (e) {
              errorData = { error: `HTTP ${response.status}: ${response.statusText}` };
            }
            return { response, data: errorData, serverId: server.id, error: true };
          }
          
          // For other errors, continue to next server
        }
      } catch (error) {
        console.log(`❌ ${server.id} server failed: ${error.message}, trying next server...`);
        // Continue to next server
        continue;
      }
    }
    
    // If both primary servers failed, try additional fallbacks
    for (const fallbackUrl of FALLBACK_URLS) {
      try {
        const fullUrl = isFullUrl ? url : `${fallbackUrl}${url}`;
        console.log(`🔄 Trying fallback URL: ${fullUrl}`);
        
        const response = await fetch(fullUrl, {
          ...options,
          headers: {
            ...options.headers,
            'ngrok-skip-browser-warning': 'true'
          },
          signal: options.signal || AbortSignal.timeout(5000)
        });
        
        if (response.ok) {
          this.baseURL = fallbackUrl;
          this.currentServerId = 'fallback';
          console.log(`✅ Fallback URL successful: ${fallbackUrl}`);
          
          let data;
          try {
            data = await response.json();
          } catch (e) {
            data = await response.text();
          }
          
          if (data && typeof data === 'object') {
            data.db_source = 'fallback';
            data.server_source = 'fallback';
          }
          
          return { response, data, serverId: 'fallback' };
        }
      } catch (error) {
        console.log(`❌ Fallback URL failed: ${error.message}`);
        continue;
      }
    }
    
    // All servers failed
    throw new Error('All API servers are unavailable');
  }

  // Helper method to handle API responses with token refresh
  // According to API docs: 401 means "Not authenticated" or "Token has expired"
  async handleResponse(response, serverId = null) {
    if (response.ok) {
      const data = await response.json();
      // Add server source information if available
      if (data && typeof data === 'object' && serverId) {
        data.db_source = serverId;
        data.server_source = serverId;
      }
      return data;
    } else if (response.status === 401) {
      // According to API docs: 401 means "Not authenticated" or "Token has expired"
      console.warn('⚠️ Received 401 Unauthorized - token may be expired');
      
      // Try to refresh token if we have a refresh token
      const refreshToken = localStorage.getItem('refresh_token') || this.refreshToken;
      if (refreshToken) {
        try {
          console.log('🔄 Attempting to refresh expired token...');
          await this.refreshTokens();
          // Retry the original request with new token
          console.log('🔄 Retrying request with refreshed token...');
          return await this.retryRequest(response.url, response);
        } catch (refreshError) {
          // Refresh failed - according to API docs, redirect to login
          console.error('❌ Token refresh failed:', refreshError.message);
          this.clearAllTokens();
          // Don't redirect immediately - let the calling code handle it
          // This allows for better error handling in UI
          throw new Error('Session expired. Please login again.');
        }
      } else {
        // No refresh token available - according to API docs, authentication required
        console.warn('⚠️ No refresh token available, authentication required');
        this.clearAllTokens();
        throw new Error('Authentication required. Please login.');
      }
    } else {
      let errorMessage = 'API request failed';
      try {
        const errorData = await response.json();
        
        // Handle different error response formats
        if (errorData.detail) {
          if (typeof errorData.detail === 'string') {
            errorMessage = errorData.detail;
          } else if (Array.isArray(errorData.detail)) {
            // Handle validation errors array
            errorMessage = errorData.detail.map(err => err.msg || err.message || JSON.stringify(err)).join(', ');
          } else if (typeof errorData.detail === 'object') {
            errorMessage = JSON.stringify(errorData.detail);
          }
        } else if (errorData.message) {
          if (typeof errorData.message === 'string') {
            errorMessage = errorData.message;
          } else {
            errorMessage = JSON.stringify(errorData.message);
          }
        } else if (errorData.error) {
          errorMessage = typeof errorData.error === 'string' ? errorData.error : JSON.stringify(errorData.error);
        } else {
          errorMessage = JSON.stringify(errorData);
        }
      } catch (parseError) {
        // If response is not JSON (e.g., HTML error page)
        if (response.status === 404) {
          errorMessage = `Resource not found (404)`;
        } else if (response.status === 500) {
          errorMessage = `Server error (500)`;
        } else if (response.status === 403) {
          errorMessage = `Access forbidden (403)`;
        } else if (response.status === 401) {
          errorMessage = `Authentication required (401)`;
        } else {
          errorMessage = `HTTP ${response.status}: ${response.statusText || 'Unknown error'}`;
        }
      }
      
      throw new Error(errorMessage);
    }
  }

  // Helper method to retry request with new token
  async retryRequest(url, originalResponse) {
    const newToken = localStorage.getItem('access_token');
    const response = await fetch(url, {
      method: originalResponse.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
        'Authorization': `Bearer ${newToken}`
      }
    });
    return await this.handleResponse(response);
  }

  // Helper method to clear all tokens
  clearAllTokens() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('token');
    localStorage.removeItem('token_type');
    localStorage.removeItem('token_expires_at');
    localStorage.removeItem('user');
    this.accessToken = null;
    this.refreshToken = null;
  }

  // Authentication APIs
  // According to API docs: Signup includes auto-login (token returned immediately)
  async signup(userData) {
    // Format the mobile number before sending
    const formattedUserData = {
      ...userData,
      mobile: this.formatPhoneNumber(userData.mobile)
    };
    
    try {
      const { response, data: result, serverId, error: hasError } = await this.fetchWithFallback('/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formattedUserData)
      });

      // Check if there was an error
      if (hasError || !response.ok) {
        let errorMessage = 'Signup failed';
        if (result && result.detail) {
          errorMessage = typeof result.detail === 'string' ? result.detail : JSON.stringify(result.detail);
        }
        console.error(`❌ Signup failed from ${serverId} server:`, errorMessage);
        throw new Error(errorMessage);
      }

      // According to API docs, signup returns access_token immediately (auto-login)
      if (result && result.access_token) {
        // Store tokens (same as login)
        this.accessToken = result.access_token;
        if (result.refresh_token) {
          this.refreshToken = result.refresh_token;
          localStorage.setItem('refresh_token', result.refresh_token);
        }
        localStorage.setItem('access_token', result.access_token);
        localStorage.setItem('token_type', result.token_type || 'bearer');
        
        // Store token expiration time (30 minutes)
        const expirationTime = Date.now() + (30 * 60 * 1000);
        localStorage.setItem('token_expires_at', expirationTime.toString());
        
        console.log(`✅ Signup successful from ${serverId} server, auto-logged in`);
        console.log(`📋 Token expires in 30 minutes (at ${new Date(expirationTime).toLocaleString()})`);
      }

      return result;
    } catch (error) {
      console.error('❌ Signup failed on all servers:', error);
      throw error;
    }
  }

  async login(email, password) {
    console.log('🔐 Login attempt for:', email);
    
    // Validate inputs according to API documentation
    if (!email || !email.trim()) {
      throw new Error('Email is required');
    }
    if (!password || !password.trim()) {
      throw new Error('Password is required');
    }
    
    try {
      const { response, data: result, serverId, error: hasError } = await this.fetchWithFallback('/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      // Check if there was an error in the response
      if (hasError || !response.ok) {
        // Extract error message from response (API returns 401 for invalid credentials)
        let errorMessage = 'Invalid email or password';
        if (result && result.detail) {
          errorMessage = typeof result.detail === 'string' ? result.detail : JSON.stringify(result.detail);
        } else if (result && result.message) {
          errorMessage = typeof result.message === 'string' ? result.message : JSON.stringify(result.message);
        } else if (result && result.error) {
          errorMessage = typeof result.error === 'string' ? result.error : JSON.stringify(result.error);
        }
        console.error(`❌ Login failed from ${serverId} server:`, errorMessage);
        throw new Error(errorMessage);
      }

      // Verify that access_token exists - this is critical for authentication
      // According to API docs, response should have: access_token, token_type: "bearer", user
      if (!result || !result.access_token) {
        console.error('❌ Login response missing access_token');
        throw new Error('Invalid credentials. Please check your email and password.');
      }

      // Store tokens according to API documentation format
      // API returns: access_token, token_type: "bearer"
      this.accessToken = result.access_token;
      // Note: API documentation doesn't explicitly mention refresh_token in login response
      // But we'll store it if provided, otherwise we'll handle token expiration via 401 errors
      if (result.refresh_token) {
        this.refreshToken = result.refresh_token;
        localStorage.setItem('refresh_token', result.refresh_token);
      }
      
      localStorage.setItem('access_token', result.access_token);
      localStorage.setItem('token_type', result.token_type || 'bearer');
      
      // Store token expiration time (30 minutes according to API docs)
      const expirationTime = Date.now() + (30 * 60 * 1000); // 30 minutes
      localStorage.setItem('token_expires_at', expirationTime.toString());
      
      console.log(`✅ Login successful from ${serverId} server, tokens stored`);
      console.log(`📋 Token expires in 30 minutes (at ${new Date(expirationTime).toLocaleString()})`);
      
      return result;
    } catch (error) {
      // Clear any tokens if login failed
      this.clearAllTokens();
      console.error('❌ Login failed on all servers:', error.message);
      
      // Re-throw with user-friendly message based on API documentation
      if (error.message.includes('Invalid') || error.message.includes('credentials') || error.message.includes('password')) {
        throw error; // Already has a good message
      } else if (error.message.includes('401') || error.message.includes('Unauthorized')) {
        throw new Error('Invalid email or password. Please try again.');
      } else if (error.message.includes('Network') || error.message.includes('fetch')) {
        throw new Error('Network error. Please check your connection and try again.');
      } else {
        throw new Error(error.message || 'Login failed. Please check your credentials.');
      }
    }
  }

  async logout() {
    console.log('🔐 Logging out...');
    
    try {
      // Use fallback logic for logout
      const { response, data: result, serverId, error: hasError } = await this.fetchWithFallback('/auth/logout', {
        method: 'POST',
        headers: this.getAuthHeaders()
      });

      // Even if logout fails on server, clear local tokens
      this.clearAllTokens();
      
      if (hasError || !response.ok) {
        console.warn(`⚠️ Logout request failed from ${serverId} server, but tokens cleared locally`);
        return { message: 'Logged out locally', sessions_closed: 0 };
      }
      
      console.log(`✅ Logout successful from ${serverId} server, tokens cleared`);
      return result;
    } catch (error) {
      // Even if logout fails, clear local tokens
      this.clearAllTokens();
      console.warn('⚠️ Logout request failed, but tokens cleared locally');
      return { message: 'Logged out locally', sessions_closed: 0 };
    }
  }

  // Check if token is expired (30 minutes according to API docs)
  isTokenExpired() {
    const expiresAt = localStorage.getItem('token_expires_at');
    if (!expiresAt) {
      return true; // No expiration time stored, assume expired
    }
    const expirationTime = parseInt(expiresAt, 10);
    const now = Date.now();
    // Add 1 minute buffer to refresh before actual expiration
    return now >= (expirationTime - 60000);
  }

  async refreshTokens() {
    // Check if we have a refresh token
    const refreshToken = localStorage.getItem('refresh_token') || this.refreshToken;
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    console.log('🔄 Refreshing tokens...');
    
    try {
      // Use fallback logic for token refresh
      const { response, data: result, serverId, error: hasError } = await this.fetchWithFallback('/auth/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ refresh_token: refreshToken })
      });

      // Check if refresh was successful
      if (hasError || !response.ok) {
        let errorMessage = 'Token refresh failed';
        if (result && result.detail) {
          errorMessage = typeof result.detail === 'string' ? result.detail : JSON.stringify(result.detail);
        }
        console.error(`❌ Token refresh failed from ${serverId} server:`, errorMessage);
        throw new Error(errorMessage);
      }

      // Verify that access_token exists
      if (!result || !result.access_token) {
        throw new Error('Token refresh response missing access_token');
      }

      // Store new tokens
      this.accessToken = result.access_token;
      if (result.refresh_token) {
        this.refreshToken = result.refresh_token;
        localStorage.setItem('refresh_token', result.refresh_token);
      }
      localStorage.setItem('access_token', result.access_token);
      localStorage.setItem('token_type', result.token_type || 'bearer');
      
      // Update expiration time (30 minutes from now)
      const expirationTime = Date.now() + (30 * 60 * 1000);
      localStorage.setItem('token_expires_at', expirationTime.toString());
      
      console.log(`✅ Tokens refreshed successfully from ${serverId} server`);
      console.log(`📋 New token expires in 30 minutes (at ${new Date(expirationTime).toLocaleString()})`);
      
      return result;
    } catch (error) {
      console.error('❌ Token refresh failed on all servers:', error.message);
      // Clear tokens if refresh fails
      this.clearAllTokens();
      throw error;
    }
  }

  async getSessions() {
    const response = await fetch(`${this.baseURL}/auth/sessions`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });

    return await this.handleResponse(response);
  }

  async deleteSession(sessionId) {
    const response = await fetch(`${this.baseURL}/auth/sessions/${sessionId}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    });

    return await this.handleResponse(response);
  }

  async sendVerificationCode(phoneNumber) {
    const formattedPhone = this.formatPhoneNumber(phoneNumber);
    const response = await fetch(`${this.baseURL}/auth/send-verification-code`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true'
      },
      body: JSON.stringify({ phone_number: formattedPhone })
    });

    return await this.handleResponse(response);
  }

  async verifyPhone(phoneNumber, code) {
    const formattedPhone = this.formatPhoneNumber(phoneNumber);
    const response = await fetch(`${this.baseURL}/auth/verify-phone`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true'
      },
      body: JSON.stringify({ phone_number: formattedPhone, code })
    });

    return await this.handleResponse(response);
  }

  // Enhanced session management
  async getActiveSessions() {
    const response = await fetch(`${this.baseURL}/auth/sessions`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });

    return await this.handleResponse(response);
  }

  async terminateAllSessions() {
    const sessions = await this.getActiveSessions();
    const sessionPromises = sessions.sessions
      .filter(session => session.is_active)
      .map(session => this.deleteSession(session.session_id));
    
    await Promise.all(sessionPromises);
    return { message: 'All sessions terminated' };
  }

  // Enhanced authentication status check
  async checkAuthStatus() {
    try {
      const response = await fetch(`${this.baseURL}/auth/sessions`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });
      
      if (response.ok) {
        return { authenticated: true, data: await response.json() };
      } else {
        return { authenticated: false, error: 'Not authenticated' };
      }
    } catch (error) {
      return { authenticated: false, error: error.message };
    }
  }

  // Judgements API (public access) - Enhanced with real API calls and fallback
  async getJudgements(params = {}) {
    console.log('🌐 getJudgements called with params:', params);
    
    try {
      console.log('🌐 Making real API call for judgments');
      const queryParams = new URLSearchParams();
      
      // Add pagination parameters
      if (params.limit) queryParams.append('limit', params.limit);
      if (params.offset) queryParams.append('offset', params.offset);
      
      // Add cursor-based pagination parameters for High Court
      if (params.cursor_decision_date) queryParams.append('cursor_decision_date', params.cursor_decision_date);
      if (params.cursor_id) queryParams.append('cursor_id', params.cursor_id);
      
      // Track if we need highlights (for search, title, judge, or CNR filters)
      let needsHighlight = false;
      
      // Add search and filter parameters
      if (params.search) {
        queryParams.append('search', params.search);
        needsHighlight = true;
      }
      if (params.title) {
        queryParams.append('title', params.title);
        needsHighlight = true;
      }
      if (params.cnr) {
        queryParams.append('cnr', params.cnr);
        needsHighlight = true;
      }
      // Support both highCourt (for backward compatibility) and court_name (preferred)
      if (params.court_name) {
        queryParams.append('court_name', params.court_name);
      } else if (params.highCourt) {
        queryParams.append('court_name', params.highCourt);
      }
      if (params.judge) {
        queryParams.append('judge', params.judge);
        needsHighlight = true;
      }
      
      // Enable highlights when search, title, judge, or CNR filters are used (Elasticsearch feature)
      if (needsHighlight && params.highlight !== false) {
        queryParams.append('highlight', 'true');
      }
      if (params.decisionDateFrom || params.decision_date_from) {
        // Keep date in YYYY-MM-DD format as per API documentation
        const dateValue = params.decisionDateFrom || params.decision_date_from;
        // Validate date format before sending
        if (dateValue && dateValue.trim() !== '' && /^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
        queryParams.append('decision_date_from', dateValue);
        }
      }
      if (params.decision_date_to) {
        // Validate date format before sending
        if (params.decision_date_to && params.decision_date_to.trim() !== '' && /^\d{4}-\d{2}-\d{2}$/.test(params.decision_date_to)) {
        queryParams.append('decision_date_to', params.decision_date_to);
        }
      }
      if (params.year) {
        queryParams.append('year', params.year);
      }
      if (params.disposal_nature) {
        queryParams.append('disposal_nature', params.disposal_nature);
      }
      if (params.decision_date) {
        queryParams.append('decision_date', params.decision_date);
      }
      
      // Elasticsearch features
      if (params.include_total_count !== undefined) {
        queryParams.append('include_total_count', params.include_total_count.toString());
      }
      // Highlight is already handled above for search, but also support explicit highlight param
      if (params.highlight && !params.search) {
        queryParams.append('highlight', 'true');
      }
      
      // Note: Using /api/judgements endpoint for High Court judgments as per API documentation
      const endpoint = `/api/judgements?${queryParams.toString()}`;
      console.log('🌐 API endpoint:', endpoint);
      
      // Check authentication token
      const token = localStorage.getItem('access_token') || localStorage.getItem('accessToken') || localStorage.getItem('token');
      console.log('🌐 Auth token available:', !!token);
      
      const headers = {
        'Content-Type': 'application/json'
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      console.log('🌐 Request headers:', headers);
      
      // Use fetchWithFallback for automatic server switching
      const { data, serverId } = await this.fetchWithFallback(endpoint, {
        method: 'GET',
        headers: headers
      });
      
      console.log(`🌐 Response received from ${serverId} server:`, data);
      
      // Map API field names to frontend expected field names
      if (data.data && Array.isArray(data.data)) {
        data.data = data.data.map(judgment => ({
          ...judgment,
          pdf_url: judgment.pdf_link || judgment.pdf_url, // Map pdf_link to pdf_url
          // Preserve Elasticsearch metadata if present
          relevance_score: judgment.relevance_score,
          highlights: judgment.highlights
        }));
      }
      
      // Preserve search_info if present (Elasticsearch metadata)
      if (data.search_info) {
        console.log('🌐 Elasticsearch search info:', data.search_info);
      }
      
      console.log('🌐 Mapped API response:', data);
      return data;
      
    } catch (error) {
      console.error('🌐 API call failed on all servers:', error);
      console.error('🌐 Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      
      // Throw error instead of returning mock data
      throw error;
    }
  }

  // Judgements Autocomplete API - for search suggestions
  async getJudgementsAutocomplete(query, limit = 10) {
    console.log('🔍 API: getJudgementsAutocomplete called with:', { query, limit });
    
    // Don't call API for very short queries
    if (!query || query.trim().length < 2) {
      console.log('⚠️ API: Query too short, returning empty');
      return { suggestions: [], suggestions_detailed: [], count: 0 };
    }

    try {
      const queryParams = new URLSearchParams({
        q: query.trim().substring(0, 200), // Limit query length
        limit: limit.toString()
      });

      const url = `/api/judgements/autocomplete?${queryParams}`;
      console.log('🌐 API: Calling URL:', url);

      // fetchWithFallback returns { response, data, serverId }
      const result = await this.fetchWithFallback(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
      });

      console.log('📡 API: Result:', result);

      // Handle error case
      if (result.error) {
        console.warn('⚠️ API: Autocomplete returned error');
        return { suggestions: [], suggestions_detailed: [], count: 0 };
      }

      // Check if we have valid data
      const data = result.data;
      if (!data) {
        console.warn('⚠️ API: No data received from autocomplete');
        return { suggestions: [], suggestions_detailed: [], count: 0 };
      }

      console.log('✅ API: Autocomplete data received:', data);
      
      return {
        suggestions: data.suggestions || [],
        suggestions_detailed: data.suggestions_detailed || [],
        count: data.count || 0
      };
    } catch (error) {
      // Silently fail - autocomplete is not critical
      console.error('❌ API: Autocomplete error:', error.message);
      return { suggestions: [], suggestions_detailed: [], count: 0 };
    }
  }

  // Mock data for judgments when API is unavailable
  getMockJudgementsData(params = {}) {
    const mockData = [
      {
        id: 1,
        case_number: "WP(C) 1234/2023",
        cnr: "DLCT01-123456-2023",
        petitioner: "Rajesh Kumar vs State of Delhi",
        respondent: "State of Delhi",
        court_name: "Delhi High Court",
        judge: "Hon'ble Justice A.K. Singh",
        decision_date: "2023-12-15",
        pdf_url: "https://example.com/judgment1.pdf",
        summary: "This case deals with fundamental rights and constitutional validity of certain provisions.",
        keywords: ["fundamental rights", "constitutional law", "writ petition"],
        category: "Constitutional Law"
      },
      {
        id: 2,
        case_number: "CRL.A. 567/2023",
        cnr: "DLCT01-789012-2023",
        petitioner: "State vs Mohan Lal",
        respondent: "Mohan Lal",
        court_name: "Delhi High Court",
        judge: "Hon'ble Justice B.K. Sharma",
        decision_date: "2023-12-10",
        pdf_url: "https://example.com/judgment2.pdf",
        summary: "Criminal appeal regarding bail application and evidence admissibility.",
        keywords: ["criminal law", "bail", "evidence"],
        category: "Criminal Law"
      },
      {
        id: 3,
        case_number: "CIVIL 890/2023",
        cnr: "DLCT01-345678-2023",
        petitioner: "ABC Company vs XYZ Corporation",
        respondent: "XYZ Corporation",
        court_name: "Delhi High Court",
        judge: "Hon'ble Justice C.K. Verma",
        decision_date: "2023-12-05",
        pdf_url: "https://example.com/judgment3.pdf",
        summary: "Commercial dispute regarding contract breach and damages.",
        keywords: ["contract law", "commercial dispute", "damages"],
        category: "Commercial Law"
      },
      {
        id: 4,
        case_number: "FAM 234/2023",
        cnr: "DLCT01-901234-2023",
        petitioner: "Priya Sharma vs Ravi Sharma",
        respondent: "Ravi Sharma",
        court_name: "Delhi High Court",
        judge: "Hon'ble Justice D.K. Gupta",
        decision_date: "2023-11-28",
        pdf_url: "https://example.com/judgment4.pdf",
        summary: "Family law matter regarding divorce and child custody.",
        keywords: ["family law", "divorce", "custody"],
        category: "Family Law"
      },
      {
        id: 5,
        case_number: "LAB 456/2023",
        cnr: "DLCT01-567890-2023",
        petitioner: "Workers Union vs Management",
        respondent: "ABC Industries Ltd.",
        court_name: "Delhi High Court",
        judge: "Hon'ble Justice E.K. Singh",
        decision_date: "2023-11-20",
        pdf_url: "https://example.com/judgment5.pdf",
        summary: "Labor dispute regarding wage revision and working conditions.",
        keywords: ["labor law", "wages", "working conditions"],
        category: "Labor Law"
      }
    ];

    // Apply search filter if provided
    let filteredData = mockData;
    if (params.search) {
      const searchTerm = params.search.toLowerCase();
      filteredData = mockData.filter(item => 
        item.petitioner.toLowerCase().includes(searchTerm) ||
        item.case_number.toLowerCase().includes(searchTerm) ||
        item.summary.toLowerCase().includes(searchTerm) ||
        item.keywords.some(keyword => keyword.toLowerCase().includes(searchTerm))
      );
    }

    // Apply title filter if provided
    if (params.title) {
      const titleTerm = params.title.toLowerCase();
      filteredData = filteredData.filter(item => 
        item.petitioner.toLowerCase().includes(titleTerm) ||
        item.case_number.toLowerCase().includes(titleTerm)
      );
    }

    // Apply court filter if provided
    if (params.highCourt) {
      filteredData = filteredData.filter(item => 
        item.court_name.toLowerCase().includes(params.highCourt.toLowerCase())
      );
    }

    // Apply judge filter if provided
    if (params.judge) {
      filteredData = filteredData.filter(item => 
        item.judge.toLowerCase().includes(params.judge.toLowerCase())
      );
    }

    // Apply CNR filter if provided
    if (params.cnr) {
      filteredData = filteredData.filter(item => 
        item.cnr.toLowerCase().includes(params.cnr.toLowerCase())
      );
    }

    // Apply decision date from filter if provided
    if (params.decisionDateFrom) {
      // Convert from yyyy-mm-dd to dd-mm-yyyy format for comparison
      const dateParts = params.decisionDateFrom.split('-');
      let compareDate;
      if (dateParts.length === 3) {
        // If it's in yyyy-mm-dd format, convert to Date object
        compareDate = new Date(params.decisionDateFrom);
      } else {
        // If it's already in dd-mm-yyyy format, parse it correctly
        const [day, month, year] = params.decisionDateFrom.split('-');
        compareDate = new Date(year, month - 1, day);
      }
      
      filteredData = filteredData.filter(item => 
        new Date(item.decision_date) >= compareDate
      );
    }

    // Apply pagination
    const limit = params.limit || 10;
    const offset = params.offset || 0;
    const paginatedData = filteredData.slice(offset, offset + limit);

    return {
      data: paginatedData,
      pagination_info: {
        total_count: filteredData.length,
        current_page: Math.floor(offset / limit) + 1,
        page_size: limit,
        has_more: (offset + limit) < filteredData.length,
        offset: offset,
        limit: limit
      },
      message: "Mock data - API unavailable"
    };
  }

  // Supreme Court Judgements Elasticsearch Search API
  async searchSupremeCourtJudgements(params = {}) {
    const { q, size = 10, offset = 0, judge, petitioner, respondent, cnr, year } = params;
    
    const queryParams = new URLSearchParams();
    
    // Full-text search query (optional - if omitted, returns all judgments)
    if (q) queryParams.append('q', q);
    
    // Pagination parameters (required for offset-based pagination)
    queryParams.append('size', size.toString());
    queryParams.append('offset', offset.toString());
    
    // Field-specific filters with boosting
    if (judge) queryParams.append('judge', judge);
    if (petitioner) queryParams.append('petitioner', petitioner);
    if (respondent) queryParams.append('respondent', respondent);
    if (cnr) queryParams.append('cnr', cnr);
    if (year) queryParams.append('year', year.toString());

    const url = `${this.baseURL}/api/supreme-court-judgements/search?${queryParams.toString()}`;
    console.log('🔍 Supreme Court ES Search URL:', url);
    console.log('🔍 Supreme Court ES Search Params:', params);

    // Try with auth first, then without if 401 (for public access)
    let response;
    let headers = this.getAuthHeaders();

    try {
      response = await fetch(url, {
        method: 'GET',
        headers: headers
      });

      // If 401, try without auth (public endpoint)
      if (response.status === 401) {
        console.log('⚠️ Got 401, trying without authentication...');
        headers = this.getPublicHeaders();
        response = await fetch(url, {
          method: 'GET',
          headers: headers
        });
      }
    } catch (fetchError) {
      console.error('❌ Network error fetching Supreme Court search:', fetchError);
      throw new Error('Failed to fetch: Network error. Please check your connection and try again.');
    }

    const data = await this.handleResponse(response);
    
    // Debug: Log raw response
    console.log('🔍 Supreme Court ES Raw Response:', {
      success: data?.success,
      query: data?.query,
      total_results: data?.total_results,
      returned_results: data?.returned_results,
      resultsCount: data?.results?.length,
      pagination_info: data?.pagination_info,
      firstResultStructure: data?.results?.[0] ? Object.keys(data.results[0]) : null,
      firstResultHighlight: data?.results?.[0]?.highlight,
      fullResponse: data
    });

    return data;
  }

  // Supreme Court Judgements API (public access) - Regular endpoint with cursor-based pagination
  async getSupremeCourtJudgements(params = {}) {
    console.log('🌐 getSupremeCourtJudgements called with params:', params);
    
    try {
      console.log('🌐 Making real API call for Supreme Court judgments');
      const queryParams = new URLSearchParams();
      
      // Add pagination parameters (cursor-based, not offset-based)
      if (params.limit) queryParams.append('limit', params.limit.toString());
      
      // Add cursor-based pagination for Supreme Court (single cursor: cursor_id)
      if (params.cursor_id) queryParams.append('cursor_id', params.cursor_id.toString());
      
      // Add filter parameters (partial match filters for regular endpoint)
      if (params.title) queryParams.append('title', params.title);
      if (params.cnr) queryParams.append('cnr', params.cnr);
      if (params.judge) queryParams.append('judge', params.judge);
      if (params.petitioner) queryParams.append('petitioner', params.petitioner);
      if (params.respondent) queryParams.append('respondent', params.respondent);
      if (params.year) queryParams.append('year', params.year.toString());
      if (params.disposal_nature) queryParams.append('disposal_nature', params.disposal_nature);
      if (params.decision_date) queryParams.append('decision_date', params.decision_date);
      if (params.decisionDateFrom || params.decision_date_from) {
        // Keep date in YYYY-MM-DD format as per API documentation
        const dateValue = params.decisionDateFrom || params.decision_date_from;
        queryParams.append('decision_date_from', dateValue);
      }
      if (params.decisionDateTo || params.decision_date_to) {
        const dateValue = params.decisionDateTo || params.decision_date_to;
        queryParams.append('decision_date_to', dateValue);
      }
      
      const endpoint = `/api/supreme-court-judgements?${queryParams.toString()}`;
      console.log('🌐 Supreme Court API endpoint:', endpoint);
      
      // Check authentication token
      const token = localStorage.getItem('access_token') || localStorage.getItem('accessToken') || localStorage.getItem('token');
      console.log('🌐 Auth token available:', !!token);
      
      const headers = {
        'Content-Type': 'application/json'
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      console.log('🌐 Request headers:', headers);
      
      // Use fetchWithFallback for automatic server switching
      const { data, serverId } = await this.fetchWithFallback(endpoint, {
        method: 'GET',
        headers: headers
      });
      
      console.log(`🌐 Supreme Court response received from ${serverId} server:`, data);
      
      // Handle null or undefined response
      if (!data) {
        console.warn('🌐 Supreme Court API returned null/undefined response');
        return {
          data: [],
          pagination_info: { has_more: false },
          next_cursor: null
        };
      }
      
      // Ensure data has a data property
      if (!data.data) {
        console.warn('🌐 Supreme Court API response missing data field, initializing empty array');
        data.data = [];
      }
      
      // Map API field names to frontend expected field names
      if (data.data && Array.isArray(data.data)) {
        data.data = data.data.map(judgment => ({
          ...judgment,
          pdf_url: judgment.pdf_link || judgment.pdf_url // Map pdf_link to pdf_url
        }));
      } else if (!Array.isArray(data.data)) {
        // If data.data exists but isn't an array, set to empty array
        console.warn('🌐 Supreme Court API response data is not an array, setting to empty array');
        data.data = [];
      }
      
      // Ensure pagination_info exists
      if (!data.pagination_info) {
        data.pagination_info = { has_more: false };
      }
      
      console.log('🌐 Mapped Supreme Court API response:', data);
      return data;
      
    } catch (error) {
      console.error('🌐 Supreme Court API call failed on all servers:', error);
      console.error('🌐 Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      
      // Throw error instead of returning mock data
      throw error;
    }
  }

  // Mock data for Supreme Court judgments when API is unavailable
  getMockSupremeCourtJudgementsData(params = {}) {
    const mockData = [
      {
        id: 1,
        case_number: "CIVIL APPEAL NO. 1234 OF 2023",
        cnr: "SC-123456-2023",
        petitioner: "State of Maharashtra",
        respondent: "Union of India",
        judge: "Hon'ble Mr. Justice D.Y. Chandrachud",
        decision_date: "2023-12-15",
        pdf_url: "https://example.com/supreme_judgment1.pdf",
        summary: "Constitutional validity of certain provisions of the Maharashtra Land Revenue Code.",
        keywords: ["constitutional law", "land revenue", "state powers"],
        category: "Constitutional Law"
      },
      {
        id: 2,
        case_number: "CRIMINAL APPEAL NO. 567 OF 2023",
        cnr: "SC-789012-2023",
        petitioner: "Rajesh Kumar",
        respondent: "State of Delhi",
        judge: "Hon'ble Ms. Justice B.V. Nagarathna",
        decision_date: "2023-12-10",
        pdf_url: "https://example.com/supreme_judgment2.pdf",
        summary: "Criminal appeal regarding bail application and evidence admissibility in criminal cases.",
        keywords: ["criminal law", "bail", "evidence"],
        category: "Criminal Law"
      },
      {
        id: 3,
        case_number: "CIVIL APPEAL NO. 890 OF 2023",
        cnr: "SC-345678-2023",
        petitioner: "ABC Corporation Ltd.",
        respondent: "XYZ Industries Pvt. Ltd.",
        judge: "Hon'ble Mr. Justice Sanjay Kishan Kaul",
        decision_date: "2023-12-05",
        pdf_url: "https://example.com/supreme_judgment3.pdf",
        summary: "Commercial dispute regarding contract breach and damages in corporate law.",
        keywords: ["commercial law", "contract", "corporate"],
        category: "Commercial Law"
      },
      {
        id: 4,
        case_number: "WRIT PETITION (CIVIL) NO. 234 OF 2023",
        cnr: "SC-901234-2023",
        petitioner: "Environmental Action Group",
        respondent: "Ministry of Environment",
        judge: "Hon'ble Mr. Justice K.M. Joseph",
        decision_date: "2023-11-28",
        pdf_url: "https://example.com/supreme_judgment4.pdf",
        summary: "Environmental law matter regarding forest conservation and wildlife protection.",
        keywords: ["environmental law", "forest conservation", "wildlife"],
        category: "Environmental Law"
      },
      {
        id: 5,
        case_number: "CIVIL APPEAL NO. 456 OF 2023",
        cnr: "SC-567890-2023",
        petitioner: "Workers Union",
        respondent: "Management of ABC Industries",
        judge: "Hon'ble Mr. Justice S. Ravindra Bhat",
        decision_date: "2023-11-20",
        pdf_url: "https://example.com/supreme_judgment5.pdf",
        summary: "Labor law dispute regarding wage revision and working conditions.",
        keywords: ["labor law", "wages", "working conditions"],
        category: "Labor Law"
      }
    ];

    // Apply search filter if provided
    let filteredData = mockData;
    if (params.search) {
      const searchTerm = params.search.toLowerCase();
      filteredData = mockData.filter(item => 
        item.petitioner.toLowerCase().includes(searchTerm) ||
        item.respondent.toLowerCase().includes(searchTerm) ||
        item.case_number.toLowerCase().includes(searchTerm) ||
        item.summary.toLowerCase().includes(searchTerm) ||
        item.keywords.some(keyword => keyword.toLowerCase().includes(searchTerm))
      );
    }

    // Apply title filter if provided
    if (params.title) {
      const titleTerm = params.title.toLowerCase();
      filteredData = filteredData.filter(item => 
        item.petitioner.toLowerCase().includes(titleTerm) ||
        item.respondent.toLowerCase().includes(titleTerm) ||
        item.case_number.toLowerCase().includes(titleTerm)
      );
    }

    // Apply judge filter if provided
    if (params.judge) {
      filteredData = filteredData.filter(item => 
        item.judge.toLowerCase().includes(params.judge.toLowerCase())
      );
    }

    // Apply petitioner filter if provided
    if (params.petitioner) {
      filteredData = filteredData.filter(item => 
        item.petitioner.toLowerCase().includes(params.petitioner.toLowerCase())
      );
    }

    // Apply respondent filter if provided
    if (params.respondent) {
      filteredData = filteredData.filter(item => 
        item.respondent.toLowerCase().includes(params.respondent.toLowerCase())
      );
    }

    // Apply CNR filter if provided
    if (params.cnr) {
      filteredData = filteredData.filter(item => 
        item.cnr.toLowerCase().includes(params.cnr.toLowerCase())
      );
    }

    // Apply decision date from filter if provided
    if (params.decisionDateFrom || params.decision_date_from) {
      const dateFrom = params.decisionDateFrom || params.decision_date_from;
      
      // Convert from yyyy-mm-dd to dd-mm-yyyy format for comparison
      const dateParts = dateFrom.split('-');
      let compareDate;
      if (dateParts.length === 3) {
        // If it's in yyyy-mm-dd format, convert to Date object
        compareDate = new Date(dateFrom);
      } else {
        // If it's already in dd-mm-yyyy format, parse it correctly
        const [day, month, year] = dateFrom.split('-');
        compareDate = new Date(year, month - 1, day);
      }
      
      filteredData = filteredData.filter(item => 
        new Date(item.decision_date) >= compareDate
      );
    }

    // Apply pagination
    const limit = params.limit || 10;
    const offset = params.offset || 0;
    const paginatedData = filteredData.slice(offset, offset + limit);

    return {
      data: paginatedData,
      next_cursor: paginatedData.length === limit ? { id: paginatedData[paginatedData.length - 1].id } : null,
      pagination_info: {
        total_count: filteredData.length,
        current_page_size: paginatedData.length,
        has_more: (offset + limit) < filteredData.length
      },
      message: "Mock data - API unavailable"
    };
  }

  // Health check
  async getHealth() {
    const response = await fetch(`${this.baseURL}/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true'
      }
    });

    return await this.handleResponse(response);
  }

  // Check API connectivity
  async checkConnectivity() {
    try {
      const response = await fetch(`${this.baseURL}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
        timeout: 5000 // 5 second timeout
      });
      
      return response.ok;
    } catch (error) {
      console.error('API connectivity check failed:', error);
      return false;
    }
  }

  // Get alternative endpoints for fallback
  getAlternativeEndpoints() {
    return [
      'https://752ce8b44879.ngrok-free.app', // Current ngrok
      'http://localhost:8000', // Local development
      'https://api.legalplatform.com', // Production (if available)
      'https://legal-api.herokuapp.com' // Alternative hosting
    ];
  }

  // Try alternative endpoints for High Court judgments
  async getHighCourtJudgementsWithFallback(params = {}) {
    const endpoints = this.getAlternativeEndpoints();
    console.log('🔍 getHighCourtJudgementsWithFallback called with params:', params);
    console.log('🔍 Available endpoints:', endpoints);
    
    for (const endpoint of endpoints) {
      try {
        console.log(`🔄 Trying endpoint: ${endpoint}`);
        const queryString = new URLSearchParams(params).toString();
        const url = `${endpoint}/api/high-court-judgements?${queryString}`;
        console.log(`🔄 Full URL: ${url}`);
        
        const response = await fetch(url, {
          method: 'GET',
          headers: this.getPublicHeaders()
        });
        
        console.log(`🔄 Response status: ${response.status} ${response.statusText}`);
        
        if (response.ok) {
          console.log(`✅ Successfully connected to: ${endpoint}`);
          // Update base URL if we found a working endpoint
          if (endpoint !== this.baseURL) {
            console.log(`🔄 Switching to working endpoint: ${endpoint}`);
            this.baseURL = endpoint;
          }
          const result = await this.handleResponse(response);
          console.log(`✅ Got data from ${endpoint}:`, result);
          return result;
        } else {
          console.warn(`❌ Endpoint ${endpoint} returned status ${response.status}`);
        }
      } catch (error) {
        console.warn(`❌ Endpoint ${endpoint} failed:`, error.message);
        continue;
      }
    }
    
    console.error('❌ All API endpoints are unavailable');
    throw new Error('All API endpoints are unavailable');
  }

  // Get API info
  async getApiInfo() {
    const response = await fetch(`${this.baseURL}/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true'
      }
    });

    return await this.handleResponse(response);
  }

  // Law Mapping APIs (public access)
  async getLawMappings(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    
    // Try with auth headers if token exists, otherwise use public headers
    const token = localStorage.getItem('access_token') || 
                  localStorage.getItem('accessToken') || 
                  localStorage.getItem('token');
    const hasToken = !!token && token !== 'null' && token !== 'undefined';
    
    const endpoint = `/api/law_mapping?${queryString}`;
    
    try {
      // Use fetchWithFallback for automatic server switching and better error handling
      const { response, data, serverId } = await this.fetchWithFallback(endpoint, {
        method: 'GET',
        headers: hasToken ? this.getAuthHeaders() : this.getPublicHeaders()
      });
      
      // If fetchWithFallback returned an error response, handle it
      if (response && !response.ok) {
        return await this.handleResponse(response, serverId);
      }
      
      return data;
    } catch (error) {
      // If fetchWithFallback fails completely, try direct fetch as fallback
      console.warn('fetchWithFallback failed, trying direct fetch:', error);
      try {
        const response = await fetch(`${this.baseURL}${endpoint}`, {
          method: 'GET',
          headers: hasToken ? this.getAuthHeaders() : this.getPublicHeaders()
        });
        return await this.handleResponse(response);
      } catch (directError) {
        console.error('Direct fetch also failed:', directError);
        throw error; // Throw original error from fetchWithFallback
      }
    }
  }

  // Get BNS-IPC mappings
  async getBnsIpcMappings(params = {}) {
    return await this.getLawMappings({
      mapping_type: 'bns_ipc',
      ...params
    });
  }

  // Get BSA-IEA mappings
  async getBsaIeaMappings(params = {}) {
    return await this.getLawMappings({
      mapping_type: 'bsa_iea',
      ...params
    });
  }

  // Get BNSS-CrPC mappings
  async getBnssCrpcMappings(params = {}) {
    return await this.getLawMappings({
      mapping_type: 'bnss_crpc',
      ...params
    });
  }

  // Judgment filtering APIs with enhanced filters
  async getJudgmentsWithFilters(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(`${this.baseURL}/api/judgements?${queryString}`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });

    return await this.handleResponse(response);
  }

  // Get Supreme Court judgments with filters
  async getSupremeCourtJudgmentsWithFilters(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(`${this.baseURL}/api/supreme-court-judgements?${queryString}`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });

    return await this.handleResponse(response);
  }

  // Central Acts API (public access) - Enhanced with Elasticsearch support
  async getCentralActs(params = {}) {
    console.log('🌐 getCentralActs called with params:', params);
    
    try {
      const queryParams = new URLSearchParams();
      
      // Add pagination parameters
      if (params.limit) queryParams.append('limit', params.limit);
      if (params.offset !== undefined) queryParams.append('offset', params.offset);
      
      // Add traditional filter parameters
      if (params.act_id) queryParams.append('act_id', params.act_id);
      if (params.short_title) queryParams.append('short_title', params.short_title);
      if (params.year) queryParams.append('year', params.year);
      if (params.ministry) queryParams.append('ministry', params.ministry);
      if (params.department) queryParams.append('department', params.department);
      
      // Add Elasticsearch search parameters
      if (params.search) {
        queryParams.append('search', params.search);
        console.log('🔍 Using Elasticsearch full-text search:', params.search);
      }
      if (params.highlight !== undefined) {
        queryParams.append('highlight', params.highlight.toString());
      }
      
      const endpoint = `/api/acts/central-acts?${queryParams.toString()}`;
      console.log('🌐 Central Acts API endpoint:', endpoint);
      
      // Use fetchWithFallback for automatic server switching
      const { data, serverId } = await this.fetchWithFallback(endpoint, {
        method: 'GET',
        headers: this.getPublicHeaders()
      });
      
      console.log(`🌐 Central Acts response received from ${serverId} server:`, data);
      
      return data;
    } catch (error) {
      console.error('🌐 Central Acts API call failed on all servers:', error);
      throw error;
    }
  }

  // State Acts API (public access) - Enhanced with Elasticsearch support
  async getStateActs(params = {}) {
    console.log('🌐 getStateActs called with params:', params);
    
    try {
      const queryParams = new URLSearchParams();
      
      // Add pagination parameters
      if (params.limit) queryParams.append('limit', params.limit);
      if (params.offset !== undefined) queryParams.append('offset', params.offset);
      
      // Add traditional filter parameters
      if (params.state) queryParams.append('state', params.state);
      if (params.act_number) queryParams.append('act_number', params.act_number);
      if (params.short_title) queryParams.append('short_title', params.short_title);
      if (params.year) queryParams.append('year', params.year);
      if (params.department) queryParams.append('department', params.department);
      
      // Add Elasticsearch search parameters
      if (params.search) {
        queryParams.append('search', params.search);
        console.log('🔍 Using Elasticsearch full-text search:', params.search);
      }
      if (params.highlight !== undefined) {
        queryParams.append('highlight', params.highlight.toString());
      }
      
      const endpoint = `/api/acts/state-acts?${queryParams.toString()}`;
      console.log('🌐 State Acts API endpoint:', endpoint);
      
      // Use fetchWithFallback for automatic server switching
      const { data, serverId } = await this.fetchWithFallback(endpoint, {
        method: 'GET',
        headers: this.getPublicHeaders()
      });
      
      console.log(`🌐 State Acts response received from ${serverId} server:`, data);
      
      return data;
    } catch (error) {
      console.error('🌐 State Acts API call failed on all servers:', error);
      throw error;
    }
  }

  // Enhanced State Acts API with offset-based pagination
  async getStateActsWithOffset(offset = 0, limit = 20, filters = {}) {
    const params = {
      limit,
      offset,
      ...filters
    };
    
    return await this.getStateActs(params);
  }

  // Elasticsearch-only search endpoint for Central Acts
  async searchActsElasticsearch(params = {}) {
    console.log('🔍 searchActsElasticsearch called with params:', params);
    
    try {
      const queryParams = new URLSearchParams();
      
      // Required parameter: search query
      if (!params.q && !params.query) {
        throw new Error('Search query (q or query) is required');
      }
      const searchQuery = params.q || params.query;
      queryParams.append('q', searchQuery);
      
      // Optional parameters
      if (params.size) queryParams.append('size', params.size.toString());
      if (params.year_from) queryParams.append('year_from', params.year_from.toString());
      if (params.year_to) queryParams.append('year_to', params.year_to.toString());
      if (params.highlight !== undefined) {
        queryParams.append('highlight', params.highlight.toString());
      }
      
      const endpoint = `/api/acts/search?${queryParams.toString()}`;
      console.log('🔍 Elasticsearch search endpoint:', endpoint);
      
      // Use fetchWithFallback for automatic server switching
      const { data, serverId } = await this.fetchWithFallback(endpoint, {
        method: 'GET',
        headers: this.getPublicHeaders()
      });
      
      console.log(`🔍 Elasticsearch search response received from ${serverId} server:`, data);
      
      return data;
    } catch (error) {
      console.error('🔍 Elasticsearch search failed on all servers:', error);
      throw error;
    }
  }

  // Enhanced Judgements API with cursor-based pagination
  async getJudgementsWithCursor(cursor = null, filters = {}) {
    const params = { limit: 10, ...filters };
    
    if (cursor) {
      params.cursor_decision_date = cursor.decision_date;
      params.cursor_id = cursor.id;
    }
    
    return await this.getJudgements(params);
  }

  // Enhanced Supreme Court Judgements API with cursor-based pagination
  async getSupremeCourtJudgementsWithCursor(cursor = null, filters = {}) {
    const params = { limit: 10, ...filters };
    
    if (cursor) {
      params.cursor_decision_date = cursor.decision_date;
      params.cursor_id = cursor.id;
    }
    
    return await this.getSupremeCourtJudgements(params);
  }

  // High Court Judgements API (public access) - Enhanced with real API calls
  async getHighCourtJudgements(params = {}) {
    console.log('🌐 getHighCourtJudgements called with params:', params);
    
    try {
      console.log('🌐 Making real API call for High Court judgments');
      const queryParams = new URLSearchParams();
      
      // Add pagination parameters
      if (params.limit) queryParams.append('limit', params.limit);
      if (params.offset) queryParams.append('offset', params.offset);
      
      // Add search and filter parameters
      if (params.search) queryParams.append('search', params.search);
      if (params.title) queryParams.append('title', params.title);
      if (params.cnr) queryParams.append('cnr', params.cnr);
      if (params.court_name) queryParams.append('court_name', params.court_name);
      if (params.decision_date_from) queryParams.append('decision_date_from', params.decision_date_from);
      if (params.judge) queryParams.append('judge', params.judge);
      if (params.year) queryParams.append('year', params.year);
      
      // Add cursor-based pagination parameters for High Court
      if (params.cursor_decision_date) queryParams.append('cursor_decision_date', params.cursor_decision_date);
      if (params.cursor_id) queryParams.append('cursor_id', params.cursor_id);
      
      const url = `${this.baseURL}/api/high-court-judgements?${queryParams.toString()}`;
      console.log('🌐 High Court API URL:', url);
      
      // Check authentication token
      const token = localStorage.getItem('access_token') || localStorage.getItem('accessToken') || localStorage.getItem('token');
      console.log('🌐 Auth token available:', !!token);
      
      const headers = {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true'
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      console.log('🌐 Request headers:', headers);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: headers
      });
      
      console.log('🌐 Response status:', response.status);
      console.log('🌐 Response headers:', Object.fromEntries(response.headers.entries()));
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('🌐 High Court API Error Response:', errorText);
        throw new Error(`High Court API request failed: ${response.status} ${response.statusText} - ${errorText}`);
      }
      
      const data = await response.json();
      console.log('🌐 Real High Court API response:', data);
      
      // Map API field names to frontend expected field names
      if (data.data && Array.isArray(data.data)) {
        data.data = data.data.map(judgment => ({
          ...judgment,
          pdf_url: judgment.pdf_link || judgment.pdf_url // Map pdf_link to pdf_url
        }));
      }
      
      console.log('🌐 Mapped High Court API response:', data);
      return data;
      
    } catch (error) {
      console.error('🌐 High Court API call failed:', error);
      console.error('🌐 Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      throw error;
    }
  }

  // Enhanced High Court Judgements API with cursor-based pagination
  async getHighCourtJudgementsWithCursor(cursor = null, filters = {}) {
    const params = { limit: 10, ...filters };
    
    if (cursor) {
      params.cursor_decision_date = cursor.decision_date;
      params.cursor_id = cursor.id;
    }
    
    return await this.getHighCourtJudgements(params);
  }

  // High Court Judgements with advanced filtering
  async getHighCourtJudgementsWithFilters(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(`${this.baseURL}/api/high-court-judgements?${queryString}`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });

    return await this.handleResponse(response);
  }

  // Enhanced Law Mapping API with offset-based pagination
  async getLawMappingsWithOffset(offset = 0, limit = 50, filters = {}) {
    const params = {
      limit,
      offset,
      ...filters
    };
    
    return await this.getLawMappings(params);
  }

  // Enhanced Central Acts API with offset-based pagination
  async getCentralActsWithOffset(offset = 0, limit = 20, filters = {}) {
    const params = {
      limit,
      offset,
      ...filters
    };
    
    return await this.getCentralActs(params);
  }

  // User Type specific signup methods
  async signupStudent(userData) {
    return await this.signup({
      ...userData,
      user_type: 1
    });
  }

  async signupLawyer(userData) {
    return await this.signup({
      ...userData,
      user_type: 2
    });
  }

  async signupCorporate(userData) {
    return await this.signup({
      ...userData,
      user_type: 3
    });
  }

  async signupOther(userData) {
    return await this.signup({
      ...userData,
      user_type: 4
    });
  }

  // Enhanced error handling with specific error types
  async handleApiError(error) {
    if (error.message.includes('Not authenticated')) {
      this.clearAllTokens();
      window.location.href = '/login';
    } else if (error.message.includes('Token has expired')) {
      this.clearAllTokens();
      window.location.href = '/login';
    } else {
      throw error;
    }
  }

  // Utility method to check if user is authenticated
  // According to API docs: tokens expire after 30 minutes
  isAuthenticated() {
    const token = localStorage.getItem('access_token') || localStorage.getItem('accessToken') || localStorage.getItem('token');
    if (!token || token === 'null' || token === 'undefined') {
      return false;
    }
    
    // Check if token is expired
    if (this.isTokenExpired()) {
      console.warn('⚠️ Token is expired');
      return false;
    }
    
    return true;
  }

  // Utility method to get stored user data
  getStoredUserData() {
    const userData = localStorage.getItem('userData') || localStorage.getItem('user');
    return userData ? JSON.parse(userData) : null;
  }

  // Utility method to store user data
  storeUserData(userData) {
    localStorage.setItem('userData', JSON.stringify(userData));
    localStorage.setItem('user', JSON.stringify(userData));
  }

  // Utility method to clear all stored data
  clearStoredData() {
    this.clearAllTokens();
    localStorage.removeItem('userData');
    localStorage.removeItem('user');
  }

  // Dashboard API Methods
  
  // Get user downloads
  async getUserDownloads(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(`${this.baseURL}/api/dashboard/downloads?${queryString}`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });
    return await this.handleResponse(response);
  }

  // Add download
  async addDownload(downloadData) {
    const response = await fetch(`${this.baseURL}/api/dashboard/downloads`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(downloadData)
    });
    return await this.handleResponse(response);
  }

  // Delete download
  async deleteDownload(downloadId) {
    const response = await fetch(`${this.baseURL}/api/dashboard/downloads/${downloadId}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    });
    return await this.handleResponse(response);
  }

  // Bookmark API Methods - Following the documented API structure

  // Get user bookmarks
  async getUserBookmarks(params = {}) {
    // Handle folder_id parameter - backend expects folder_id, but we support folderId for consistency
    const queryParams = { ...params };
    if (queryParams.folderId !== undefined) {
      queryParams.folder_id = queryParams.folderId;
      delete queryParams.folderId;
    }
    // Special case: folder_id=0 means bookmarks without folder (null)
    if (queryParams.folder_id === 0) {
      queryParams.folder_id = null;
    }
    
    const queryString = new URLSearchParams(
      Object.entries(queryParams).filter(([_, v]) => v !== null && v !== undefined)
    ).toString();
    const headers = this.getAuthHeaders();
    
    // Log token info for debugging (without exposing actual token)
    const token = localStorage.getItem('access_token') || localStorage.getItem('accessToken') || localStorage.getItem('token');
    console.log('🔐 Fetching bookmarks with token:', token ? `Bearer ${token.substring(0, 10)}...` : 'No token');
    
    const response = await fetch(`${this.baseURL}/api/bookmarks?${queryString}`, {
      method: 'GET',
      headers: headers
    });
    
    if (!response.ok && response.status === 401) {
      console.error('❌ Authentication failed - token may be invalid or expired');
      // Clear invalid tokens
      this.clearAllTokens();
      throw new Error('Authentication failed. Please login again.');
    }
    
    return await this.handleResponse(response);
  }

  // Bookmark a judgement
  async bookmarkJudgement(judgementId, folderId = null) {
    const headers = this.getAuthHeaders();
    // Ensure Content-Type header is set for POST requests
    if (!headers['Content-Type']) {
      headers['Content-Type'] = 'application/json';
    }
    
    const fetchOptions = {
      method: 'POST',
      headers: headers
    };
    
    // Only include body if folderId is provided (backend may reject empty body)
    if (folderId !== null && folderId !== undefined) {
      fetchOptions.body = JSON.stringify({ folder_id: folderId });
    }
    
    const response = await fetch(`${this.baseURL}/api/bookmarks/judgements/${judgementId}`, fetchOptions);
    return await this.handleResponse(response);
  }

  // Remove judgement bookmark
  async removeJudgementBookmark(judgementId) {
    const response = await fetch(`${this.baseURL}/api/bookmarks/judgements/${judgementId}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    });
    return await this.handleResponse(response);
  }

  // Get full judgment details by ID (for viewing bookmarked judgments)
  async getJudgementById(judgementId) {
    const endpoint = `${this.baseURL}/api/judgements/${judgementId}`;
    
    try {
      console.log(`🔍 Fetching High Court judgment by ID: ${judgementId} from ${endpoint}`);
      
      // Try without auth first (public endpoint), then with auth if needed
      let response;
      let headers = this.getPublicHeaders();
      
      // Create abort controller for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      try {
        response = await fetch(endpoint, {
        method: 'GET',
          headers: headers,
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        console.log(`📡 Response status: ${response.status} ${response.statusText}`);
        
        // If 401, try with auth
        if (response.status === 401) {
          console.log('⚠️ Got 401, trying with authentication...');
          const authController = new AbortController();
          const authTimeoutId = setTimeout(() => authController.abort(), 10000);
          headers = this.getAuthHeaders();
          try {
            response = await fetch(endpoint, {
              method: 'GET',
              headers: headers,
              signal: authController.signal
            });
            clearTimeout(authTimeoutId);
            console.log(`📡 Response status (with auth): ${response.status} ${response.statusText}`);
          } catch (authErr) {
            clearTimeout(authTimeoutId);
            throw authErr;
          }
        }
      } catch (fetchErr) {
        clearTimeout(timeoutId);
        console.error('❌ Fetch error:', fetchErr);
        // If network error, try with alternative server
        if (fetchErr.name === 'TypeError' || fetchErr.name === 'AbortError' || fetchErr.message.includes('fetch')) {
          console.log('🔄 Trying alternative server...');
          const altEndpoint = `${API_BASE_URL_AD}/api/judgements/${judgementId}`;
          const altController = new AbortController();
          const altTimeoutId = setTimeout(() => altController.abort(), 10000);
          try {
            response = await fetch(altEndpoint, {
              method: 'GET',
              headers: this.getPublicHeaders(),
              signal: altController.signal
            });
            clearTimeout(altTimeoutId);
            console.log(`📡 Alternative server response: ${response.status}`);
          } catch (altErr) {
            clearTimeout(altTimeoutId);
            throw new Error('Network error: Unable to connect to the server. Please check your internet connection.');
          }
        } else {
          throw fetchErr;
        }
      }
      
      if (!response.ok) {
        let errorMessage = `Failed to fetch judgment: ${response.statusText}`;
        try {
          const errorData = await response.json();
          if (errorData.message || errorData.detail) {
            errorMessage = errorData.message || errorData.detail;
          }
        } catch (e) {
          // If response is not JSON, use status text
        }
        throw new Error(errorMessage);
      }
      
      // Parse JSON directly - API returns direct object
      const judgmentData = await response.json();
      console.log('✅ Received High Court judgment data:', judgmentData);
      
      // Return the data directly - it's already in the correct format
      return judgmentData;
    } catch (err) {
      console.error('❌ Error fetching High Court judgment by ID:', err);
      
      // Handle network errors specifically
      if (err.name === 'TypeError' || err.name === 'AbortError' || err.message.includes('fetch') || err.message.includes('Network error')) {
        throw new Error('Network error: Unable to connect to the server. Please check your internet connection and try again.');
      }
      
      // Re-throw with original message if it's already an Error
      if (err instanceof Error) {
        throw err;
      }
      
      // Otherwise wrap in Error
      throw new Error(err.message || 'Failed to load judgment');
    }
  }

  // Get Supreme Court judgment details by ID
  async getSupremeCourtJudgementById(judgementId) {
    const endpoint = `${this.baseURL}/api/supreme-court-judgements/${judgementId}`;
    
    try {
      console.log(`🔍 Fetching Supreme Court judgment by ID: ${judgementId} from ${endpoint}`);
      
      // Try without auth first (public endpoint), then with auth if needed
      let response;
      let headers = this.getPublicHeaders();
      
      // Create abort controller for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      try {
        response = await fetch(endpoint, {
          method: 'GET',
          headers: headers,
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        console.log(`📡 Response status: ${response.status} ${response.statusText}`);
        
        // If 401, try with auth
        if (response.status === 401) {
          console.log('⚠️ Got 401, trying with authentication...');
          const authController = new AbortController();
          const authTimeoutId = setTimeout(() => authController.abort(), 10000);
          headers = this.getAuthHeaders();
          try {
            response = await fetch(endpoint, {
              method: 'GET',
              headers: headers,
              signal: authController.signal
            });
            clearTimeout(authTimeoutId);
            console.log(`📡 Response status (with auth): ${response.status} ${response.statusText}`);
          } catch (authErr) {
            clearTimeout(authTimeoutId);
            throw authErr;
          }
        }
      } catch (fetchErr) {
        clearTimeout(timeoutId);
        console.error('❌ Fetch error:', fetchErr);
        // If network error, try with alternative server
        if (fetchErr.name === 'TypeError' || fetchErr.name === 'AbortError' || fetchErr.message.includes('fetch')) {
          console.log('🔄 Trying alternative server...');
          const altEndpoint = `${API_BASE_URL_AD}/api/supreme-court-judgements/${judgementId}`;
          const altController = new AbortController();
          const altTimeoutId = setTimeout(() => altController.abort(), 10000);
          try {
            response = await fetch(altEndpoint, {
              method: 'GET',
              headers: this.getPublicHeaders(),
              signal: altController.signal
            });
            clearTimeout(altTimeoutId);
            console.log(`📡 Alternative server response: ${response.status}`);
          } catch (altErr) {
            clearTimeout(altTimeoutId);
            throw new Error('Network error: Unable to connect to the server. Please check your internet connection.');
        }
        } else {
          throw fetchErr;
        }
      }
      
      if (!response.ok) {
        let errorMessage = `Failed to fetch Supreme Court judgment: ${response.statusText}`;
        try {
          const errorData = await response.json();
          if (errorData.message || errorData.detail) {
            errorMessage = errorData.message || errorData.detail;
          }
        } catch (e) {
          // If response is not JSON, use status text
        }
        throw new Error(errorMessage);
      }
      
      // Parse JSON directly - API returns direct object
      const judgmentData = await response.json();
      console.log('✅ Received Supreme Court judgment data:', judgmentData);
      
      // Return the data directly - it's already in the correct format
      return judgmentData;
    } catch (err) {
      console.error('❌ Error fetching Supreme Court judgment by ID:', err);
      
      // Handle network errors specifically
      if (err.name === 'TypeError' || err.name === 'AbortError' || err.message.includes('fetch') || err.message.includes('Network error')) {
        throw new Error('Network error: Unable to connect to the server. Please check your internet connection and try again.');
      }
      
      // Re-throw with original message if it's already an Error
      if (err instanceof Error) {
      throw err;
      }
      
      // Otherwise wrap in Error
      throw new Error(err.message || 'Failed to load Supreme Court judgment');
    }
  }

  // Delete judgment by ID
  async deleteJudgement(judgementId) {
    try {
      const response = await fetch(`${this.baseURL}/api/judgements/${judgementId}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders()
      });
      
      return await this.handleResponse(response);
    } catch (err) {
      console.error('Error deleting judgment:', err);
      throw err;
    }
  }

  // Delete judgment by name (searches and deletes)
  async deleteJudgementByName(judgmentName) {
    try {
      // First, search for the judgment by name
      const searchResponse = await this.getJudgements({
        search: judgmentName,
        title: judgmentName,
        limit: 50
      });

      if (!searchResponse.data || searchResponse.data.length === 0) {
        throw new Error(`No judgment found with name: ${judgmentName}`);
      }

      // If multiple found, delete the first match (or could be enhanced to show selection)
      const judgmentToDelete = searchResponse.data[0];
      
      // Delete the judgment
      return await this.deleteJudgement(judgmentToDelete.id);
    } catch (err) {
      console.error('Error deleting judgment by name:', err);
      throw err;
    }
  }

  // Get central act by ID
  async getCentralActById(actId) {
    try {
      // Try to get by ID endpoint first
      const response = await fetch(`${this.baseURL}/api/acts/central-acts/${actId}`, {
        method: 'GET',
        headers: this.getPublicHeaders()
      });
      
      if (response.ok) {
        const data = await response.json();
        // Handle both direct object and wrapped response
        return data.data || data;
      } else if (response.status === 404) {
        // Fallback: search by filtering using the ID field
        const searchResponse = await this.getCentralActs({ limit: 100 });
        if (searchResponse.data && searchResponse.data.length > 0) {
          // Find the act by ID in the response
          const foundAct = searchResponse.data.find(act => act.id === parseInt(actId) || act.id === actId);
          if (foundAct) {
            return foundAct;
          }
        }
        throw new Error('Central act not found');
      }
      return await this.handleResponse(response);
    } catch (err) {
      // Fallback: try to get from list and search
      try {
        const searchResponse = await this.getCentralActs({ limit: 100 });
        if (searchResponse.data && searchResponse.data.length > 0) {
          const foundAct = searchResponse.data.find(act => act.id === parseInt(actId) || act.id === actId);
          if (foundAct) {
            return foundAct;
          }
        }
        // If still not found, try with larger limit
        const largeSearchResponse = await this.getCentralActs({ limit: 1000, offset: 0 });
        if (largeSearchResponse.data && largeSearchResponse.data.length > 0) {
          const foundAct = largeSearchResponse.data.find(act => act.id === parseInt(actId) || act.id === actId);
          if (foundAct) {
            return foundAct;
          }
        }
      } catch (fallbackErr) {
        console.error('Fallback search also failed:', fallbackErr);
      }
      throw err;
    }
  }

  // Get state act by ID
  async getStateActById(actId) {
    try {
      // Try to get by ID endpoint first
      const response = await fetch(`${this.baseURL}/api/acts/state-acts/${actId}`, {
        method: 'GET',
        headers: this.getPublicHeaders()
      });
      
      if (response.ok) {
        const data = await response.json();
        // Handle both direct object and wrapped response
        return data.data || data;
      } else if (response.status === 404) {
        // Fallback: search by filtering using the ID field
        const searchResponse = await this.getStateActs({ limit: 100 });
        if (searchResponse.data && searchResponse.data.length > 0) {
          // Find the act by ID in the response
          const foundAct = searchResponse.data.find(act => act.id === parseInt(actId) || act.id === actId);
          if (foundAct) {
            return foundAct;
          }
        }
        throw new Error('State act not found');
      }
      return await this.handleResponse(response);
    } catch (err) {
      // Fallback: try to get from list and search
      try {
        const searchResponse = await this.getStateActs({ limit: 100 });
        if (searchResponse.data && searchResponse.data.length > 0) {
          const foundAct = searchResponse.data.find(act => act.id === parseInt(actId) || act.id === actId);
          if (foundAct) {
            return foundAct;
          }
        }
        // If still not found, try with larger limit
        const largeSearchResponse = await this.getStateActs({ limit: 1000, offset: 0 });
        if (largeSearchResponse.data && largeSearchResponse.data.length > 0) {
          const foundAct = largeSearchResponse.data.find(act => act.id === parseInt(actId) || act.id === actId);
          if (foundAct) {
            return foundAct;
          }
        }
      } catch (fallbackErr) {
        console.error('Fallback search also failed:', fallbackErr);
      }
      throw err;
    }
  }

  // Generate AI summary for law mapping
  async generateLawMappingSummary(mappingId, mappingType, options = {}) {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('mapping_type', mappingType);
      
      const endpoint = `/api/law_mapping/${mappingId}/summary?${queryParams.toString()}`;
      
      const requestBody = {};
      if (options.focus) {
        requestBody.focus = options.focus;
      }
      if (options.max_chars_per_chunk) {
        requestBody.max_chars_per_chunk = options.max_chars_per_chunk;
      }
      
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...this.getPublicHeaders()
        },
        body: JSON.stringify(requestBody)
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Failed to generate summary: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data;
    } catch (err) {
      console.error('Error generating law mapping summary:', err);
      throw err;
    }
  }

  // Get law mapping by ID
  async getLawMappingById(mappingId, mappingType) {
    try {
      // Try to get by ID endpoint first
      const response = await fetch(`${this.baseURL}/api/law_mapping/${mappingId}`, {
        method: 'GET',
        headers: this.getPublicHeaders()
      });
      
      if (response.ok) {
        const data = await response.json();
        // Handle both direct object and wrapped response
        return data.data || data;
      } else if (response.status === 404) {
        // Fallback: search by filtering with mapping type
        const searchResponse = await this.getLawMappings({ 
          mapping_type: mappingType, 
          limit: 100 
        });
        if (searchResponse.data && searchResponse.data.length > 0) {
          // Find the mapping by ID in the response
          const foundMapping = searchResponse.data.find(
            mapping => mapping.id === parseInt(mappingId) || mapping.id === mappingId
          );
          if (foundMapping) {
            return foundMapping;
          }
        }
        throw new Error('Mapping not found');
      }
      return await this.handleResponse(response);
    } catch (err) {
      // Fallback: try to get from list and search
      try {
        const searchResponse = await this.getLawMappings({ 
          mapping_type: mappingType, 
          limit: 100 
        });
        if (searchResponse.data && searchResponse.data.length > 0) {
          const foundMapping = searchResponse.data.find(
            mapping => mapping.id === parseInt(mappingId) || mapping.id === mappingId
          );
          if (foundMapping) {
            return foundMapping;
          }
        }
        // If still not found, try with larger limit (pagination)
        let offset = 0;
        let found = false;
        let foundMapping = null;
        while (!found && offset < 1000) {
          const largeSearchResponse = await this.getLawMappings({ 
            mapping_type: mappingType, 
            limit: 100,
            offset: offset
          });
          if (largeSearchResponse.data && largeSearchResponse.data.length > 0) {
            foundMapping = largeSearchResponse.data.find(
              mapping => mapping.id === parseInt(mappingId) || mapping.id === mappingId
            );
            if (foundMapping) {
              found = true;
              break;
            }
            // Check if there are more results
            if (!largeSearchResponse.pagination_info || !largeSearchResponse.pagination_info.has_more) {
              break;
            }
            offset += 100;
          } else {
            break;
          }
        }
        if (foundMapping) {
          return foundMapping;
        }
      } catch (fallbackErr) {
        console.error('Fallback search also failed:', fallbackErr);
      }
      throw err;
    }
  }

  async getJudgementByIdHTML(judgementId) {
    const token = localStorage.getItem('access_token') || localStorage.getItem('accessToken') || localStorage.getItem('token');
    const headers = {
      'Accept': 'text/html',
      'ngrok-skip-browser-warning': 'true',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
    
    const response = await fetch(`${this.baseURL}/api/judgements/${judgementId}?format=html`, {
      method: 'GET',
      headers: headers
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch judgment HTML: ${response.statusText}`);
    }
    
    return await response.text(); // Return HTML as text
  }

  async getJudgementByIdMarkdown(judgementId) {
    const token = localStorage.getItem('access_token') || localStorage.getItem('accessToken') || localStorage.getItem('token');
    const headers = {
      'Accept': 'text/markdown',
      'ngrok-skip-browser-warning': 'true',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
    
    const response = await fetch(`${this.baseURL}/api/judgements/${judgementId}?format=markdown`, {
      method: 'GET',
      headers: headers
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch judgment Markdown: ${response.statusText}`);
    }
    
    return await response.text(); // Return Markdown as text
  }

  // Get Supreme Court judgment markdown by ID (uses Supreme Court specific endpoint)
  async getSupremeCourtJudgementByIdMarkdown(judgementId) {
    const token = localStorage.getItem('access_token') || localStorage.getItem('accessToken') || localStorage.getItem('token');
    const headers = {
      'Accept': 'text/markdown',
      'ngrok-skip-browser-warning': 'true',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
    
    const response = await fetch(`${this.baseURL}/api/supreme-court-judgements/${judgementId}?format=markdown`, {
      method: 'GET',
      headers: headers
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch Supreme Court judgment Markdown: ${response.statusText}`);
    }
    
    return await response.text(); // Return Markdown as text
  }

  // Get central act markdown by ID
  async getCentralActByIdMarkdown(actId) {
    const token = localStorage.getItem('access_token') || localStorage.getItem('accessToken') || localStorage.getItem('token');
    const headers = {
      'Accept': 'text/markdown',
      'ngrok-skip-browser-warning': 'true',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
    
    const response = await fetch(`${this.baseURL}/api/central_acts/${actId}?format=markdown`, {
      method: 'GET',
      headers: headers
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch central act Markdown: ${response.statusText}`);
    }
    
    return await response.text(); // Return Markdown as text
  }

  // Get state act markdown by ID
  async getStateActByIdMarkdown(actId) {
    const token = localStorage.getItem('access_token') || localStorage.getItem('accessToken') || localStorage.getItem('token');
    const headers = {
      'Accept': 'text/markdown',
      'ngrok-skip-browser-warning': 'true',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
    
    const response = await fetch(`${this.baseURL}/api/state_acts/${actId}?format=markdown`, {
      method: 'GET',
      headers: headers
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch state act Markdown: ${response.statusText}`);
    }
    
    return await response.text(); // Return Markdown as text
  }


  // Get judgment summary using Gemini
  async getJudgementSummary(judgementId, options = {}) {
    const token = localStorage.getItem('access_token') || localStorage.getItem('accessToken') || localStorage.getItem('token');
    const headers = {
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };

    const payload = {
      format: options.format || 'markdown',
      max_chars_per_chunk: options.max_chars_per_chunk || 2000,
      ...(options.focus && { focus: options.focus })
    };

    const response = await fetch(`${this.baseURL}/api/judgements/${judgementId}/summary`, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `Failed to fetch judgment summary: ${response.statusText}`;
      try {
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson.detail || errorMessage;
      } catch (e) {
        // If not JSON, use the text as is
        if (errorText) {
          errorMessage = errorText;
        }
      }
      throw new Error(errorMessage);
    }

    return await response.json();
  }

  // Bookmark an act (central or state)
  // API Documentation: POST /api/bookmarks/acts/{act_type}/{act_id}
  // For state acts: POST /api/bookmarks/acts/state/{act_id}
  async bookmarkAct(actType, actId, folderId = null) {
    // Ensure actId is numeric - backend requires numeric ID
    const numericId = parseInt(actId);
    if (isNaN(numericId)) {
      throw new Error(`Invalid act ID: ${actId}. Must be a number.`);
    }
    
    // Backend requires exactly "central" or "state" (not "central_act" or "state_act")
    // Handle both 'central'/'state' and 'central_act'/'state_act' formats
    let validActType;
    if (actType === 'central' || actType === 'central_act') {
      validActType = 'central';
    } else if (actType === 'state' || actType === 'state_act') {
      validActType = 'state';
    } else {
      validActType = actType;
    }
    
    if (validActType !== 'central' && validActType !== 'state') {
      throw new Error(`Invalid act type: ${actType}. Must be "central" or "state" (or "central_act"/"state_act").`);
    }
    
    // API endpoint: POST /api/bookmarks/acts/{act_type}/{act_id}
    // Example: POST /api/bookmarks/acts/state/5796
    const endpoint = `/api/bookmarks/acts/${validActType}/${numericId}`;
    const headers = this.getAuthHeaders();
    
    // Ensure Content-Type header is set for POST requests
    if (!headers['Content-Type']) {
      headers['Content-Type'] = 'application/json';
    }
    
    // According to API docs: Request body is optional (none required)
    // Only include body if folderId is provided and not null/undefined/0
    const requestOptions = {
      method: 'POST',
      headers: headers
    };
    
    // Only add body if folderId is provided (API docs say body is optional)
    if (folderId !== null && folderId !== undefined && folderId !== 0) {
      requestOptions.body = JSON.stringify({ folder_id: folderId });
    }
    
    console.log('🔖 Bookmarking act - API Call Details:', { 
      actType, 
      validActType, 
      actId, 
      numericId, 
      folderId, 
      endpoint: endpoint,
      baseURL: this.baseURL,
      fullUrl: `${this.baseURL}${endpoint}`,
      method: 'POST',
      expectedEndpoint: `POST ${endpoint}`,
      hasBody: !!requestOptions.body,
      body: requestOptions.body ? JSON.parse(requestOptions.body) : null
    });
    console.log('🔖 Headers:', { ...headers, Authorization: headers.Authorization ? 'Bearer ***' : 'None' });
    
    try {
      // Use fetchWithFallback for better error handling and server fallback
      const { response, data, serverId, error: hasError } = await this.fetchWithFallback(endpoint, requestOptions);
      
      if (hasError || !response.ok) {
        let errorText;
        try {
          errorText = hasError ? hasError.message : await response.text();
        } catch (e) {
          errorText = hasError ? hasError.message : `HTTP ${response.status} ${response.statusText}`;
        }
        
        console.error('🔖 Bookmark act error:', {
          status: response.status,
          statusText: response.statusText,
          error: errorText,
          endpoint: endpoint,
          fullUrl: `${this.baseURL}${endpoint}`
        });
        
        try {
          const errorJson = typeof errorText === 'string' ? JSON.parse(errorText) : errorText;
          console.error('🔖 Error details:', errorJson);
          // Throw a more descriptive error based on status code
          if (response.status === 404) {
            throw new Error(errorJson.detail || `State act with ID ${numericId} not found`);
          } else if (response.status === 400) {
            throw new Error(errorJson.detail || `Bad request: ${errorJson.message || 'Invalid request'}`);
          } else if (response.status === 401) {
            throw new Error('Authentication failed. Please login again.');
          } else {
            throw new Error(errorJson.detail || errorJson.message || `Failed to bookmark ${validActType} act: ${response.statusText}`);
          }
        } catch (e) {
          if (e.message && !e.message.includes('Failed to bookmark') && !e.message.includes('not found') && !e.message.includes('Authentication')) {
            console.error('🔖 Error response is not JSON:', errorText);
            throw new Error(`Failed to bookmark ${validActType} act: ${response.statusText} - ${errorText}`);
          } else {
            throw e;
          }
        }
      }
      
      console.log(`✅ Bookmark act successful from ${serverId} server`);
      return data || await this.handleResponse(response, serverId);
    } catch (error) {
      console.error('🔖 Bookmark act exception:', {
        error: error.message,
        endpoint: endpoint,
        actType: validActType,
        actId: numericId
      });
      throw error;
    }
  }

  // Remove act bookmark
  async removeActBookmark(actType, actId) {
    // Ensure actId is numeric - backend requires numeric ID
    const numericId = parseInt(actId);
    if (isNaN(numericId)) {
      throw new Error(`Invalid act ID: ${actId}. Must be a number.`);
    }
    
    // Backend requires exactly "central" or "state" (not "central_act" or "state_act")
    const validActType = actType === 'central_act' ? 'central' : actType === 'state_act' ? 'state' : actType;
    
    if (validActType !== 'central' && validActType !== 'state') {
      throw new Error(`Invalid act type: ${actType}. Must be "central" or "state".`);
    }
    
    const url = `${this.baseURL}/api/bookmarks/acts/${validActType}/${numericId}`;
    const headers = this.getAuthHeaders();
    
    console.log('🗑️ Removing act bookmark:', { actType, validActType, actId, numericId, url });
    console.log('🗑️ Headers:', { ...headers, Authorization: headers.Authorization ? 'Bearer ***' : 'None' });
    
    const response = await fetch(url, {
      method: 'DELETE',
      headers: headers
    });
    
    console.log('🗑️ Response status:', response.status, response.statusText);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('🗑️ Remove act bookmark error:', response.status, errorText);
      try {
        const errorJson = JSON.parse(errorText);
        console.error('🗑️ Error details:', errorJson);
      } catch (e) {
        console.error('🗑️ Error response is not JSON:', errorText);
      }
    }
    
    return await this.handleResponse(response);
  }

  // Bookmark a mapping (BSA-IEA, BNS-IPC, or BNSS-CrPC)
  async bookmarkMapping(mappingType, mappingId, folderId = null) {
    // Normalize mapping type: convert 'bsa_iea_mapping' to 'bsa_iea', etc.
    let normalizedType = mappingType;
    if (mappingType === 'bsa_iea_mapping') normalizedType = 'bsa_iea';
    else if (mappingType === 'bns_ipc_mapping') normalizedType = 'bns_ipc';
    else if (mappingType === 'bnss_crpc_mapping') normalizedType = 'bnss_crpc';
    
    const headers = this.getAuthHeaders();
    // Ensure Content-Type header is set for POST requests
    if (!headers['Content-Type']) {
      headers['Content-Type'] = 'application/json';
    }
    
    const fetchOptions = {
      method: 'POST',
      headers: headers
    };
    
    // Only include body if folderId is provided (backend may reject empty body)
    if (folderId !== null && folderId !== undefined) {
      fetchOptions.body = JSON.stringify({ folder_id: folderId });
    }
    
    const response = await fetch(`${this.baseURL}/api/bookmarks/mappings/${normalizedType}/${mappingId}`, fetchOptions);
    return await this.handleResponse(response);
  }

  // Remove mapping bookmark
  async removeMappingBookmark(mappingType, mappingId) {
    // Normalize mapping type: convert 'bsa_iea_mapping' to 'bsa_iea', etc.
    let normalizedType = mappingType;
    if (mappingType === 'bsa_iea_mapping') normalizedType = 'bsa_iea';
    else if (mappingType === 'bns_ipc_mapping') normalizedType = 'bns_ipc';
    else if (mappingType === 'bnss_crpc_mapping') normalizedType = 'bnss_crpc';
    
    const response = await fetch(`${this.baseURL}/api/bookmarks/mappings/${normalizedType}/${mappingId}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    });
    return await this.handleResponse(response);
  }

  // Generic bookmark toggle function
  async toggleBookmark(type, id, actType = null, mappingType = null) {
    let url;
    let method;

    // Determine the correct endpoint based on type
    switch (type) {
      case 'judgement':
        url = `/api/bookmarks/judgements/${id}`;
        break;
      case 'central_act':
        url = `/api/bookmarks/acts/central/${id}`;
        break;
      case 'state_act':
        url = `/api/bookmarks/acts/state/${id}`;
        break;
      case 'bsa_iea_mapping':
        url = `/api/bookmarks/mappings/bsa_iea/${id}`;
        break;
      case 'bns_ipc_mapping':
        url = `/api/bookmarks/mappings/bns_ipc/${id}`;
        break;
      case 'bnss_crpc_mapping':
        url = `/api/bookmarks/mappings/bnss_crpc/${id}`;
        break;
      default:
        throw new Error(`Unsupported bookmark type: ${type}`);
    }

    // For now, we'll assume POST to add bookmark
    // In a real implementation, you'd check if it's already bookmarked
    method = 'POST';

    const response = await fetch(`${this.baseURL}${url}`, {
      method,
      headers: this.getAuthHeaders()
    });
    return await this.handleResponse(response);
  }

  // ===== BOOKMARK FOLDER MANAGEMENT =====

  // Create a bookmark folder
  async createBookmarkFolder(name) {
    if (!name || !name.trim()) {
      throw new Error('Folder name is required');
    }
    const response = await fetch(`${this.baseURL}/api/bookmarks/folders`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ name: name.trim() })
    });
    return await this.handleResponse(response);
  }

  // Get all bookmark folders
  async getBookmarkFolders() {
    const response = await fetch(`${this.baseURL}/api/bookmarks/folders`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });
    return await this.handleResponse(response);
  }

  // Update a bookmark folder (rename)
  async updateBookmarkFolder(folderId, name) {
    if (!name || !name.trim()) {
      throw new Error('Folder name is required');
    }
    const response = await fetch(`${this.baseURL}/api/bookmarks/folders/${folderId}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ name: name.trim() })
    });
    return await this.handleResponse(response);
  }

  // Delete a bookmark folder
  async deleteBookmarkFolder(folderId) {
    const response = await fetch(`${this.baseURL}/api/bookmarks/folders/${folderId}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    });
    return await this.handleResponse(response);
  }

  // Get bookmarks in a specific folder
  async getBookmarksInFolder(folderId, limit = 50, offset = 0) {
    const queryString = new URLSearchParams({ limit, offset }).toString();
    const response = await fetch(`${this.baseURL}/api/bookmarks/folders/${folderId}?${queryString}`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });
    return await this.handleResponse(response);
  }

  // Legacy methods for backward compatibility
  async addBookmark(bookmarkData) {
    // This method is kept for backward compatibility
    // It should be replaced with specific bookmark methods
    console.warn('addBookmark is deprecated. Use specific bookmark methods instead.');
    const response = await fetch(`${this.baseURL}/api/bookmarks`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(bookmarkData)
    });
    return await this.handleResponse(response);
  }

  async updateBookmark(bookmarkId, bookmarkData) {
    // This method is kept for backward compatibility
    console.warn('updateBookmark is deprecated. Use specific bookmark methods instead.');
    const response = await fetch(`${this.baseURL}/api/bookmarks/${bookmarkId}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(bookmarkData)
    });
    return await this.handleResponse(response);
  }

  async deleteBookmark(bookmarkId) {
    // This method is kept for backward compatibility
    console.warn('deleteBookmark is deprecated. Use specific bookmark methods instead.');
    const response = await fetch(`${this.baseURL}/api/bookmarks/${bookmarkId}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    });
    return await this.handleResponse(response);
  }

  // Get user events
  async getUserEvents(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(`${this.baseURL}/api/dashboard/events?${queryString}`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });
    return await this.handleResponse(response);
  }

  // Add event
  async addEvent(eventData) {
    const response = await fetch(`${this.baseURL}/api/dashboard/events`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(eventData)
    });
    return await this.handleResponse(response);
  }

  // Update event
  async updateEvent(eventId, eventData) {
    const response = await fetch(`${this.baseURL}/api/dashboard/events/${eventId}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(eventData)
    });
    return await this.handleResponse(response);
  }

  // Delete event
  async deleteEvent(eventId) {
    const response = await fetch(`${this.baseURL}/api/dashboard/events/${eventId}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    });
    return await this.handleResponse(response);
  }

  // Get user notifications
  async getUserNotifications(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(`${this.baseURL}/api/dashboard/notifications?${queryString}`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });
    return await this.handleResponse(response);
  }

  // Mark notification as read
  async markNotificationAsRead(notificationId) {
    const response = await fetch(`${this.baseURL}/api/dashboard/notifications/${notificationId}/read`, {
      method: 'PUT',
      headers: this.getAuthHeaders()
    });
    return await this.handleResponse(response);
  }

  // Delete notification
  async deleteNotification(notificationId) {
    const response = await fetch(`${this.baseURL}/api/dashboard/notifications/${notificationId}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    });
    return await this.handleResponse(response);
  }

  // Get user folders
  async getUserFolders() {
    const response = await fetch(`${this.baseURL}/api/dashboard/folders`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });
    return await this.handleResponse(response);
  }

  // Create folder
  async createFolder(folderData) {
    const response = await fetch(`${this.baseURL}/api/dashboard/folders`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(folderData)
    });
    return await this.handleResponse(response);
  }

  // Update folder
  async updateFolder(folderId, folderData) {
    const response = await fetch(`${this.baseURL}/api/dashboard/folders/${folderId}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(folderData)
    });
    return await this.handleResponse(response);
  }

  // Delete folder
  async deleteFolder(folderId) {
    const response = await fetch(`${this.baseURL}/api/dashboard/folders/${folderId}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    });
    return await this.handleResponse(response);
  }

  // Get user profile
  async getUserProfile() {
    const response = await fetch(`${this.baseURL}/api/user/profile`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });
    return await this.handleResponse(response);
  }

  // Update user profile
  async updateUserProfile(profileData) {
    const response = await fetch(`${this.baseURL}/api/user/profile`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(profileData)
    });
    return await this.handleResponse(response);
  }

  // Change password
  async changePassword(passwordData) {
    const response = await fetch(`${this.baseURL}/api/user/change-password`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(passwordData)
    });
    return await this.handleResponse(response);
  }

  // Get user settings
  async getUserSettings() {
    const response = await fetch(`${this.baseURL}/api/user/settings`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });
    return await this.handleResponse(response);
  }

  // Update user settings
  async updateUserSettings(settingsData) {
    const response = await fetch(`${this.baseURL}/api/user/settings`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(settingsData)
    });
    return await this.handleResponse(response);
  }

  // Additional API endpoints from documentation
  // Note: getSessions() and deleteSession() are already defined above (lines 317, 326)
  // These were duplicates and have been removed to fix build errors

  // Health check endpoint
  async healthCheck() {
    const response = await fetch(`${this.baseURL}/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true'
      }
    });
    return await this.handleResponse(response);
  }

  // Get API documentation info
  async getApiDocs() {
    const response = await fetch(`${this.baseURL}/docs`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true'
      }
    });
    return await this.handleResponse(response);
  }

  // Get OpenAPI schema
  async getOpenApiSchema() {
    const response = await fetch(`${this.baseURL}/openapi.json`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true'
      }
    });
    return await this.handleResponse(response);
  }

  // Notes API Methods

  // Create a note
  async createNote(noteData) {
    const response = await fetch(`${this.baseURL}/api/notes`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(noteData)
    });
    return await this.handleResponse(response);
  }

  // Create note from document (helper method with proper field mapping)
  async createNoteFromDocument(noteData) {
    const payload = {
      title: noteData.title,
      content: noteData.content,
      reference_type: noteData.referenceType,
      reference_id: noteData.referenceId,
      reference_data: noteData.referenceData || null,
      folder_id: noteData.folderId || null,
      tags: noteData.tags || []
    };
    return this.createNote(payload);
  }

  // Get notes by reference (judgment, act, or mapping)
  async getNotesByReference(referenceType, referenceId) {
    const response = await fetch(`${this.baseURL}/api/notes/reference/${referenceType}/${referenceId}`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });
    return await this.handleResponse(response);
  }

  // List user notes with filters
  async getNotes(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(`${this.baseURL}/api/notes?${queryString}`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });
    return await this.handleResponse(response);
  }

  // Update a note
  async updateNote(noteId, noteData) {
    const response = await fetch(`${this.baseURL}/api/notes/${noteId}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(noteData)
    });
    return await this.handleResponse(response);
  }

  // Delete a note
  async deleteNote(noteId) {
    const response = await fetch(`${this.baseURL}/api/notes/${noteId}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    });
    return await this.handleResponse(response);
  }

  // Folders API Methods

  // List user folders
  async getFolders() {
    const response = await fetch(`${this.baseURL}/api/folders`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });
    const result = await this.handleResponse(response);
    // Handle different response formats
    if (result.success && result.data?.folders) {
      return result;
    } else if (Array.isArray(result)) {
      return { success: true, data: { folders: result } };
    } else if (result.data && Array.isArray(result.data)) {
      return { success: true, data: { folders: result.data } };
    }
    return result;
  }

  // Create a folder
  async createFolder(folderData) {
    const response = await fetch(`${this.baseURL}/api/folders`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(folderData)
    });
    return await this.handleResponse(response);
  }

  // Update a folder
  async updateFolder(folderId, folderData) {
    const response = await fetch(`${this.baseURL}/api/folders/${folderId}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(folderData)
    });
    return await this.handleResponse(response);
  }

  // Delete a folder
  async deleteFolder(folderId) {
    const response = await fetch(`${this.baseURL}/api/folders/${folderId}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    });
    return await this.handleResponse(response);
  }

  // YouTube Summary API Methods

  // Summarize YouTube video
  async summarizeYouTubeVideo(videoUrl) {
    const response = await fetch(`${this.baseURL}/api/yt_summary`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ url: videoUrl })
    });
    return await this.handleResponse(response);
  }

  // AI Assistant - Text-based chat with automatic tool usage
  // Updated to match new API documentation
  async llmChat(message, options = {}) {
    const {
      session_id = null,
      use_tools = null,
      limit = 10,
      max_tokens = 2000,
      temperature = 0.3,
      signal = null // AbortSignal for request cancellation
    } = options;

    // Build request body
    const requestBody = {
      message,
      limit: Math.max(1, Math.min(50, limit)), // Clamp between 1-50
      max_tokens: Math.max(100, Math.min(4000, max_tokens)), // Clamp between 100-4000
      temperature: Math.max(0.0, Math.min(2.0, temperature)) // Clamp between 0.0-2.0
    };

    // Add optional parameters
    if (session_id !== null && session_id !== undefined) {
      requestBody.session_id = session_id.toString();
      console.log('📤 API Request: Continuing session', session_id);
    } else {
      console.log('📤 API Request: Creating new session (no session_id)');
    }
    if (use_tools !== null && use_tools !== undefined) {
      requestBody.use_tools = use_tools;
    }
    
    console.log('📤 API Request Body:', JSON.stringify(requestBody, null, 2));

    // Use auth headers if token exists, otherwise use public headers
    const token = localStorage.getItem('access_token') || 
                  localStorage.getItem('accessToken') || 
                  localStorage.getItem('token');
    const hasToken = !!token && token !== 'null' && token !== 'undefined';

    const fetchOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
        ...(hasToken ? this.getAuthHeaders() : this.getPublicHeaders())
      },
      body: JSON.stringify(requestBody)
    };

    // Add abort signal if provided
    if (signal) {
      fetchOptions.signal = signal;
    }

    const response = await fetch(`${this.baseURL}/ai_assistant`, fetchOptions);
    return await this.handleResponse(response);
  }

  // Get all chat sessions for the current user
  async getChatSessions() {
    const token = localStorage.getItem('access_token') || 
                  localStorage.getItem('accessToken') || 
                  localStorage.getItem('token');
    const hasToken = !!token && token !== 'null' && token !== 'undefined';

    const response = await fetch(`${this.baseURL}/chat/sessions`, {
      method: 'GET',
      headers: {
        'ngrok-skip-browser-warning': 'true',
        ...(hasToken ? this.getAuthHeaders() : this.getPublicHeaders())
      }
    });
    return await this.handleResponse(response);
  }

  // Get messages for a specific session
  async getSessionMessages(sessionId, limit = 50) {
    const token = localStorage.getItem('access_token') || 
                  localStorage.getItem('accessToken') || 
                  localStorage.getItem('token');
    const hasToken = !!token && token !== 'null' && token !== 'undefined';

    const queryParams = new URLSearchParams();
    if (limit) {
      queryParams.append('limit', Math.max(1, Math.min(100, limit)).toString());
    }

    const response = await fetch(`${this.baseURL}/chat/sessions/${sessionId}/messages?${queryParams.toString()}`, {
      method: 'GET',
      headers: {
        'ngrok-skip-browser-warning': 'true',
        ...(hasToken ? this.getAuthHeaders() : this.getPublicHeaders())
      }
    });
    return await this.handleResponse(response);
  }

  // Update session title
  async updateSessionTitle(sessionId, title) {
    const token = localStorage.getItem('access_token') || 
                  localStorage.getItem('accessToken') || 
                  localStorage.getItem('token');
    const hasToken = !!token && token !== 'null' && token !== 'undefined';

    const response = await fetch(`${this.baseURL}/chat/sessions/${sessionId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
        ...(hasToken ? this.getAuthHeaders() : this.getPublicHeaders())
      },
      body: JSON.stringify({ title })
    });
    return await this.handleResponse(response);
  }

  // Delete a session
  async deleteSession(sessionId) {
    const token = localStorage.getItem('access_token') || 
                  localStorage.getItem('accessToken') || 
                  localStorage.getItem('token');
    const hasToken = !!token && token !== 'null' && token !== 'undefined';

    const response = await fetch(`${this.baseURL}/chat/sessions/${sessionId}`, {
      method: 'DELETE',
      headers: {
        'ngrok-skip-browser-warning': 'true',
        ...(hasToken ? this.getAuthHeaders() : this.getPublicHeaders())
      }
    });
    return await this.handleResponse(response);
  }

  // Speech to Text and AI Assistant Response - Voice input
  async speechToGemini(audioFile, useTools = null, limit = 10) {
    const formData = new FormData();
    formData.append('audio_file', audioFile);
    
    // Add optional parameters
    if (useTools !== null) {
      formData.append('use_tools', useTools);
    }
    formData.append('limit', limit.toString());

    // Get auth token for authorization header
    const token = localStorage.getItem('access_token') || 
                  localStorage.getItem('accessToken') || 
                  localStorage.getItem('token') ||
                  this.accessToken;

    const headers = {
      'ngrok-skip-browser-warning': 'true'
    };

    // Add authorization if token exists
    if (token && token !== 'null' && token !== 'undefined') {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${this.baseURL}/speech`, {
      method: 'POST',
      headers: headers,
      body: formData
    });
    return await this.handleResponse(response);
  }

  // Calendar API Methods
  // Create a new calendar event
  async createCalendarEvent(eventData) {
    const { event_title, description, date, time } = eventData;
    
    // Validate required fields
    if (!event_title || !date || !time) {
      throw new Error('Event title, date, and time are required');
    }

    // Format time to HH:MM:SS if needed
    let formattedTime = time;
    if (time && !time.includes(':')) {
      formattedTime = `${time}:00`;
    } else if (time && time.split(':').length === 2) {
      formattedTime = `${time}:00`;
    }

    const body = {
      event_title: event_title.trim(),
      date: date,
      time: formattedTime
    };

    // Add description if provided
    if (description && description.trim()) {
      body.description = description.trim();
    }

    const response = await fetch(`${this.baseURL}/api/calendar/events`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(body)
    });

    return await this.handleResponse(response);
  }

  // Get all calendar events with optional filters
  async getCalendarEvents(filters = {}) {
    const { start_date, end_date, limit = 100, offset = 0 } = filters;
    
    const params = new URLSearchParams();
    if (start_date) params.append('start_date', start_date);
    if (end_date) params.append('end_date', end_date);
    if (limit) params.append('limit', limit.toString());
    if (offset) params.append('offset', offset.toString());

    const url = `${this.baseURL}/api/calendar/events${params.toString() ? `?${params.toString()}` : ''}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });

    return await this.handleResponse(response);
  }

  // Get a specific calendar event by ID
  async getCalendarEventById(eventId) {
    const response = await fetch(`${this.baseURL}/api/calendar/events/${eventId}`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });

    return await this.handleResponse(response);
  }

  // Update a calendar event
  async updateCalendarEvent(eventId, updates) {
    const body = {};
    
    if (updates.event_title !== undefined) {
      body.event_title = updates.event_title.trim();
    }
    if (updates.description !== undefined) {
      body.description = updates.description ? updates.description.trim() : null;
    }
    if (updates.date !== undefined) {
      body.date = updates.date;
    }
    if (updates.time !== undefined) {
      // Format time to HH:MM:SS if needed
      let formattedTime = updates.time;
      if (formattedTime && !formattedTime.includes(':')) {
        formattedTime = `${formattedTime}:00`;
      } else if (formattedTime && formattedTime.split(':').length === 2) {
        formattedTime = `${formattedTime}:00`;
      }
      body.time = formattedTime;
    }

    const response = await fetch(`${this.baseURL}/api/calendar/events/${eventId}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(body)
    });

    return await this.handleResponse(response);
  }

  // Delete a calendar event
  async deleteCalendarEvent(eventId) {
    const response = await fetch(`${this.baseURL}/api/calendar/events/${eventId}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    });

    return await this.handleResponse(response);
  }

  // ==================== FEEDBACK API METHODS ====================

  // Submit/Update Summary Feedback
  async submitSummaryFeedback(data) {
    const { reference_type, reference_id, rating, feedback_text } = data;
    
    const response = await fetch(`${this.baseURL}/api/feedback/summary`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({
        reference_type,
        reference_id,
        rating: rating || null,
        feedback_text: feedback_text || null
      })
    });

    return await this.handleResponse(response);
  }

  // Get Summary Feedback for a specific item
  async getSummaryFeedback(reference_type, reference_id) {
    const response = await fetch(
      `${this.baseURL}/api/feedback/summary/${reference_type}/${reference_id}`,
      {
        method: 'GET',
        headers: this.getAuthHeaders()
      }
    );

    return await this.handleResponse(response);
  }

  // Get My Summary Feedback
  async getMySummaryFeedback(params = {}) {
    const { limit = 50, offset = 0, reference_type } = params;
    const queryParams = new URLSearchParams();
    if (limit) queryParams.append('limit', limit.toString());
    if (offset) queryParams.append('offset', offset.toString());
    if (reference_type) queryParams.append('reference_type', reference_type);

    const response = await fetch(
      `${this.baseURL}/api/feedback/summary/user/me?${queryParams.toString()}`,
      {
        method: 'GET',
        headers: this.getAuthHeaders()
      }
    );

    return await this.handleResponse(response);
  }

  // Delete Summary Feedback
  async deleteSummaryFeedback(feedback_id) {
    const response = await fetch(
      `${this.baseURL}/api/feedback/summary/${feedback_id}`,
      {
        method: 'DELETE',
        headers: this.getAuthHeaders()
      }
    );

    return await this.handleResponse(response);
  }

  // Submit/Update Chat Feedback
  async submitChatFeedback(data) {
    const { message_id, rating, feedback_text } = data;
    
    const response = await fetch(`${this.baseURL}/api/feedback/chat`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({
        message_id,
        rating: rating || null,
        feedback_text: feedback_text || null
      })
    });

    return await this.handleResponse(response);
  }

  // Get Chat Message Feedback
  async getChatMessageFeedback(message_id) {
    const response = await fetch(
      `${this.baseURL}/api/feedback/chat/message/${message_id}`,
      {
        method: 'GET',
        headers: this.getAuthHeaders()
      }
    );

    return await this.handleResponse(response);
  }

  // Get My Chat Feedback
  async getMyChatFeedback(params = {}) {
    const { limit = 50, offset = 0 } = params;
    const queryParams = new URLSearchParams();
    if (limit) queryParams.append('limit', limit.toString());
    if (offset) queryParams.append('offset', offset.toString());

    const response = await fetch(
      `${this.baseURL}/api/feedback/chat/user/me?${queryParams.toString()}`,
      {
        method: 'GET',
        headers: this.getAuthHeaders()
      }
    );

    return await this.handleResponse(response);
  }

  // Delete Chat Feedback
  async deleteChatFeedback(feedback_id) {
    const response = await fetch(
      `${this.baseURL}/api/feedback/chat/${feedback_id}`,
      {
        method: 'DELETE',
        headers: this.getAuthHeaders()
      }
    );

    return await this.handleResponse(response);
  }

  // Get Summary Feedback Statistics
  async getSummaryFeedbackStats(reference_type = null) {
    const queryParams = new URLSearchParams();
    if (reference_type) queryParams.append('reference_type', reference_type);

    const response = await fetch(
      `${this.baseURL}/api/feedback/stats/summary${queryParams.toString() ? `?${queryParams.toString()}` : ''}`,
      {
        method: 'GET',
        headers: this.getAuthHeaders()
      }
    );

    return await this.handleResponse(response);
  }

  // Get Chat Feedback Statistics
  async getChatFeedbackStats() {
    const response = await fetch(
      `${this.baseURL}/api/feedback/stats/chat`,
      {
        method: 'GET',
        headers: this.getAuthHeaders()
      }
    );

    return await this.handleResponse(response);
  }
}

// Create and export a singleton instance
const apiService = new ApiService();
export default apiService;
