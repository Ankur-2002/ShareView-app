const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Post = new Schema(
  {
    title: {
      type: String,
      require: true,
    },
    imageUrl: {
      type: String,
    },
    creator: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Post', Post);
