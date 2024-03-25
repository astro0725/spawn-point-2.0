const mongoose = require('mongoose');
const { Schema } = mongoose;

const socialsSchema = new Schema({
  twitch: {
    type: String,
    trim: true,
    default: '',
  },
  tiktok: {
    type: String,
    trim: true,
    default: '',
  },
  facebook: {
    type: String,
    trim: true,
    default: '',
  },
  instagram: {
    type: String,
    trim: true,
    default: '',
  },
  twitter: {
    type: String,
    trim: true,
    default: '',
  },
}, { timestamps: true });

module.exports = mongoose.model('socials', socialsSchema);
