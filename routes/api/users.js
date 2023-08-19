//Handle registering users, adding users.

const express = require('express');
const router = express.Router(); // Create an instance of Express router
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');
const {check, validationResult} = require('express-validator');

//Model
const User = require('../../models/User.js');

// @route   POST api/users
// @desc    Register User
// @access  Public

// Registering a user
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
  async(req, res) => {

    // Extract validation errors, if any
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // If there are validation errors, send a 400 response with the errors
      return res.status(400).json({errors: errors.array()});
    }

    // If validation passes, proceed with the route handler logic
    
    const {name, email, password} = req.body;
    
    try {

      // Check if the user already exists in the database
      let user = await User.findOne({email});
      
      if (user) {
        return res.status(400).json({errors: [{msg: 'User already exists.'}]});
      }

      // Get user's Gravatar image
      const avatar = gravatar.url(email, {
        s: '200',  //default size
        r: 'pg', //rating
        d: 'mm' //default image
      });

      // Create a new user instance
      user = new User({
        name,
        email,
        avatar,
        password
      });

      // Encrypt the user's password
      const salt = await bcrypt.genSalt(10);
      
      user.password = await bcrypt.hash(password, salt);
      
      // Save the user in the database
      await user.save();


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