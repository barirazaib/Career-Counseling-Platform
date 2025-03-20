// auth.js - Authentication system for Career Counseling Platform

// Mock database to store user information (in a real application, this would be a server-side database)
const users = JSON.parse(localStorage.getItem('users')) || [];

// Store verification codes temporarily
const verificationCodes = {};

// Save users to local storage
function saveUsers() {
  localStorage.setItem('users', JSON.stringify(users));
}

// Email validation using regex
function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Generate a random 6-digit verification code
function generateVerificationCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Mock function to send verification email (in a real app, this would use an email API)
function sendVerificationEmail(email, code) {
  // In a real application, you would integrate with an email service like SendGrid, Mailchimp, etc.
  console.log(`Sending verification code ${code} to ${email}`);
  
  // Store the verification code with the email
  verificationCodes[email] = {
    code: code,
    timestamp: Date.now() // To expire codes after a certain time
  };
  
  // For demo purposes, show the code in an alert
  alert(`Verification code sent to ${email}. For demo purposes, your code is: ${code}`);
  
  return true;
}

// Check if a user with the given email already exists
function userExists(email) {
  return users.some(user => user.email === email);
}

// Verify the code sent to email
function verifyCode(email, userInputCode) {
  const storedData = verificationCodes[email];
  
  if (!storedData) {
    return false; // No verification code found for this email
  }
  
  // Check if code is expired (15 minutes)
  const fifteenMinutes = 15 * 60 * 1000;
  if (Date.now() - storedData.timestamp > fifteenMinutes) {
    delete verificationCodes[email];
    return false;
  }
  
  // Check if the code matches
  return storedData.code === userInputCode;
}

// Login functionality
function login(email, password) {
  if (!validateEmail(email)) {
    return { success: false, message: "Please enter a valid email address." };
  }
  
  const user = users.find(user => user.email === email);
  
  if (!user) {
    return { success: false, message: "No account found with this email. Please sign up." };
  }
  
  if (user.password === password) {
    sessionStorage.setItem('currentUser', JSON.stringify(user));
    return { success: true, message: "Login successful!" };
  } else {
    return { success: false, message: "Incorrect password. Please try again." };
  }
}

// Start the signup process by sending verification code
function initiateSignup(firstName, lastName, email, password, confirmPassword, userType) {
  // Validate inputs
  if (!firstName || !lastName) {
    return { success: false, message: "Please enter your first and last name." };
  }
  
  if (!validateEmail(email)) {
    return { success: false, message: "Please enter a valid email address." };
  }
  
  if (userExists(email)) {
    return { success: false, message: "An account with this email already exists." };
  }
  
  if (password.length < 8) {
    return { success: false, message: "Password must be at least 8 characters long." };
  }
  
  if (password !== confirmPassword) {
    return { success: false, message: "Passwords do not match." };
  }
  
  if (!userType) {
    return { success: false, message: "Please select whether you are a student or mentor." };
  }
  
  // Generate and send verification code
  const verificationCode = generateVerificationCode();
  const emailSent = sendVerificationEmail(email, verificationCode);
  
  if (emailSent) {
    // Store user data temporarily
    sessionStorage.setItem('pendingUser', JSON.stringify({
      firstName,
      lastName,
      email,
      password,
      userType
    }));
    
    return { 
      success: true, 
      message: "Verification code sent to your email. Please check your inbox." 
    };
  } else {
    return { success: false, message: "Failed to send verification email. Please try again." };
  }
}

// Complete signup after verification
function completeSignup(email, verificationCode) {
  if (!verifyCode(email, verificationCode)) {
    return { success: false, message: "Invalid or expired verification code." };
  }
  
  // Get pending user data
  const pendingUser = JSON.parse(sessionStorage.getItem('pendingUser'));
  
  if (!pendingUser || pendingUser.email !== email) {
    return { success: false, message: "Something went wrong. Please restart the signup process." };
  }
  
  // Add user to database
  const newUser = {
    id: Date.now().toString(),
    firstName: pendingUser.firstName,
    lastName: pendingUser.lastName,
    email: pendingUser.email,
    password: pendingUser.password,
    userType: pendingUser.userType,
    createdAt: new Date().toISOString()
  };
  
  users.push(newUser);
  saveUsers();
  
  // Clean up
  sessionStorage.removeItem('pendingUser');
  delete verificationCodes[email];
  
  // Log in the new user
  sessionStorage.setItem('currentUser', JSON.stringify(newUser));
  
  return { success: true, message: "Account created successfully!" };
}

// Request password reset
function requestPasswordReset(email) {
  if (!validateEmail(email)) {
    return { success: false, message: "Please enter a valid email address." };
  }
  
  if (!userExists(email)) {
    return { success: false, message: "No account found with this email." };
  }
  
  const verificationCode = generateVerificationCode();
  const emailSent = sendVerificationEmail(email, verificationCode);
  
  if (emailSent) {
    sessionStorage.setItem('resetEmail', email);
    return { 
      success: true, 
      message: "Password reset code sent to your email." 
    };
  } else {
    return { success: false, message: "Failed to send reset email. Please try again." };
  }
}

// Complete password reset
function completePasswordReset(email, verificationCode, newPassword, confirmPassword) {
  if (!verifyCode(email, verificationCode)) {
    return { success: false, message: "Invalid or expired verification code." };
  }
  
  if (newPassword.length < 8) {
    return { success: false, message: "Password must be at least 8 characters long." };
  }
  
  if (newPassword !== confirmPassword) {
    return { success: false, message: "Passwords do not match." };
  }
  
  // Update user password
  const userIndex = users.findIndex(user => user.email === email);
  
  if (userIndex === -1) {
    return { success: false, message: "User not found." };
  }
  
  users[userIndex].password = newPassword;
  saveUsers();
  
  // Clean up
  delete verificationCodes[email];
  sessionStorage.removeItem('resetEmail');
  
  return { success: true, message: "Password reset successfully!" };
}

// Logout functionality
function logout() {
  sessionStorage.removeItem('currentUser');
  return { success: true, message: "Logged out successfully." };
}

// Check if user is logged in
function isLoggedIn() {
  return sessionStorage.getItem('currentUser') !== null;
}

// Get current user data
function getCurrentUser() {
  return JSON.parse(sessionStorage.getItem('currentUser'));
}