// login.js - Handles login page functionality

document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.querySelector('.login-container form');
    
    // If user is already logged in, redirect to dashboard
    if (isLoggedIn()) {
      window.location.href = 'dashboard.html';
    }
    
    if (loginForm) {
      // Add id to the form for easier targeting
      loginForm.id = 'login-form';
      
      // Change method to get or remove method attribute to prevent 405 errors
      loginForm.method = 'get';
      // Alternatively, remove the method attribute
      // loginForm.removeAttribute('method');
      
      loginForm.addEventListener('submit', function(e) {
        e.preventDefault(); // Prevent the form from actually submitting
        
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        
        const result = login(email, password);
        
        if (result.success) {
          showMessage('success', result.message);
          // Redirect to dashboard after successful login
          setTimeout(() => {
            window.location.href = 'dashboard.html';
          }, 1500);
        } else {
          showMessage('error', result.message);
        }
      });
    }
    
    // Handle "Forgot Password" functionality
    const forgotPasswordLink = document.querySelector('.forgot-password a');
    if (forgotPasswordLink) {
      forgotPasswordLink.addEventListener('click', function(e) {
        e.preventDefault();
        
        // Get the current email if entered
        const emailInput = document.getElementById('email');
        const email = emailInput ? emailInput.value.trim() : '';
        
        // Create and show the password reset modal
        createPasswordResetModal(email);
      });
    }
  });
  
  // Create and display a modal for password reset
  function createPasswordResetModal(prefillEmail = '') {
    // Create modal container
    const modal = document.createElement('div');
    modal.className = 'auth-modal';
    
    // Create modal content
    modal.innerHTML = `
      <div class="modal-content">
        <span class="close-modal">&times;</span>
        <h3>Reset Your Password</h3>
        <div class="reset-step" id="step-email">
          <p>Enter your email address to receive a verification code.</p>
          <div class="form-group">
            <label for="reset-email">Email Address</label>
            <input type="email" id="reset-email" value="${prefillEmail}" required>
          </div>
          <button id="send-reset-code" class="login-btn-full">Send Reset Code</button>
        </div>
        <div class="reset-step" id="step-verify" style="display: none;">
          <p>Enter the verification code sent to your email.</p>
          <div class="form-group">
            <label for="reset-code">Verification Code</label>
            <input type="text" id="reset-code" required>
          </div>
          <div class="form-group">
            <label for="new-password">New Password</label>
            <input type="password" id="new-password" required>
          </div>
          <div class="form-group">
            <label for="confirm-new-password">Confirm New Password</label>
            <input type="password" id="confirm-new-password" required>
          </div>
          <button id="reset-password" class="login-btn-full">Reset Password</button>
        </div>
        <div id="reset-message"></div>
      </div>
    `;
    
    // Add modal to body
    document.body.appendChild(modal);
    
    // Show modal
    setTimeout(() => {
      modal.style.opacity = '1';
    }, 10);
    
    // Close modal when clicking on X
    const closeBtn = modal.querySelector('.close-modal');
    closeBtn.addEventListener('click', () => {
      modal.style.opacity = '0';
      setTimeout(() => {
        document.body.removeChild(modal);
      }, 300);
    });
    
    // Send reset code button
    const sendResetBtn = modal.querySelector('#send-reset-code');
    sendResetBtn.addEventListener('click', () => {
      const email = document.getElementById('reset-email').value.trim();
      const result = requestPasswordReset(email);
      
      if (result.success) {
        // Show verification step
        document.getElementById('step-email').style.display = 'none';
        document.getElementById('step-verify').style.display = 'block';
        showModalMessage(modal, 'success', result.message);
      } else {
        showModalMessage(modal, 'error', result.message);
      }
    });
    
    // Reset password button
    const resetPasswordBtn = modal.querySelector('#reset-password');
    resetPasswordBtn.addEventListener('click', () => {
      const email = document.getElementById('reset-email').value.trim();
      const code = document.getElementById('reset-code').value.trim();
      const newPassword = document.getElementById('new-password').value;
      const confirmNewPassword = document.getElementById('confirm-new-password').value;
      
      const result = completePasswordReset(email, code, newPassword, confirmNewPassword);
      
      if (result.success) {
        showModalMessage(modal, 'success', result.message);
        // Close modal and redirect to login page after successful reset
        setTimeout(() => {
          modal.style.opacity = '0';
          setTimeout(() => {
            document.body.removeChild(modal);
            // Reload the page to reset the form
            window.location.reload();
          }, 300);
        }, 1500);
      } else {
        showModalMessage(modal, 'error', result.message);
      }
    });
  }
  
  // Show message in modal
  function showModalMessage(modal, type, message) {
    const messageDiv = modal.querySelector('#reset-message');
    messageDiv.className = `message ${type}`;
    messageDiv.textContent = message;
    
    // Clear message after 5 seconds
    setTimeout(() => {
      messageDiv.textContent = '';
      messageDiv.className = '';
    }, 5000);
  }
  
  // Show message on the login page
  function showMessage(type, message) {
    // Check if message container exists, if not create it
    let messageContainer = document.querySelector('.message-container');
    
    if (!messageContainer) {
      messageContainer = document.createElement('div');
      messageContainer.className = 'message-container';
      const loginContainer = document.querySelector('.login-container');
      loginContainer.insertBefore(messageContainer, loginContainer.firstChild);
    }
    
    messageContainer.innerHTML = `<div class="message ${type}">${message}</div>`;
    
    // Clear message after 5 seconds
    setTimeout(() => {
      messageContainer.innerHTML = '';
    }, 5000);
  }