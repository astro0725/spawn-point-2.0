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
    ref: 'user',
    required: true,
  },
  likes: [{
    type: ObjectId,
    ref: 'user',
  }],
  dislikes: [{
    type: ObjectId,
    ref: 'user',
  }],
  comments: [commentSchema],
  reactions: [reactionSchema],
  tags: [{
    type: String,
    trim: true,
  }],
  game: {
    type: ObjectId,
    ref: 'game',
    required: false,
  }
}, { timestamps: true });

guideSchema.virtual('commentCount').get(function() {
  return this.comments.length;
});

module.exports = mongoose.model('guide', guideSchema);