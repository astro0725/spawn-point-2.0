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
  reactions: [reactionSchema],
  tags: [{
    type: String,
    trim: true,
  }],
}, { timestamps: true });

postSchema.virtual('replyCount').get(function() {
  return this.reply.length;
});

module.exports = mongoose.model('post', postSchema);
