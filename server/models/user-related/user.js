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
  showcases: {
    type: ObjectId,
    ref: "showcase",
  },
  following: [{
    type: ObjectId,
    ref: "User",
  }],
  followers: [{
    type: ObjectId,
    ref: "User",
  }],
  blockedUsers: [{
    type: ObjectId,
    ref: "User",
  }],
});

// setup virtual associations
userSchema.virtual('friendCount').get(function() {
  return this.friends.length;
});

userSchema.virtual('blockedCount').get(function() {
  return this.blocked.length;
});

userSchema.virtual('postCount').get(function() {
  return this.posts.length;
});

userSchema.virtual('guideCount').get(function() {
  return this.guides.length;
});

// method 2 follow 
userSchema.methods.follow = async function (userIdToFollow) {
  if (!this.following.includes(userIdToFollow)) {
    this.following.push(userIdToFollow);
    await this.save();

    const userToFollow = await this.model('User').findById(userIdToFollow);
    if (!userToFollow.followers.includes(this._id)) {
      userToFollow.followers.push(this._id);
      await userToFollow.save();
    }

    return true;
  }
  return false; 
};

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
