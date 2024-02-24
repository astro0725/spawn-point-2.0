const mongoose = require('mongoose');
const { ObjectId } = mongoose.Types;

const { Schema } = mongoose;
const bcrypt = require("bcryptjs");


const userSchema = new Schema({
  username: {
    type: String,
    unique: true,
    required: true,
    trim: true, 
    minlength: 3,
  },
  password: {
    type: String,
    required: true,
    trim: true, 
    minlength: 5,
  },
  email: {
    type: String,
    required: true,
    trim: true, 
    unique: true,
  },
  profileImage: {
    type: String,
    trim: true,
  },
  name: {
    type: String,
    trim: true,
  },
  bio: {
    type: String,
    trim: true,
  },
  posts: [
    {
      type: ObjectId,
      ref: "post",
    },
  ],
  guides: [
    {
      type: ObjectId,
      ref: "guide",
    },
  ],
  chatrooms: [
    {
      type: ObjectId,
      ref: "chatroom",
    },
  ],
  profileHeader:{
    type: String,
  },
  friends: [
    {
      type: ObjectId,
      ref: "friend",
    },
  ],
  blocked: [
    {
      type: ObjectId,
      ref: "block",
    },
  ],
  showcase: {
    type: ObjectId,
    ref: "showcase",
  },
});

// set up pre-save middleware to create password
userSchema.pre('save', async function (next) {
  if (this.isNew || this.isModified('password')) {
    const saltRounds = 10;
    this.password = await bcrypt.hash(this.password, saltRounds);
  }
  next();
});

// compare the incoming password with the hashed password
userSchema.methods.isCorrectPassword = async function (password) {
  return bcrypt.compare(password, this.password);
};

module.exports = mongoose.model("user", userSchema);
