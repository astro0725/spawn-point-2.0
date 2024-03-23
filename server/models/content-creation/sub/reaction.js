const mongoose = require('mongoose');
const { ObjectId } = mongoose.Types;
const { Schema } = mongoose;

const reactionSchema = new Schema({
  message: {
    type: ObjectId,
    ref: 'Message', 
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

reactionSchema.index({ message: 1, user: 1, emoji: 1 }, { unique: true });

module.exports = mongoose.model('reaction', reactionSchema);