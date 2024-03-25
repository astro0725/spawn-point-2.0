const mongoose = require('mongoose');
const {ObjectId} = mongoose.Schema.Types;
const { Schema } = mongoose;

const notificationSchema = new Schema({
  type: {
    type: String,
    enum: ['new_follower', 'new_message', 'content_like', 'comment_on_post'],
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  userId: {
    type: ObjectId,
    ref: 'user',
    required: true,
  },
  relatedContentId: {
    type: ObjectId,
    refPath: 'onModel',
    required: false,
  },
  onModel: {
    type: String,
    required: false,
    enum: ['post', 'guide', 'comment'] 
  },
  createdAt: {
    type: Date,
    default: Date.now,
  }
});

module.exports = mongoose.model('notification', notificationSchema);
