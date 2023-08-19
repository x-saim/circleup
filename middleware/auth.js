const jwt = require('jsonwebtoken');
const config = require('config');

// Middleware function to log incoming requests & verify JWT token
module.exports = function(req, res, next) {

  //Get token from header
  const token = req.header('x-auth-token');

  //Check if no token
  if (!token) return res.status(401).json({ message: 'Unauthorized' });

  try {
    // Decode and verify the token
    const decoded = jwt.verify(token, config.get("jwtSecret"));
  
    // Attach the decoded user to the request object
    req.user = decoded.user;
    next();
    
  } catch (error) {
    // Handle token verification errors
    return res.status(403).json({ message: 'Invalid token' });
  }
};