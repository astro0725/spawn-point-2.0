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
userSchema.methods.follow = async function (userIdToFollow) {
  try {
    if (!this.following.includes(userIdToFollow)) {
      this.following.push(userIdToFollow);
      await this.save();

      const userToFollow = await this.model('User').findById(userIdToFollow);
      if (userToFollow.followers.includes(this._id)) {
        if (!this.friends.includes(userIdToFollow)) {
          this.friends.push(userIdToFollow);
          await this.save();
        }
        if (!userToFollow.friends.includes(this._id)) {
          userToFollow.friends.push(this._id);
          await userToFollow.save();
        }
      } else if (!userToFollow.followers.includes(this._id)) {
        userToFollow.followers.push(this._id);
        await userToFollow.save();
      }

      return true;
    }
    return false; 
  } catch (error) {
    console.error('Error following user:', error);
    throw error; 
  }
};

// method 2 unfollow
userSchema.methods.unfollow = async function (userIdToUnfollow) {
  try {
    if (this.following.includes(userIdToUnfollow)) {
      this.following = this.following.filter(followingId => !followingId.equals(userIdToUnfollow));

      const userToUnfollow = await this.model('User').findById(userIdToUnfollow);
      if (userToUnfollow) {
        userToUnfollow.followers = userToUnfollow.followers.filter(followerId => !followerId.equals(this._id));
        await userToUnfollow.save();
      }

      if (this.friends.includes(userIdToUnfollow)) {
        this.friends = this.friends.filter(friendId => !friendId.equals(userIdToUnfollow));
        await this.save();

        if (userToUnfollow.friends.includes(this._id)) {
          userToUnfollow.friends = userToUnfollow.friends.filter(friendId => !friendId.equals(this._id));
          await userToUnfollow.save();
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
userSchema.methods.blockUser = async function (userIdToBlock) {
  try {
    if (!this.blockedUsers.includes(userIdToBlock)) {
      this.blockedUsers.push(userIdToBlock);
      this.following = this.following.filter(followingId => !followingId.equals(userIdToBlock));
      this.followers = this.followers.filter(followerId => !followerId.equals(userIdToBlock));

      await this.save();

      const userToBlock = await this.model('User').findById(userIdToBlock);
      if (userToBlock) {
        userToBlock.followers = userToBlock.followers.filter(followerId => !followerId.equals(this._id));
        await userToBlock.save();
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
userSchema.methods.unblockUser = async function (userIdToUnblock) {
  try {
    if (this.blockedUsers.includes(userIdToUnblock)) {
      this.blockedUsers = this.blockedUsers.filter(blockedId => !blockedId.equals(userIdToUnblock));

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
