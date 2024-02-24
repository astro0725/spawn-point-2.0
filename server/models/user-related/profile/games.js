const mongoose = require('mongoose');
const { Schema } = mongoose;

const gamesSchema = new Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  splashArt: {
    type: String,
    required: true,
    trim: true,
  },
}, { timestamps: true });

module.exports = mongoose.model('games', gamesSchema);
