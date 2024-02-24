const mongoose = require('mongoose');
const { Schema } = mongoose;

const connectionsSchema = new Schema({
  steamId: {
    type: String,
    trim: true,
    default: '',
  },
  playstationId: {
    type: String,
    trim: true,
    default: '',
  },
  riotId: {
    type: String,
    trim: true,
    default: '',
  },
  xboxId: {
    type: String,
    trim: true,
    default: '',
  },
  battlenetId: {
    type: String,
    trim: true,
    default: '',
  },
  epicGamesId: {
    type: String,
    trim: true,
    default: '',
  },
}, { timestamps: true });

module.exports = mongoose.model('connections', connectionsSchema);
