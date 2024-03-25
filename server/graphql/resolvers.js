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
  }
};

module.exports = resolvers;