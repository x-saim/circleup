//Handle registering users, adding users.

const express = require('express');
const router = express.Router(); // Create an instance of Express router
const {check, validationResults} = require('express-validator');

// @route   POST api/users
// @desc    Register User
// @access  Public

router.post('/',
  [
    // Validation middleware for 'name' field
    check('name', 'Name is required')
      .not()
      .isEmpty(),

    // Validation middleware for 'email' field
    check('email','Please include a valid email')
      .isEmail(),

    // Validation middleware for 'password' field
    check('password','Please enter a password with 6 or more characters')
      .isLength({min:6})
  ],
  (req, res) => {

    // Extract validation errors, if any
    const errors = validationResults(req);
    if (!errors.isEmpty()) {
      // If there are validation errors, send a 400 response with the errors
      return res.status(400).json({errors: errors.array()});
    }
    // If validation passes, proceed with the route handler logic
    // Send a response back to the client
    res.send('User route');


  });

module.exports = router;