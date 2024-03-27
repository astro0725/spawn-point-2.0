const { GraphQLUpload } = require('graphql-upload');
const db = require('../models');

// complex data relationship handling
const typeResolvers = {
  User: {
    posts: async (user) => {
      return await PostModel.find({ _id: { $in: user.posts } });
    },
    // resolve guides authored by the user
    guides: async (user) => {
      return await GuideModel.find({ _id: { $in: user.guides } });
    },
    // resolve users that the current user is following
    following: async (user) => {
      return await UserModel.find({ _id: { $in: user.following } });
    },
    // resolve users that are following the current user
    followers: async (user) => {
      return await UserModel.find({ _id: { $in: user.followers } });
    },
    // resolve users that have been blocked by the current user
    blockedUsers: async (user) => {
      return await UserModel.find({ _id: { $in: user.blockedUsers } });
    },
    // resolve users that are friends with the current user
    friends: async (user) => {
      return await UserModel.find({ _id: { $in: user.friends } });
    },
    // showcases: async (user, args, context) => {
    //   return await ShowcaseModel.find({ userId: user._id });
    // },
  },
  Post: {
    // resolve author of post by id
    author: async (post) => {
      return await db.User.findById(post.author).exec();
    },
    // resolve game of post by id
    game: async (post) => {
      return await db.Game.findById(post.game).exec();
    },
    // resolve likes of post by id
    likes: async (post) => {
      return await db.User.find({ _id: { $in: post.likes } }).exec();
    },
  },
  Guide: {
    // resolve author of guide by id
    author: async (guide) => {
      return await db.User.findById(guide.author).exec();
    },
    // resolve game of guide by id
    game: async (guide) => {
      return await db.Game.findById(guide.game).exec();
    },
    // resolve likes of guide by id
    likes: async (guide) => {
      return await db.User.find({ _id: { $in: guide.likes } }).exec();
    },
    // resolve dislikes of guide by id
    dislikes: async (guide) => {
      return await db.User.find({ _id: { $in: guide.dislikes } }).exec();
    },
  },
  Upload: GraphQLUpload,
};

module.exports = typeResolvers;
