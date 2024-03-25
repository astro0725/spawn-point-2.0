const mongoose = require('mongoose');
const { ObjectId } = mongoose.Types;
const { Schema } = mongoose;

const reactionSchema = new Schema({
  contentId: {
    type: ObjectId,
    required: true,
    refPath: 'contentType'
  },
  contentType: {
    type: String,
    required: true,
    enum: ['comment', 'reply', 'post', 'guide']
  },
  user: {
    type: ObjectId,
    ref: 'user', 
    required: true,
  },
  emoji: {
    type: String, 
    required: true,
  },
}, { timestamps: true });

reactionSchema.index({
  contentId: 1, 
  user: 1, 
  emoji: 1
}, {
  unique: true,
  partialFilterExpression: {
    contentId: { $exists: true }
  }
});

module.exports = mongoose.model('reaction', reactionSchema);