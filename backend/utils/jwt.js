const jwt = require('jsonwebtoken');

// Generate JWT token
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

// Generate refresh token
const signRefreshToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRE || '30d'
  });
};

// Generate email verification token
const signEmailVerificationToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '24h'
  });
};

// Generate password reset token
const signPasswordResetToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '10m'
  });
};

// Verify JWT token
const verifyToken = (token, secret = process.env.JWT_SECRET) => {
  try {
    return jwt.verify(token, secret);
  } catch (error) {
    throw new Error('Invalid token');
  }
};

// Decode JWT token without verification
const decodeToken = (token) => {
  return jwt.decode(token);
};

// Generate token pair (access + refresh)
const generateTokenPair = (id) => {
  const accessToken = signToken(id);
  const refreshToken = signRefreshToken(id);
  
  return {
    accessToken,
    refreshToken
  };
};

// Create token response
const createTokenResponse = (user, statusCode, res) => {
  const token = signToken(user._id);
  
  // Remove password from output
  user.password = undefined;
  
  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user
    }
  });
};

// Create token pair response
const createTokenPairResponse = (user, statusCode, res) => {
  const { accessToken, refreshToken } = generateTokenPair(user._id);
  
  // Remove password from output
  user.password = undefined;
  
  res.status(statusCode).json({
    status: 'success',
    accessToken,
    refreshToken,
    data: {
      user
    }
  });
};

module.exports = {
  signToken,
  signRefreshToken,
  signEmailVerificationToken,
  signPasswordResetToken,
  verifyToken,
  decodeToken,
  generateTokenPair,
  createTokenResponse,
  createTokenPairResponse
};
