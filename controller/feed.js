const { validationResult } = require('express-validator/check');
const fs = require('fs');
const Socket = require('../socket.io');
const path = require('path');
const Post = require('../modal/post');
const user = require('../modal/user');
const getAllPost = async (req, res, next) => {
  const currentPage = req.query.page || 1;
  let total = 0;
  const limits = 2;
  try {
    total = await Post.countDocuments();
    const post = await Post.find()
      .populate('creator')
      .sort({ createdAt: -1 })
      .skip((currentPage - 1) * limits)
      .limit(limits);

    res.status(200).json({
      post: post,
      totalItems: total,
    });
  } catch (error) {
    next(error);
  }
};
const createPost = (req, res, next) => {
  const io = Socket.getIo();
  const error = validationResult(req);
  const title = req.body.title;
  const message = req.body.content;

  if (!error.isEmpty()) {
    const err = new Error('Validation Failed');
    err.statusCode = 422;
    throw err;
  }

  const imageUrl = req.file.originalname.replace('\\', '/');
  const post = new Post({
    content: message,
    title: title,
    creator: req.userId,
    imageUrl: new Date().getSeconds() + imageUrl,
  });
  let users;
  post
    .save()
    .then(ress => {
      return user.findById(req.userId);
    })
    .then(ress => {
      users = ress;
      ress.posts.push(post);
      return ress.save();
    })
    .then(ress => {
      io.emit('posts', {
        action: 'create',
        post: { ...post._doc, creator: { _id: req.userId, name: users.name } },
      });
      return res.status(201).json({
        ...post,
        name: users.name,
        userId: users._id,
      });
    })
    .catch(err => {
      err.statusCode = 500;
      next(err);
    });
};

const getPost = (req, res, next) => {
  const _id = req.params.postId;

  Post.findById(_id)
    .then(ress => {
      if (!ress) {
        const error = new Error('Could not found any post.');
        error.statusCode = 404;
        throw error;
      }

      res.status(200).json({
        post: ress,
      });
    })
    .catch(err => {
      err.statusCode = 500;
      next(err);
    });
};
const DeleteImage = paths => {
  console.log(path.join(__dirname, '..', 'images', paths), 'deleted');
  fs.unlinkSync(path.join(__dirname, '..', 'images', paths));
};
const EditPost = async (req, res, next) => {
  const _id = req.params.postId;
  const title = req.body.title;
  const content = req.body.content;
  const image = req.file?.filename || req.body?.image;
  const error = validationResult(req);
  const io = Socket.getIo();
  if (!error.isEmpty()) {
    const err = new Error('Validation Failed');
    err.statusCode = 422;
    throw err;
  }
  await Post.findById(_id)
    .populate('creator')
    .then(ress => {
      if (!ress) {
        const error = new Error('Could not found any post.');
        error.statusCode = 404;
        throw error;
      }

      if (ress.imageUrl !== image.toString()) {
        DeleteImage(ress.imageUrl);
      }
      ress.imageUrl = image.toString();
      ress.title = title;
      ress.content = content;
      return ress.save();
    })
    .then(ress => {
      io.emit('posts', { action: 'update', post: ress });
      res.status(200).json(ress);
    })
    .catch(err => {
      err.statusCode = 500;
      next(err);
    });
};

const PostDelete = (req, res, next) => {
  const error = validationResult(req);
  if (!error.isEmpty()) {
    const err = new Error('Validation Failed');
    err.statusCode = 422;
    throw err;
  }
  const io = Socket.getIo();
  const _id = req.params.postId;
  let current;
  Post.findById(_id)
    .populate('creator')
    .then(ress => {
      if (!ress) {
        const error = new Error('Could not found any post.');
        error.statusCode = 404;
        throw error;
      }
      if (ress.creator._id.toString() !== req.userId.toString()) {
        const error = new Error('Not Authenticated');
        error.statusCode = 402;
        throw error;
      }
      current = ress;
      return user.findById(req.userId);
    })
    .then(ress => {
      ress.posts.splice(_id);
      return ress.save();
    })
    .then(ress => {
      DeleteImage(current.imageUrl);
      return Post.findByIdAndRemove(_id);
    })
    .then(ress => {
      io.emit('posts', { action: 'delete' });
      res.status(200).json({
        message: 'POST DELETED',
      });
    })
    .catch(err => {
      err.statusCode = 500;
      next(err);
    });
};

const getStatus = (req, res, next) => {
  const error = validationResult(req);
  if (!error.isEmpty()) {
    const err = new Error('Validation Failed');
    err.statusCode = 422;
    throw err;
  }
  const id = req.userId;
  user
    .findById(id)
    .then(result => {
      return res.status(200).json({
        status: result.status,
      });
    })
    .catch(err => {
      err.statusCode = 500;
      next(err);
    });
};

const postStatus = (req, res, next) => {
  const error = validationResult(req);
  if (!error.isEmpty()) {
    const err = new Error('Validation Failed');
    err.statusCode = 422;
    throw err;
  }
  const id = req.userId;
  user
    .findById(id)
    .then(result => {
      result.status = req.body.status;
      return result.save();
    })
    .then(result => {
      return res.status(200).json({
        status: result.status,
      });
    })
    .catch(err => {
      err.statusCode = 500;
      next(err);
    });
};

module.exports = {
  getAllPost,
  createPost,
  getPost,
  EditPost,
  PostDelete,
  getStatus,
  postStatus,
};
