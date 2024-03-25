const mongoose = require('mongoose');
const { Schema } = mongoose;
const { ObjectId } = mongoose.Types;

const showcaseSchema = new Schema({
  userId: {
    type: ObjectId,
    ref: 'user',
    required: true,
  },
  games: [{
    type: ObjectId,
    ref: 'games', 
  }],
  socials: [{
    type: ObjectId,
    ref: 'socials', 
  }],
  connections: [{
    type: ObjectId,
    ref: 'connections',
  }],
  isVisible: {
    type: Boolean,
    default: true,
  },
}, { timestamps: true });

showcaseSchema.virtual('gameCount').get(function() {
  return this.games.length;
});

showcaseSchema.virtual('socialCount').get(function() {
  return this.socials.length;
});

showcaseSchema.virtual('connectionsCount').get(function() {
  return this.connections.length;
});

module.exports = mongoose.model('showcase', showcaseSchema);
