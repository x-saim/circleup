//Handle registering users, adding users.

const express = require('express');
const router = express.Router(); // Create an instance of Express router
const {check, validationResult} = require('express-validator');
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');

//Model
const User = require('../../models/User.js');

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

      //assigns matching query criteria to user
      let user = await User.findOne({email});
      
      if (user) {
        res.status(400).json({errors: [{msg: 'User already exists.'}]});
      }

      //get users gravatar
      const avatar = gravatar.url(email, {
        s: '200',  //default size
        r: 'pg', //rating
        d: 'mm' //default image
      });

      //create instance of user, this does not save the user yet. We want to save the user after encryption of password.
      user = new User({
        name,
        email,
        avatar,
        password
      });

      // Encrypt password
      // Generate a salt
      const salt = await bcrypt.genSalt(10);
      
      user.password = await bcrypt.hash(password, salt);

      await user.save();

      //return jsonwebtoken


      // Send a response back to the client
      res.send('User registered');

    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }

  


  });

module.exports = router;