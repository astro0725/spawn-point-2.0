const mongoose = require('mongoose');
const { ObjectId } = mongoose.Types;
const { Schema } = mongoose;

const postSchema = new Schema({
  content: {
    type: String,
    required: true,
    trim: true,
    maxLength: 200,
  },
  image: [{
    url: {
      type: String,
      trim: true,
    },
  }],
  author: {
    type: ObjectId,
    ref: 'User',
    required: true,
  },
  likes: [{
    type: ObjectId,
    ref: 'User',
  }],
  reply: [replySchema],
  tags: [{
    type: String,
    trim: true,
  }],
}, { timestamps: true });

module.exports = mongoose.model('post', postSchema);
