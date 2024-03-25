const mongoose = require('mongoose');
const { ObjectId } = mongoose.Types;
const { Schema } = mongoose;

const commentSchema = new Schema({
  content: {
    type: String,
    required: true,
    trim: true,
    maxLength: 200,
  },
  author: {
    type: ObjectId,
    ref: 'user',
    required: true,
  },
}, { timestamps: true });

module.exports = mongoose.model('comment', commentSchema);