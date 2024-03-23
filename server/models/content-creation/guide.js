const mongoose = require('mongoose');
const { ObjectId } = mongoose.Types;
const { Schema } = mongoose;

const guideSchema = new Schema({
  content: {
    type: String,
    required: true,
    trim: true,
  },
  images: [{
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
  dislikes: [{
    type: ObjectId,
    ref: 'User',
  }],
  comments: [commentSchema],
  tags: [{
    type: String,
    trim: true,
  }],
}, { timestamps: true });

guideSchema.virtual('commentCount').get(function() {
  return this.comments.length;
});

module.exports = mongoose.model('guide', guideSchema);