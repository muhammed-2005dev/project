const jwt = require('jsonwebtoken');

// Generate JWT token
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
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

module.exports = {
  signToken,
  verifyToken,
  decodeToken,
  createTokenResponse
};
