const { GraphQLUpload } = require('graphql-upload');

// complex data relationship handling
const typeResolvers = {
  Post: {
    author: async (post) => {
      return await User.findById(post.author).exec();
    },
    game: async (post) => {
      return await Game.findById(post.game).exec();
    },
    likes: async (post) => {
      return await User.find({ _id: { $in: post.likes } }).exec();
    },
  },
  Guide: {
    author: async (guide) => {
      return await User.findById(guide.author).exec();
    },
    game: async (guide) => {
      return await Game.findById(guide.game).exec();
    },
    likes: async (guide) => {
      return await User.find({ _id: { $in: guide.likes } }).exec();
    },
    dislikes: async (guide) => {
      return await User.find({ _id: { $in: guide.dislikes } }).exec();
    },
  },
  Upload: GraphQLUpload,
};

module.exports = typeResolvers