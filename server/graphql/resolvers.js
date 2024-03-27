const db = require('../models');
const { signToken } = require('../utils/auth');
const bcrypt = require('bcrypt');
const saltRounds = 10;

const resolvers = {
  Query: {
    // find user by id
    userById: async (_, { id }) => {
      try {
        const user = await db.User.findById(id);
        return user;
      } catch (err) {
        console.log('Error finding user by id:' + err);
      }
    },
    // get all users
    allUsers: async () => {
      try {
        const users = await db.User.find({});
        return users;
      } catch (error) {
        console.log('Error fetching all users:' + error);
      }
    },
    // get all users with pagination
    userSort: async (_, { filter }) => {
      try {
        const query = {};
        if (filter) {
          const { username, name } = filter;
          if (username) query.username = new RegExp(username, 'i');
          if (name) query.name = new RegExp(name, 'i');
        }
        const users = await db.User.find(query);
        skip((page - 1 ) * limit);
        return users;
      } catch (error) {
        console.log('Error filtering users by search:' + error);
      }
    },
    // find game by id
    gameById: async (_, { id }) => {
      try {
        const game = await db.Game.findById(id);
        return game;
      } catch (error) {
        console.log('Error finding game by id:' + error);
      }
    },
    // get all users
    allGames: async () => {
      try {
        const games = await db.Game.find({});
        return games;
      } catch (error) {
        console.log('Error fetching all games:' + error);
      }
    },
    // get all users with pagination
    gameSort: async (_, { page = 1, limit = 10, tag, keyword }) => {
      try {
        const query = {};
        if (tag) {
          query.tags = tag;
        }
        if (keyword) {
          query.name = new RegExp(keyword, 'i');
        }
        const games = await db.Game.find(query);
        skip((page - 1) * limit);
        return games;
      } catch (error) {
        console.log('Error filtering games by search:' + error);
      }
    },
  },

  Mutation: {
    // create a new user
    createUser: async (_, { username, email, password }) => {
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
      // hash the password
      const hashedPassword = await bcrypt.hash(password, saltRounds);
      // create a new user and save to the database
      const newUser = new db.User({
        username,
        email,
        password: hashedPassword,
      });
      await newUser.save();
      // generate a token for the new user
      const token = signToken(newUser);
      // return the token and the user in an object that matches the AuthPayload type
      return {
        token,
        user: newUser,
      };
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
    // add game to user creation
    addGame: async (_, { title, splashArt}) => {
      try {
        const newGame = new Game ({ title, splashArt });
        const savedGame = await newGame.save();
        return savedGame;
        } catch (error) {
        console.error('Error adding game:', error);
        throw error;
      }
    },
    // update game in user creation
    updateGame: async (_, { id, title, splashArt }) => {
      try {
        const updatedGame = await Game.findByIdAndUpdate(id, { title, splashArt }, { new: true });
        return updatedGame;
      } catch (error) {
        console.error('Error updating game:', error);
        throw error;
      }
    },
    // delete game from user creation
    deleteGame: async (_, { id }) => {
      try {
        const deletedGame = await Game.findByIdAndDelete(id);
        return deletedGame;
      } catch (error) {
        console.error('Error deleting game:', error);
        throw error;
      }
    },
  }
};

module.exports = resolvers;