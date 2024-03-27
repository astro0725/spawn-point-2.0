const mongoose = require('mongoose');
const { ObjectId } = mongoose.Types;

const { Schema } = mongoose;
const bcrypt = require('bcryptjs');

const userSchema = new Schema({
  username: {
    type: String,
    unique: true,
    required: true,
    trim: true, 
    minlength: 3,
    index: true,
  },
  password: {
    type: String,
    required: true,
    trim: true, 
    minlength: 8,
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
      ref: 'post',
    },
  ],
  guides: [
    {
      type: ObjectId,
      ref: 'guide',
    },
  ],
  profileHeader:{
    type: String,
  },
  showcases: [{
    type: ObjectId,
    ref: 'showcase',
  }],
  following: [{
    type: ObjectId,
    ref: 'user',
  }],
  followers: [{
    type: ObjectId,
    ref: 'user',
  }],
  blockedusers: [{
    type: ObjectId,
    ref: 'user',
  }],
  friends: [{
    type: ObjectId,
    ref: 'user',
  }],
});

// index user
userSchema.index({ 'following': 1 }); 
userSchema.index({ 'followers': 1 });
userSchema.index({ 'blockedUsers': 1 });

// setup virtual associations
userSchema.virtual('postCount').get(function() {
  return this.posts.length;
});

userSchema.virtual('guideCount').get(function() {
  return this.guides.length;
});

userSchema.virtual('blockedCount').get(function() {
  return this.blockedUsers.length;
});

userSchema.virtual('followingCount').get(function() {
  return this.following.length;
});

userSchema.virtual('followerCount').get(function() {
  return this.followers.length;
});

userSchema.virtual('friendCount').get(function() {
  return this.friends.length;
});

userSchema.virtual('showcase', {
  ref: 'showcase',
  localField: '_id',
  foreignField: 'userId',
  justOne: false
});

// method 2 follow 
userSchema.methods.follow = async function (followeeId) {
  try {
    if (!this.following.includes(followeeId)) {
      this.following.push(followeeId);
      await this.save();

      // Update the follower (this) by adding the followee's ID to their friends array
      const followee = await this.model('User').findById(followeeId);
      if (followee) {
        if (!this.friends.includes(followeeId)) {
          this.friends.push(followeeId);
          await this.save();
        }
      }
      // Update the followee (userToFollow) by adding the follower's ID to their followers array
      followee.followers.push(this._id);
      await followee.save();

      return true;
    }
    return false;
  } catch (error) {
    console.error('Error following user:', error);
    throw error;
  }
};

// method 2 unfollow
userSchema.methods.unfollow = async function (followeeId) {
  try {
    if (this.following.includes(followeeId)) {
      this.following = this.following.filter(id => !id.equals(followeeId));

      const followee = await this.model('User').findById(followeeId);
      if (followee) {
        followee.followers = followee.followers.filter(id => !id.equals(this._id));
        await followee.save();
      }

      if (this.friends.includes(followeeId)) {
        this.friends = this.friends.filter(id => !id.equals(followeeId));
        await this.save();

        if (followee.friends.includes(this._id)) {
          followee.friends = followee.friends.filter(id => !id.equals(this._id));
          await followee.save();
        }
      }

      return true; 
    }
    return false;

  } catch (error) {
    console.error('Error unfollowing user:', error);
    throw error; 
  }
};

// method 2 block
userSchema.methods.blockUser = async function (blockeeId) {
  try {
    if (!this.blockedUsers.includes(blockeeId)) {
      this.blockedUsers.push(blockeeId);
      this.following = this.following.filter(id => !id.equals(blockeeId));
      this.followers = this.followers.filter(id => !id.equals(blockeeId));

      await this.save();

      const blockee = await this.model('User').findById(blockeeId);
      if (blockee) {
        blockee.followers = blockee.followers.filter(id => !id.equals(this._id));
        await blockee.save();
      }

      return true; 
    }
    return false; 

  } catch (error) {
    console.error('Error blocking user:', error);
    throw error; 
  }
};


// method 2 unblock
userSchema.methods.unblockUser = async function (blockeeId) {
  try {
    if (this.blockedUsers.includes(blockeeId)) {
      this.blockedUsers = this.blockedUsers.filter(id => !id.equals(blockeeId));

      await this.save();

      return true; 
    }
    return false; 

  } catch (error) {
    console.error('Error unblocking user:', error);
    throw error; 
  }
};

// method 2 check mutual following:
userSchema.methods.isFriend = function (otherUserId) {
  return this.friends.some(friendId => friendId.equals(otherUserId));
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

module.exports = mongoose.model('user', userSchema);
