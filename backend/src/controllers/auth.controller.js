import asyncHandler from "express-async-handler";
import User from "../models/user.model.js";
import { generateTokens, verifyToken, isValidEmail, validatePassword } from "../utils/auth.js";
import { ENV } from "../config/env.js";

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
export const register = asyncHandler(async (req, res) => {
  const { firstName, lastName, username, email, password } = req.body;

  // Validation - only username, email, and password are required
  if (!username || !email || !password) {
    return res.status(400).json({
      message: "Username, email, and password are required"
    });
  }

  if (!isValidEmail(email)) {
    return res.status(400).json({
      message: "Please provide a valid email address"
    });
  }

  const passwordValidation = validatePassword(password);
  if (!passwordValidation.isValid) {
    return res.status(400).json({
      message: "Password validation failed",
      errors: passwordValidation.errors
    });
  }

  // Check if user already exists
  const existingUser = await User.findOne({
    $or: [{ email }, { username }]
  });

  if (existingUser) {
    const field = existingUser.email === email ? "email" : "username";
    return res.status(400).json({
      message: `User with this ${field} already exists`
    });
  }

  // Create user
  const user = await User.create({
    firstName: firstName || "",
    lastName: lastName || "",
    username,
    email,
    password,
    authProvider: 'local'
  });

  // Generate tokens
  const { accessToken, refreshToken } = generateTokens(user._id);

  // Set refresh token as httpOnly cookie
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: ENV.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  });

  res.status(201).json({
    message: "User registered successfully",
    user,
    accessToken
  });
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Validation
  if (!email || !password) {
    return res.status(400).json({
      message: "Email and password are required"
    });
  }

  if (!isValidEmail(email)) {
    return res.status(400).json({
      message: "Please provide a valid email address"
    });
  }

  // Find user and include password for comparison
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.comparePassword(password))) {
    return res.status(401).json({
      message: "Invalid email or password"
    });
  }

  // Check if user is using Google auth
  if (user.authProvider === 'google') {
    return res.status(400).json({
      message: "Please use Google sign-in for this account"
    });
  }

  // Generate tokens
  const { accessToken, refreshToken } = generateTokens(user._id);

  // Set refresh token as httpOnly cookie
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: ENV.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  });

  res.status(200).json({
    message: "Login successful",
    user,
    accessToken
  });
});

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
export const logout = asyncHandler(async (req, res) => {
  // Clear refresh token cookie
  res.clearCookie('refreshToken');

  res.status(200).json({
    message: "Logout successful"
  });
});

// @desc    Refresh access token
// @route   POST /api/auth/refresh
// @access  Public
export const refreshToken = asyncHandler(async (req, res) => {
  // For mobile apps, accept refresh token from body
  // For web apps, accept from httpOnly cookie
  const refreshTokenFromBody = req.body.refreshToken;
  const refreshTokenFromCookie = req.cookies.refreshToken;
  const refreshToken = refreshTokenFromBody || refreshTokenFromCookie;

  if (!refreshToken) {
    return res.status(401).json({
      message: "Refresh token not provided"
    });
  }

  try {
    const decoded = verifyToken(refreshToken, ENV.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({
        message: "User not found"
      });
    }

    // Generate new tokens
    const { accessToken, refreshToken: newRefreshToken } = generateTokens(user._id);

    // For web apps, set cookie
    if (refreshTokenFromCookie) {
      res.cookie('refreshToken', newRefreshToken, {
        httpOnly: true,
        secure: ENV.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });
    }

    // Always return tokens in response for mobile compatibility
    res.status(200).json({
      message: "Token refreshed successfully",
      accessToken,
      refreshToken: newRefreshToken // Include for mobile apps
    });

  } catch (error) {
    if (refreshTokenFromCookie) {
      res.clearCookie('refreshToken');
    }
    return res.status(401).json({
      message: "Invalid refresh token"
    });
  }
});

// @desc    Google OAuth callback
// @route   GET /api/auth/google/callback
// @access  Public
export const googleCallback = asyncHandler(async (req, res) => {
  const user = req.user;

  console.log('Google OAuth Callback - State:', req.query.state);
  console.log('Google OAuth Callback - User-Agent:', req.get('User-Agent'));

  if (!user) {
    console.error('Google OAuth failed: No user found');
    return res.status(400).json({
      success: false,
      message: "Google authentication failed"
    });
  }

  // Generate tokens
  const { accessToken, refreshToken } = generateTokens(user._id);

  // Check if this is a mobile app request
  // The state parameter is preserved by Google OAuth
  const state = req.query.state || '';
  const isMobileApp = state.includes('mobile=true') || req.get('User-Agent')?.includes('Expo') || req.get('User-Agent')?.includes('okhttp');

  console.log('Is Mobile App:', isMobileApp);

  if (isMobileApp) {
    // For mobile apps, redirect to custom scheme with response data
    const responseData = {
      success: true,
      message: "Google authentication successful",
      user,
      accessToken,
      refreshToken // Include refresh token for mobile
    };
    
    const encodedResponse = encodeURIComponent(JSON.stringify(responseData));
    const redirectUrl = `sohba://auth/google/callback?response=${encodedResponse}`;
    
    console.log('Redirecting to mobile app:', redirectUrl.substring(0, 50) + '...');
    return res.redirect(redirectUrl);
  }

  // For web apps, set httpOnly cookie and return JSON
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: ENV.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  });

  res.status(200).json({
    success: true,
    message: "Google authentication successful",
    user,
    accessToken
  });
});

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
export const getCurrentUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);

  if (!user) {
    return res.status(404).json({
      message: "User not found"
    });
  }

  res.status(200).json({
    user
  });
});
