// signup.js - Handles signup page functionality

document.addEventListener('DOMContentLoaded', function() {
    const signupForm = document.querySelector('.signup-container form');
    
    // If user is already logged in, redirect to dashboard
    if (isLoggedIn()) {
      window.location.href = 'dashboard.html';
    }
    
    if (signupForm) {
      // Add id to the form for easier targeting
      signupForm.id = 'signup-form';
      
      // Change method to get or remove method attribute to prevent 405 errors
      signupForm.method = 'get';
      // Alternatively, remove the method attribute
      // signupForm.removeAttribute('method');
      
      signupForm.addEventListener('submit', function(e) {
        e.preventDefault(); // Prevent the form from actually submitting
        
        const firstName = document.getElementById('first-name').value.trim();
        const lastName = document.getElementById('last-name').value.trim();
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirm-password').value;
        const userType = document.getElementById('user-type').value;
        const termsChecked = document.getElementById('terms').checked;
        
        if (!termsChecked) {
          showMessage('error', 'You must agree to the Terms of Service and Privacy Policy.');
          return;
        }
        
        const result = initiateSignup(firstName, lastName, email, password, confirmPassword, userType);
        
        if (result.success) {
          // Show verification step
          createVerificationModal(email);
        } else {
          showMessage('error', result.message);
        }
      });
    }
  });
  
  // Create and display a modal for email verification
  function createVerificationModal(email) {
    // Create modal container
    const modal = document.createElement('div');
    modal.className = 'auth-modal';
    
    // Create modal content
    modal.innerHTML = `
      <div class="modal-content">
        <span class="close-modal">&times;</span>
        <h3>Verify Your Email</h3>
        <p>We've sent a verification code to ${email}.</p>
        <div class="form-group">
          <label for="verification-code">Verification Code</label>
          <input type="text" id="verification-code" required>
        </div>
        <button id="verify-button" class="signup-btn-full">Verify Account</button>
        <p id="verification-message"></p>
        <div class="resend-code">
          <p>Didn't receive the code? <a href="#" id="resend-code">Resend Code</a></p>
        </div>
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
      if (confirm('Are you sure you want to cancel? You will need to restart the signup process.')) {
        modal.style.opacity = '0';
        setTimeout(() => {
          document.body.removeChild(modal);
        }, 300);
      }
    });
    
    // Verify button
    const verifyBtn = modal.querySelector('#verify-button');
    verifyBtn.addEventListener('click', () => {
      const code = document.getElementById('verification-code').value.trim();
      
      const result = completeSignup(email, code);
      
      if (result.success) {
        showVerificationMessage(modal, 'success', result.message);
        // Redirect to dashboard after successful verification
        setTimeout(() => {
          window.location.href = 'dashboard.html';
        }, 2000);
      } else {
        showVerificationMessage(modal, 'error', result.message);
      }
    });
    
    // Resend code
    const resendBtn = modal.querySelector('#resend-code');
    resendBtn.addEventListener('click', (e) => {
      e.preventDefault();
      
      // Get user data from session storage
      const pendingUser = JSON.parse(sessionStorage.getItem('pendingUser'));
      
      if (pendingUser) {
        const newCode = generateVerificationCode();
        const emailSent = sendVerificationEmail(pendingUser.email, newCode);
        
        if (emailSent) {
          showVerificationMessage(modal, 'success', 'Verification code resent.');
        } else {
          showVerificationMessage(modal, 'error', 'Failed to resend verification code.');
        }
      } else {
        showVerificationMessage(modal, 'error', 'Session expired. Please restart the signup process.');
        
        // Close modal after delay
        setTimeout(() => {
          modal.style.opacity = '0';
          setTimeout(() => {
            document.body.removeChild(modal);
          }, 300);
        }, 2000);
      }
    });
  }
  
  // Show message in verification modal
  function showVerificationMessage(modal, type, message) {
    const messageElement = modal.querySelector('#verification-message');
    messageElement.className = `message ${type}`;
    messageElement.textContent = message;
    
    // Clear message after 5 seconds if it's an error
    if (type === 'error') {
      setTimeout(() => {
        messageElement.textContent = '';
        messageElement.className = '';
      }, 5000);
    }
  }
  
  // Show message on the signup page
  function showMessage(type, message) {
    // Check if message container exists, if not create it
    let messageContainer = document.querySelector('.message-container');
    
    if (!messageContainer) {
      messageContainer = document.createElement('div');
      messageContainer.className = 'message-container';
      const signupContainer = document.querySelector('.signup-container');
      signupContainer.insertBefore(messageContainer, signupContainer.firstChild);
    }
    
    messageContainer.innerHTML = `<div class="message ${type}">${message}</div>`;
    
    // Clear message after 5 seconds
    setTimeout(() => {
      messageContainer.innerHTML = '';
    }, 5000);
  }