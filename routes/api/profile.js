const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const { check, validationResult } = require('express-validator');

const Profile = require('../../models/Profile');
const User = require('../../models/User');

// @route   GET api/profile/me
// @desc    Get current user's profile
// @access  Private

router.get('/me', auth, async(req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id }).populate('user', ['name', 'avatar']);

    if (!profile) {
      return res.status(400).json({ msg: 'There is no profile for this user.' });
    }
    res.json(profile);

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error.');
  }
});

// @route   POST api/profile
// @desc    Create or update user profile.
// @access  Private

router.post('/', [
  auth,
  [check('status', 'Status is required').not().isEmpty(),
    check('skills', 'Skills are required').not().isEmpty()
  ]],
async(req, res) => {
  // Extract validation errors, if any
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  // Destructure data from the request body
  const {
    company,
    website,
    location,
    bio,
    status,
    githubusername,
    skills,
    youtube,
    facebook,
    twitter,
    instagram,
    linkedin
  } = req.body;

  // Build Profile Object
  const profileFields = {};
  profileFields.user = req.user.id;
  if (company) profileFields.company = company;
  if (website) profileFields.website = website;
  if (location) profileFields.location = location;
  if (bio) profileFields.bio = bio;
  if (status) profileFields.status = status;
  if (githubusername) profileFields.githubusername = githubusername;

  // Skills - split into an array
  if (skills) {
    profileFields.skills = skills.split(',').map(skill => skill.trim());
  }

  // Social links
  profileFields.social = {};
  if (youtube) profileFields.social.youtube = youtube;
  if (facebook) profileFields.social.facebook = facebook;
  if (twitter) profileFields.social.twitter = twitter;
  if (instagram) profileFields.social.instagram = instagram;
  if (linkedin) profileFields.social.linkedin = linkedin;

  try {
    let profile = await Profile.findOne({ user: req.user.id });

    if (profile) {
      // Update existing profile
      profile = await Profile.findOneAndUpdate(
        { user: req.user.id },
        { $set: profileFields },
        { new: true }
      );

      return res.json(profile);
    }

    // Create new profile
    profile = new Profile(profileFields);
    await profile.save();
    res.json(profile);

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }

}

);


// @route   GET api/profile
// @desc    Get all profiles
// @access  Public

router.get('/', async(req, res) => {

  try {
    const profiles = await Profile.find().populate('user', ['name', 'avatar']);
    res.json(profiles);

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }

});

// @route   GET api/profile/user/:user_id
// @desc    Get profile by user id
// @access  Public

router.get('/user/:user_id', async(req, res) => {

  try {
    const profile = await Profile.findOne({ user: req.params.user_id }).populate('user', ['name', 'avatar']);

    if (!profile) {
      return res.status(400).json({ msg: 'Profile not found.' });
    }

    res.json(profile);

  } catch (err) {
    console.error(err.message);

    //Checks if incorrect id inputted, looks for specific type of Server Error.
    if (err.kind === 'ObjectId') {
      return res.status(400).json({ msg: 'Profile not found.' });
    }

    res.status(500).send('Server Error');
  }

});


// @route   DELETE api/profile
// @desc    Delete profile, user & posts
// @access  Private

router.delete('/', auth, async(req, res) => {

  try {
    // TO DO remove users posts
    //Remove profile
    await Profile.findOneAndRemove({ user: req.user.id });

    //Remove user
    await User.findOneAndRemove({ _id: req.user.id });

    res.json({ msg: 'User deleted' });

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }

});

// @route   PUT api/profile/experience
// @desc    Add profile experience
// @access  Private

router.put('/experience',
  [auth,
    [check('title', 'Title is required')
      .not()
      .isEmpty(),
    check('company', 'Company is required')
      .not()
      .isEmpty(),
    check('from', 'From date is required')
      .not()
      .isEmpty()
    ]
  ],
  async(req, res) => {

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const newExp = { ...req.body };

    try {

      const profile = await Profile.findOne({ user: req.user.id });

      //unshift is similar to push but instead it pushes to the front of array.
      profile.experience.unshift(newExp);

      await profile.save();
      res.json(profile);

    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }



  });

// @route   Delete api/profile/experience/:exp_id
// @desc    Delete profile experience
// @access  Private


router.delete('/experience/:exp_id', auth, async(req, res) => {

  try {

    const profile = await Profile.findOne({ user: req.user.id });

    //Get index of experience to be removed.

    const removeIndex = profile.experience
      .map(item => item.id)
      .indexOf(req.params.exp_id);

    profile.experience.splice(removeIndex, 1);

    await profile.save();

    res.json(profile);

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }

});

// @route   PUT api/profile/education
// @desc    Add profile education
// @access  Private

router.put('/education',
  [auth,
    [check('school', 'School is required')
      .not()
      .isEmpty(),
    check('degree', 'Degree is required')
      .not()
      .isEmpty(),
    check('fieldofstudy', 'Field of study is required')
      .not()
      .isEmpty(),
    check('from', 'From date is required')
      .not()
      .isEmpty()
    ]
  ],
  async(req, res) => {

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const newEdu = { ...req.body };

    try {

      const profile = await Profile.findOne({ user: req.user.id });

      //unshift is similar to push but instead it pushes to the front of array.
      profile.education.unshift(newEdu);

      await profile.save();
      res.json(profile);

    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }



  });

// @route   Delete api/profile/education/:edu_id
// @desc    Delete profile education
// @access  Private

router.delete('/education/:exp_id', auth, async(req, res) => {

  try {

    const profile = await Profile.findOne({ user: req.user.id });

    //Get index of education to be removed.

    const removeIndex = profile.education
      .map(item => item.id)
      .indexOf(req.params.edu_id);

    profile.education.splice(removeIndex, 1);

    await profile.save();

    res.json(profile);

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});



module.exports = router;