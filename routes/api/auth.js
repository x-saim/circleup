const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const {check, validationResult} = require('express-validator');
const config = require('config');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const User = require('../../models/User');

// @route   GET api/auth
// @desc    Test route
// @access  Public

//adding auth as second parameter will run the middleware
router.get('/', auth, async(req, res) => {

  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (error) {
    console.error(err.message);
    res.status(500).send('Server Error.');
  }
});

// @route   POST api/auth
// @desc    Authenticate user & get token
// @access  Public

// Authenticate a user
router.post('/',
  [
    // Validation middleware for 'email' field
    check('email','Please include a valid email').isEmail(),

    // Validation middleware for 'password' field
    check('password','Password is required').exists()
  ],
  async(req, res) => {

    // Extract validation errors, if any
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // If there are validation errors, send a 400 response with the errors
      return res.status(400).json({errors: errors.array()});
    }

    // If validation passes, proceed with the route handler logic
    
    const {email, password} = req.body;
    
    try {

      // Check if the user already exists in the database
      let user = await User.findOne({email});
      
      if (!user) {
        return res
          .status(400)
          .json({errors: [{message: 'Invalid Credentials.'}]});
      }

      // Comparing the plain text password with the stored hashed password
      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return res
          .status(400)
          .json({errors: [{msg: 'Invalid Credentials.'}]});
      }

      // Create a JWT payload containing user information
      const payload = {
        user: {
          id: user.id
        }
      };

      // Sign the payload to create a JWT
      jwt.sign(
        payload,
        config.get("jwtSecret"),
        {expiresIn: 360000},
        (err, token) => {
          if (err)  throw err;
          res.json({token});
        });

    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  });


module.exports = router;