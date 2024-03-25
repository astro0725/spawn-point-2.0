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
  }
};

module.exports = resolvers;