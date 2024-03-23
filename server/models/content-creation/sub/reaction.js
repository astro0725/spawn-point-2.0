const mongoose = require('mongoose');
const { ObjectId } = mongoose.Types;
const { Schema } = mongoose;

const reactionSchema = new Schema({
  comment: {
    type: ObjectId,
    ref: 'comment',  
    required: true,
  },
  reply: {
    type: ObjectId,
    ref:'reply',  
    required: true,
  },
  post: {
    type: ObjectId,
    ref: 'post',  
    required: true,
  },
  guide: {
    type: ObjectId,
    ref: 'guide',  
    required: true,
  },
  user: {
    type: ObjectId,
    ref: 'User', 
    required: true,
  },
  emoji: {
    type: String, 
    required: true,
  },
}, { timestamps: true});

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