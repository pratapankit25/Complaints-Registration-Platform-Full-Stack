// auth.js
document.addEventListener('DOMContentLoaded', async () => {
  // Determine which page we are on
  const path = window.location.pathname;
  const isLoginPage = path.endsWith('index.html') || path === '/' || path.endsWith('Frontend/');
  const isRegisterPage = path.endsWith('register.html');

  // Check session on load
  const user = await checkSession();
  
  if (user) {
    // If logged in and on auth pages, redirect
    if (isLoginPage || isRegisterPage) {
      if (user.role === 'admin') {
        window.location.href = 'admin-dashboard.html';
      } else {
        window.location.href = 'my-complaints.html';
      }
    }
  }

  // Handle Login
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      const btn = loginForm.querySelector('button');

      try {
        btn.disabled = true;
        btn.textContent = 'Logging in...';
        const user = await apiFetch('/auth/login', {
          method: 'POST',
          body: JSON.stringify({ email, password })
        });
        
        if (user.role === 'admin') {
          window.location.href = 'admin-dashboard.html';
        } else {
          window.location.href = 'my-complaints.html';
        }
      } catch (error) {
        showError('loginAlert', error.message);
        btn.disabled = false;
        btn.textContent = 'Login';
      }
    });
  }

  // Handle Register Flow
  const registerForm = document.getElementById('registerForm');
  const otpForm = document.getElementById('otpForm');
  const passwordForm = document.getElementById('passwordForm');

  let currentEmail = '';
  let currentOtp = '';

  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = document.getElementById('name').value;
      const email = document.getElementById('email').value;
      const btn = registerForm.querySelector('button');

      try {
        btn.disabled = true;
        btn.textContent = 'Sending OTP...';
        await apiFetch('/auth/send-otp', {
          method: 'POST',
          body: JSON.stringify({ name, email })
        });
        
        currentEmail = email;
        registerForm.classList.add('hidden');
        otpForm.classList.remove('hidden');
      } catch (error) {
        showError('registerAlert', error.message);
        btn.disabled = false;
        btn.textContent = 'Send OTP';
      }
    });
  }

  if (otpForm) {
    otpForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      currentOtp = document.getElementById('otp').value;
      
      otpForm.classList.add('hidden');
      passwordForm.classList.remove('hidden');
    });
  }

  if (passwordForm) {
    passwordForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const password = document.getElementById('password').value;
      const confirmPassword = document.getElementById('confirmPassword').value;
      const btn = passwordForm.querySelector('button');

      if (password !== confirmPassword) {
        return showError('passwordAlert', 'Passwords do not match');
      }

      try {
        btn.disabled = true;
        btn.textContent = 'Registering...';
        await apiFetch('/auth/register', {
          method: 'POST',
          body: JSON.stringify({ email: currentEmail, otp: currentOtp, password })
        });
        
        showSuccess('passwordAlert', 'Registration successful! Redirecting to login...');
        setTimeout(() => {
          window.location.href = 'index.html';
        }, 1500);
      } catch (error) {
        showError('passwordAlert', error.message);
        btn.disabled = false;
        btn.textContent = 'Complete Registration';
      }
    });
  }
});
