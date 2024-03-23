const mongoose = require('mongoose');
const {ObjectId} = mongoose.Schema.Types;
const { Schema } = mongoose;

const notificationSchema = new Schema({
  type: {
    type: String,
    enum: ['NEW_FOLLOWER', 'NEW_MESSAGE', 'CONTENT_LIKE', 'COMMENT_ON_POST'],
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  userId: {
    type: ObjectId,
    ref: 'User',
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
    enum: ['Post', 'Guide', 'Comment'] 
  },
  createdAt: {
    type: Date,
    default: Date.now,
  }
});

module.exports = mongoose.model('notification', notificationSchema);
