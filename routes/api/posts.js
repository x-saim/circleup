const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const { check, validationResult } = require('express-validator');

//importing models
const User = require('../../models/User');
const Profile = require('../../models/Profile');
const Post = require('../../models/Post');

// @route   POST api/posts
// @desc    Create a post
// @access  Private

router.post('/',
  [auth,
    [
      check('text', 'Text is required')
        .not()
        .isEmpty()
    ]
  ],
  async (req, res) => {

    // Extract validation errors, if any
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const user = await User.findById(req.user.id).select('-password');

      const newPost = new Post({
        text: req.body.text,
        name: user.name,
        avatar: user.avatar,
        user: req.user.id
      });

      const post = await newPost.save();

      res.json(post);

    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error.');
    }

  });

// @route   GET api/posts
// @desc    Get all posts
// @access  Private

router.get('/', auth, async (req, res) => {

  try {
    //sorted by most recent post
    const posts = await Post.find().sort({ date: -1 });

    res.json(posts);


  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error.');
  }

})

// @route   GET api/posts/:id
// @desc    Get post by id
// @access  Private

router.get('/:id', auth, async (req, res) => {

  try {

    const post = await Post.findById(req.params.id)

    if (!post) {
      return res.status(404).json({ msg: 'Post not found' });
    }

    res.json(post);

  } catch (err) {
    console.error(err.message);

    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Post not found' })
    }

    res.status(500).send('Server Error.');
  }

})

// @route   DELETE api/posts/:id
// @desc    Delete post by id
// @access  Private

router.delete('/:id', auth, async (req, res) => {

  try {

    const post = await Post.findById(req.params.id)

    if (!post) {
      return res.status(404).json({ msg: 'Post not found' });
    }

    //Check if Logged in User is owner of post
    //post.user type: ObjectId
    //req.user.id type: String

    if (post.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });

    }

    // Use deleteOne() directly on the post object
    await post.deleteOne();

    res.json({ msg: 'Post removed' });

  } catch (err) {
    console.error(err.message);

    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Post not found' })
    }
    res.status(500).send('Server Error.');
  }

})

// @route   PUT api/posts/like/:id
// @desc    Like a post
// @access  Private

router.put('/like/:id', auth, async (req, res) => {

  try {

    const post = await Post.findById(req.params.id)

    //Check if post has been liked already.
    //Checking if current user liking is equal to the logged in user.
    const checkLike = post.likes.filter(like => like.user.toString() === req.user.id).length > 0;

    if (checkLike) {
      return res.status(400).json({ msg: 'Post already liked.' })
    }

    //Push user to beginning of likes array.
    post.likes.unshift({ user: req.user.id })

    await post.save();

    res.json(post.likes);

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error.');

  }

})

module.exports = router;