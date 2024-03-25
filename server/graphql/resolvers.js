const db = require('../models');
const { signToken } = require('../utils/auth');
const bcrypt = require('bcrypt');
const saltRounds = 10;

const resolvers = {
  Query: {
    // find by id
    user: async (_, args) => {
      return await db.User.findById(args.id);
    },
    // find all users
    allUsers: async () => {
      return await db.User.find({});
    },
  },

  Mutation: {
    // create a new user
    addUser: async (_, { username, email, password }, context) => {
      // check if username or email already exists
      const existingUser = await db.User.findOne({ $or: [{ username }, { email }] });
      if (existingUser) {
        throw new Error('Username or email already exists.');
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
  }
};

module.exports = resolvers;