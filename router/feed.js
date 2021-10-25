const express = require('express');
const FeedController = require('../controller/feed');
const router = express.Router();
const { body } = require('express-validator');
const isAuth = require('../middleware/is-auth');
router.get('/post/:postId', FeedController.getPost);
router.get('/post', isAuth.isAuth, FeedController.getAllPost);
router.post(
  '/post',
  isAuth.isAuth,
  [body('title').isLength({ min: 5 }), body('content').isLength({ min: 5 })],
  FeedController.createPost
);

router.put(
  '/post/:postId',
  isAuth.isAuth,
  [body('title').isLength({ min: 5 }), body('content').isLength({ min: 5 })],
  FeedController.EditPost
);

router.delete('/post/:postId', isAuth.isAuth, FeedController.PostDelete);
router.get('/status', isAuth.isAuth, FeedController.getStatus);

router.put('/status', isAuth.isAuth, FeedController.postStatus);
module.exports = router;
