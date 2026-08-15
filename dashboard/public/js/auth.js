/**
 * Hemix Bot Dashboard - Authentication Handler
 */

const TOKEN_KEY = 'hemix_token';

// Get stored JWT token
function getAuthToken() {
  return localStorage.getItem(TOKEN_KEY);
}

// Store JWT token
function setAuthToken(token) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

// Remove JWT token
function removeAuthToken() {
  localStorage.removeItem(TOKEN_KEY);
}

// Get authorization headers for fetch requests
function getAuthHeaders() {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

// Check auth status on server and redirect accordingly
async function checkAuthStatus() {
  const path = window.location.pathname;
  const isLoginPage = path.endsWith('/login.html') || path.includes('/login');
  const isSetupPage = path.endsWith('/setup.html') || path.includes('/setup');

  try {
    const res = await fetch('/api/auth/status', {
      headers: getAuthHeaders(),
    });

    if (!res.ok) {
      if (!isLoginPage && !isSetupPage) {
        window.location.href = '/login.html';
      }
      return;
    }

    const data = await res.json();
    const { setup_complete, logged_in } = data;

    if (!setup_complete) {
      if (!isSetupPage) {
        window.location.href = '/setup.html';
      }
      return;
    }

    if (!logged_in) {
      if (!isLoginPage && !isSetupPage) {
        window.location.href = '/login.html';
      }
      return;
    }

    // User is logged in and setup is complete
    if (isLoginPage || (isSetupPage && logged_in)) {
      window.location.href = '/index.html';
    }
  } catch (err) {
    console.error('Auth check error:', err);
  }
}

// Logout function
function handleLogout() {
  removeAuthToken();
  window.location.href = '/login.html';
}

// Setup Event Listeners when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  // Check auth status immediately
  checkAuthStatus();

  // Handle Login Form
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const passwordInput = document.getElementById('password');
      const errorEl = document.getElementById('login-error');
      const submitBtn = document.getElementById('login-submit-btn');

      if (!passwordInput || !passwordInput.value) {
        if (errorEl) {
          errorEl.textContent = 'Please enter your password.';
          errorEl.classList.remove('hidden');
        }
        return;
      }

      try {
        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Logging in...';
        }
        if (errorEl) errorEl.classList.add('hidden');

        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ password: passwordInput.value }),
        });

        const data = await res.json();

        if (res.ok && data.token) {
          setAuthToken(data.token);
          window.location.href = '/index.html';
        } else {
          if (errorEl) {
            errorEl.textContent = data.error || 'Invalid password. Please try again.';
            errorEl.classList.remove('hidden');
          }
        }
      } catch (err) {
        if (errorEl) {
          errorEl.textContent = 'Connection error. Please try again.';
          errorEl.classList.remove('hidden');
        }
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = '<i class="fas fa-sign-in-alt mr-2"></i> Log In';
        }
      }
    });
  }

  // Handle Setup Form
  const setupForm = document.getElementById('setup-password-form');
  if (setupForm) {
    setupForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const passwordInput = document.getElementById('setup-password');
      const confirmInput = document.getElementById('setup-confirm-password');
      const errorEl = document.getElementById('setup-error');
      const submitBtn = document.getElementById('setup-submit-btn');

      if (!passwordInput || !passwordInput.value || passwordInput.value.length < 4) {
        if (errorEl) {
          errorEl.textContent = 'Password must be at least 4 characters long.';
          errorEl.classList.remove('hidden');
        }
        return;
      }

      if (confirmInput && passwordInput.value !== confirmInput.value) {
        if (errorEl) {
          errorEl.textContent = 'Passwords do not match.';
          errorEl.classList.remove('hidden');
        }
        return;
      }

      try {
        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Creating Password...';
        }
        if (errorEl) errorEl.classList.add('hidden');

        const res = await fetch('/api/auth/setup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ password: passwordInput.value }),
        });

        const data = await res.json();

        if (res.ok && data.token) {
          setAuthToken(data.token);
          if (typeof window.onSetupPasswordSuccess === 'function') {
            window.onSetupPasswordSuccess();
          } else {
            window.location.href = '/index.html';
          }
        } else {
          if (errorEl) {
            errorEl.textContent = data.error || 'Failed to setup password.';
            errorEl.classList.remove('hidden');
          }
        }
      } catch (err) {
        if (errorEl) {
          errorEl.textContent = 'Connection error. Please try again.';
          errorEl.classList.remove('hidden');
        }
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = '<i class="fas fa-check-circle mr-2"></i> Set Password & Continue';
        }
      }
    });
  }

  // Handle Logout Buttons
  const logoutBtns = document.querySelectorAll('.logout-btn');
  logoutBtns.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      handleLogout();
    });
  });
});
