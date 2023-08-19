// getting json web toekn for auth

const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth')

// @route   GET api/auth
// @desc    Test route
// @access  Public

//adding auth as second parameter will run the middleware
router.get('/', auth, (req, res) => res.send('Auth route'));

module.exports = router;