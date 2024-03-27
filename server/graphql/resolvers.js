const db = require('../models');
const { signToken } = require('../utils/auth');
const bcrypt = require('bcrypt');
const saltRounds = 10;

const resolvers = {
  Query: {
    // find user by id
    userById: async (_, { id }) => {
      try {
        // use mongoose model to find user by id
        const user = await db.User.findById(id);
        return user;
      } catch (err) {
        // log error if there is a problem finding the user
        console.log('error finding user by id:' + err);
      }
    },
    // get all users
    allUsers: async () => {
      try {
        // use mongoose model to find all users
        const users = await db.User.find({});
        return users;
      } catch (error) {
        // log error if there is a problem fetching all users
        console.log('error fetching all users:' + error);
      }
    },
    // get all users with pagination
    userSort: async (_, { filter }) => {
      try {
        // initial empty query object
        const query = {};
        if (filter) {
          // if filter is provided, create regex queries for username and name
          const { username, name } = filter;
          if (username) query.username = new RegExp(username, 'i');
          if (name) query.name = new RegExp(name, 'i');
        }
        // use mongoose model to find users based on query
        const users = await db.User.find(query);
        return users;
      } catch (error) {
        // log error if there is a problem filtering users
        console.log('error filtering users by search:' + error);
      }
    },
    // find game by id
    gameById: async (_, { id }) => {
      try {
        // use mongoose model to find game by id
        const game = await db.Game.findById(id);
        return game;
      } catch (error) {
        // log error if there is a problem finding the game
        console.log('error finding game by id:' + error);
      }
    },
    // get all games
    allGames: async () => {
      try {
        // use mongoose model to find all games
        const games = await db.Game.find({});
        return games;
      } catch (error) {
        // log error if there is a problem fetching all games
        console.log('error fetching all games:' + error);
      }
    },
    // get all games with pagination
    gameSort: async (_, { page = 1, limit = 10, tag, keyword }) => {
      try {
        // initial empty query object
        const query = {};
        // if tag is provided, add to query
        if (tag) {
          query.tags = tag;
        }
        // if keyword is provided, create a regex query for name
        if (keyword) {
          query.name = new RegExp(keyword, 'i');
        }
        // use mongoose model to find games based on query
        const games = await db.Game.find(query);
        return games;
      } catch (error) {
        // log error if there is a problem filtering games
        console.log('error filtering games by search:' + error);
      }
    },
  },

  Mutation: {
    // create a new user
    createUser: async (_, { username, email, password }) => {
      // check if username already exists
      const existingUsername = await db.User.findOne({ username });
      if (existingUsername) {
        // throw error if username exists
        throw new Error('username already exists.');
      }
      // check if email already exists
      const existingEmail = await db.User.findOne({ email });
      if (existingEmail) {
        // throw error if email exists
        throw new Error('email already exists.');
      }
      // hash the password before saving to database
      const hashedPassword = await bcrypt.hash(password, saltRounds);
      // create new user with hashed password
      const newUser = new db.User({
        username,
        email,
        password: hashedPassword,
      });
      // save the new user
      await newUser.save();
      // generate a token for the new user
      const token = signToken(newUser);
      // return the token and the user
      return {
        token,
        user: newUser,
      };
    },
    // change email of authenticated user
    changeEmail: async (_, { userId, newEmail }, context) => {
      // ensure the request comes from an authenticated user
      if (!context.user || context.user._id !== userId) {
        throw new Error('unauthorized');
      }
      // check if the new email is already in use
      const emailExists = await db.User.findOne({ email: newEmail });
      if (emailExists) {
        return { success: false, message: 'email already in use' };
      }
      // find the user by id and update their email
      const user = await db.User.findById(userId);
      user.email = newEmail;
      await user.save();
      // confirm the email has been changed
      return { success: true, message: 'email successfully changed' };
    },
    // change the username of an authenticated user
    changeUsername: async (_, { userId, newUsername }, context) => {
      // ensure the request comes from an authenticated user
      if (!context.user || context.user._id !== userId) {
        throw new Error('unauthorized');
      }
      // check if the new username is already in use
      const usernameExists = await db.User.findOne({ username: newUsername });
      if (usernameExists) {
        return { success: false, message: 'username already in use' };
      }
      // find the user by id and update their username
      const user = await db.User.findById(userId);
      user.username = newUsername;
      await user.save();
      // confirm the username has been changed
      return { success: true, message: 'username successfully changed' };
    },
    // change the password of an authenticated user
    changePassword: async (_, { userId, oldPassword, newPassword }, context) => {
      // ensure the request comes from an authenticated user
      if (!context.user || context.user._id !== userId) {
        return { success: false, message: 'unauthorized' };
      }
      // verify the old password is correct
      const user = await db.User.findById(userId);
      const isMatch = await bcrypt.compare(oldPassword, user.password);
      if (!isMatch) {
        return { success: false, message: 'old password is incorrect' };
      }
      // hash the new password and update it in the database
      const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
      user.password = hashedPassword;
      await user.save();
      // confirm the password has been changed
      return { success: true, message: 'password successfully changed' };
    },
    // delete a user
    deleteUser: async (_, { userId }, context) => {
      // ensure the request comes from an authenticated user
      if (!context.user || context.user._id !== userId) {
        throw new Error('unauthorized');
      }
      // delete the user from the database
      await db.User.findByIdAndDelete(userId);
      // confirm the user has been deleted
      return { success: true, message: 'user successfully deleted' };
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
    addGame: async (_, { title, splashArt }) => {
      try {
        // create a new game instance
        const newGame = new Game({ title, splashArt });
        // save the new game to the database
        const savedGame = await newGame.save();
        // return the saved game object
        return savedGame;
      } catch (error) {
        // log and throw any errors encountered during the game creation process
        console.error('error adding game:', error);
        throw error;
      }
    },
    
    // update a game in user creation
    updateGame: async (_, { id, title, splashArt }) => {
      try {
        // find a game by its id and update its title and splash art
        // the { new: true } option returns the updated document
        const updatedGame = await Game.findByIdAndUpdate(id, { title, splashArt }, { new: true });
        // return the updated game object
        return updatedGame;
      } catch (error) {
        // log and throw any errors encountered during the game update process
        console.error('error updating game:', error);
        throw error;
      }
    },
    
    // delete a game from user creation
    deleteGame: async (_, { id }) => {
      try {
        // find a game by its id and delete it
        const deletedGame = await Game.findByIdAndDelete(id);
        // return the deleted game object
        return deletedGame;
      } catch (error) {
        // log and throw any errors encountered during the game deletion process
        console.error('error deleting game:', error);
        throw error;
      }
    },
  }
};

module.exports = resolvers;