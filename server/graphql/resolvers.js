const db = require('../models');
const { signToken } = require('../utils/auth');
const bcrypt = require('bcrypt');
const saltRounds = 10;

const resolvers = {
  Query: {
    // find by id
    userById: async (_, { id }) => {
      return await db.User.findById(id);
    },
    // get all users
    allUsers: async () => {
      return await db.User.find({});
    },
  },

  Mutation: {
    // create a new user
    addUser: async (_, { username, email, password }, context) => {
      // check if username already exists in the database
      const existingUsername = await db.User.findOne({ username });
        if (existingUsername) {
          throw new Error('Username already exists.');
        }
        // check if the email already exists in the database
        const existingEmail = await db.User.findOne({ email });
        if (existingEmail) {
          throw new Error('Email already exists.');
        }
      // variable for hashing password
      const hashedPassword = await bcrypt.hash(password, saltRounds);
      // new user saved to database & hashes password
      const newUser = new db.User({
        username,
        email,
        password: hashedPassword
      });
      // save user to database
      await newUser.save();
      const token = signToken(newUser);
      return { token, user: newUser };
    },
    // change email of authenticated user
    changeEmail: async (_, { userId, newEmail }, context) => {
      // checks if the data to be changed belongs to the logged in user
      if (!context.user || context.user._id !== userId) {
        throw new Error('Unauthorized');
      }
      const emailExists = await db.User.findOne({ email: newEmail });
      if (emailExists) {
        return { success: false, message: 'Email already in use' };
      }
      const user = await db.User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }
      user.email = newEmail;
      await user.save();
      return { success: true, message: 'Email successfully changed' };
    },
    // change username of authenticated user
    changeUsername: async (_, { userId, newUsername }, context) => {
      // checks if the data to be changed belongs to the logged in user
      if (!context.user || context.user._id !== userId) {
        throw new Error('Unauthorized');
      }
      const usernameExists = await db.User.findOne({ username: newUsername });
      if (usernameExists) {
        return { success: false, message: 'Username already in use' };
      }
      const user = await db.User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }
      user.username = newUsername;
      await user.save();
      return { success: true, message: 'Username successfully changed' };
    },
    // change password of authenticated user 
    changePassword: async (_, { userId, oldPassword, newPassword }, context) => {
      // checks if the data to be changed belongs to the logged in user
      if (!context.user || context.user._id !== userId) {
        return { success: false, message: 'Unauthorized' };
      }
      const user = await db.User.findById(userId);
      if (!user) {
        return { success: false, message: 'User not found' };
      }
      const isMatch = await bcrypt.compare(oldPassword, user.password);
      if (!isMatch) {
        return { success: false, message: 'Old password is incorrect' };
      }
      const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
      user.password = hashedPassword;
      await user.save();
      return { success: true, message: 'Password successfully changed' };
    },
    // delete user
    deleteUser: async (_, { userId }, context) => {
      // checks if the data to be changed belongs to the logged in user
      if (!context.user || context.user._id !== userId) {
        throw new Error('Unauthorized');
      }
      const user = await db.User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }
      await db.User.findByIdAndDelete(userId);
      return { success: true, message: 'User successfully deleted' };
    },
    // create a new notification
    createNotification: async (_, { type, message, userId, relatedContentId, onModel }) => {
      try {
      // create a new notification object
      const newNotification = new Notification({
        type,
        message,
        userId,
        relatedContentId,
        onModel
      });
      // save the new notification to the database
      await newNotification.save();
      // return the newly created notification
      return newNotification;
      } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
      }
    },
  }
};

module.exports = resolvers;