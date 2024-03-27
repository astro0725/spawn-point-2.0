const  fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const unlinkAsync = promisify(fs.unlink);
const bcrypt = require('bcrypt');
const saltRounds = 10;
const db = require('../models');
const { signToken } = require('../utils/auth');
const typeResolvers = require('./typeresolvers'); 

const resolvers = {
  Query: {
    // get user by id
    userById: async (_, { id }) => {
      try {
        // use mongoose model to find user by id
        const user = await db.User.findById(id);
        return user;
      } catch (error) {
        // log error if there is a problem finding the user
        console.log('error finding user by id:' + error);
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
    // get game by id
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
    gameSort: async (_, { page = 1, limit = 10, tags, keyword }) => {
      try {
        // initial empty query object
        const query = {};
        // if tags is provided, add to query
        if (tags) {
          query.tagss = tags;
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
    // get post by id
    postById: async (_, { id }) => {
      try {
        // use mongoose model to find post by id
        const post = await db.Post.findById(id);
        return post;
      } catch (error) {
        // log error if there is a problem finding the post
        console.log('error finding post by id:' + error);
      }
    },
    // get all posts
    allPosts: async () => {
      try {
        // use mongoose model to find all posts
        const posts = await db.Post.find({});
        return posts;
      } catch (error) {
        // log error if there is a problem fetching all posts
        console.log('error fetching all posts:' + error);
      }
    },
    // get all posts with pagination
    postSort: async (_, { page = 1, limit = 10, tags, keyword, game }) => {
      try {
        // initial empty query object
        const query = {};
        // if tags is provided, add to query
        if (tags) {
          query.tags = tags;
        }
        // if keyword is provided, create a regex query for name
        if (keyword) {
          query.name = new RegExp(keyword, 'i');
        }
        // if game is provided, create a regex query for name
        if (game) {
          query.game = new RegExp(game, 'i');
        }
        // use mongoose model to find posts based on query
        const posts = await db.Post.find(query);
        return posts;
      } catch (error) {
        // log error if there is a problem filtering posts
        console.log('error filtering posts by search:' + error);
      }
    },
    // get guide by id
    guideById: async (_, { id }) => {
      try {
        // use mongoose model to find guide by id
        const guide = await db.Guide.findById(id);
        return guide;
      } catch (error) {
        // log error if there is a problem finding the guide
        console.log('error finding guide by id:' + error);
      }
    },
    // get all guides
    allGuides: async () => {
      try {
        // use mongoose model to find all guides
        const guides = await db.Guide.find({});
        return guides;
      } catch (error) {
        // log error if there is a problem fetching all guides
        console.log('error fetching all guides:' + error);
      }
    },
    // get all guides with pagination
    guideSort: async (_, { page = 1, limit = 10, tags, keyword, game }) => {
      try {
        // initial empty query object
        const query = {};
        // if tags is provided, add to query
        if (tags) {
          query.tags = tags;
        }
        // if keyword is provided, create a regex query for name
        if (keyword) {
          query.name = new RegExp(keyword, 'i');
        }
        // if game is provided, create a regex query for name
        if (game) {
          query.game = new RegExp(game, 'i');
        }
        // use mongoose model to find guides based on query
        const guides = await db.Guide.find(query);
        return guides;
      } catch (error) {
        // log error if there is a problem filtering guides
        console.log('error filtering guides by search:' + error);
      }
    },
  },

  Mutation: {
    // create a new user
    createUser: async (_, { username, email, password }) => {
      try {
        // check if the username already exists
        const existingUsername = await db.User.findOne({ username });
        if (existingUsername) {
          throw new Error('Username already exists.');
        }
        // check if the email already exists
        const existingEmail = await db.User.findOne({ email });
        if (existingEmail) {
          throw new Error('Email already exists.');
        }
        // hash the password
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        // create a new user
        const newUser = new db.User({
          username,
          email,
          password: hashedPassword,
        });
        await newUser.save();
        // generate a token for the new user
        const token = signToken(newUser);
        return {
          token,
          user: newUser,
        };
      } catch (error) {
        console.error(`Creating user failed: ${error}`);
        throw new Error(`Creating user failed: ${error.message}`);
      }
    },
    // change a user's email
    changeEmail: async (_, { userId, newEmail }, context) => {
      try {
        // ensure the request is from an authenticated user
        if (!context.user || context.user._id !== userId) {
          throw new Error('Unauthorized');
        }
        // check if the new email is already in use
        const emailExists = await db.User.findOne({ email: newEmail });
        if (emailExists) {
          return { success: false, message: 'Email already in use' };
        }
        // update the user's email
        const user = await db.User.findById(userId);
        user.email = newEmail;
        await user.save();
        return { success: true, message: 'Email successfully changed' };
      } catch (error) {
        console.error(`Changing email failed: ${error}`);
        throw new Error(`Changing email failed: ${error.message}`);
      }
    },
    // change a user's username
    changeUsername: async (_, { userId, newUsername }, context) => {
      try {
        // ensure the request is from an authenticated user
        if (!context.user || context.user._id !== userId) {
          throw new Error('Unauthorized');
        }
        // check if the new username is already in use
        const usernameExists = await db.User.findOne({ username: newUsername });
        if (usernameExists) {
          return { success: false, message: 'Username already in use' };
        }
        // update the user's username
        const user = await db.User.findById(userId);
        user.username = newUsername;
        await user.save();
        return { success: true, message: 'Username successfully changed' };
      } catch (error) {
        console.error(`Changing username failed: ${error}`);
        throw new Error(`Changing username failed: ${error.message}`);
      }
    },
    // change a user's password
    changePassword: async (_, { userId, oldPassword, newPassword }, context) => {
      try {
        // ensure the request is from an authenticated user
        if (!context.user || context.user._id !== userId) {
          return { success: false, message: 'Unauthorized' };
        }
        // verify the old password is correct
        const user = await db.User.findById(userId);
        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) {
          return { success: false, message: 'Old password is incorrect' };
        }
        // hash the new password and update it
        const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
        user.password = hashedPassword;
        await user.save();
        return { success: true, message: 'Password successfully changed' };
      } catch (error) {
        console.error(`Changing password failed: ${error}`);
        throw new Error(`Changing password failed: ${error.message}`);
      }
    },
    // delete a user
    deleteUser: async (_, { userId }, context) => {
      try {
        // ensure the request is from an authenticated user
        if (!context.user || context.user._id !== userId) {
          throw new Error('Unauthorized');
        }
        // delete the user
        await db.User.findByIdAndDelete(userId);
        return { success: true, message: 'User successfully deleted' };
      } catch (err) {
        console.error(`Deleting user failed: ${error}`);
        throw new Error(`Deleting user failed: ${error.message}`);
      }
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
      console.error(`Error creating notification: ${error}`);
      throw error;
      }
    },
    // add game to user creation
    addGame: async (_, { title, splashArt }) => {
      try {
        // create a new game instance
        const newGame = new db.Game({ title, splashArt });
        // save the new game to the database
        const savedGame = await newGame.save();
        // return the saved game object
        return savedGame;
      } catch (error) {
        // log and throw any errors encountered during the game creation process
        console.error(`Error adding game: ${error}`);
        throw error;
      }
    },
    // update a game in user creation
    updateGame: async (_, { id, title, splashArt }) => {
      try {
        // find a game by its id and update its title and splash art
        // the { new: true } option returns the updated document
        const updatedGame = await db.Game.findByIdAndUpdate(id, { title, splashArt }, { new: true });
        // return the updated game object
        return updatedGame;
      } catch (error) {
        // log and throw any errors encountered during the game update process
        console.error(`Error updating game: ${error}`);
        throw error;
      }
    },
    // delete a game from user creation
    deleteGame: async (_, { id }) => {
      try {
        // find a game by its id and delete it
        const deletedGame = await db.Game.findByIdAndDelete(id);
        // return the deleted game object
        return deletedGame;
      } catch (error) {
        // log and throw any errors encountered during the game deletion process
        console.error(`Error deleting game: ${error}`);
        throw error;
      }
    },
    // create a new post
    createPost: async (_, { content, image, authorId, tags, game }) => {
      try {
        // check if the author exists / is a authenticated user
        const authorExists = await db.User.findById(authorId);
        if (!authorExists) {
          throw new Error('Author not found');
        }
        // check if the game exists
        let gameDocument = null;
        if (game) {
          // find a game by its id
          gameDocument = await db.Game.findById(game);
          if (!gameDocument) {
            throw new Error('Game not found');
          }
        }
        // initialize the imageUrl variable to store url of the uploaded image
        let imageUrl;
        // check if an image was provided/uploaded
        if (image) {
          // await the file upload promise to resolve, extracting the createReadStream method and filename
          const { createReadStream, filename } = await image;
          // call createReadStream to get a readable stream for the uploaded file
          const stream = createReadStream();
          // construct a path for saving the file, combining the directory path with the filename
          const pathName = path.join(__dirname, `/uploads/${filename}`);
          // use a promise to handle the asynchronous operation of writing the file to disk
          await new Promise((resolve, reject) => {
            // create a write stream pointing to the file path where the uploaded file should be saved
            const writeStream = fs.createWriteStream(pathName);
            // pipe the readable stream (uploaded file's content) to the write stream (disk location)
            stream.pipe(writeStream);
            // when the write stream finishes writing, resolve the promise
            writeStream.on("finish", resolve);
            // if the write stream encounters an error, reject the promise
            writeStream.on("error", reject);
          }).catch(async (error) => {
            // if writing the file fails, log the error
            console.error(`Failed to write file to disk: ${error}`);
            // attempt to delete the file to clean up any partially written files
            await unlinkAsync(pathName).catch(console.error); 
            // rethrow the error to handle it in the outer try-catch block
            throw new Error(`Failed to process upload: ${error.message}`);
          });
          // if the write stream was successful construct the url to access file
          // TODO: replace this url with actual url at some point
          imageUrl = `http://(insertmyserverurl?)/uploads/${filename}`; 
        }
        // create a new post object
        const newPost = new db.Post({
          content,
          image: imageUrl ? [imageUrl] : [],
          author: authorId,
          tags,
          game: gameDocument ? gameDocument._id : undefined,
        });
        // save the new post to the database
        await newPost.save();
        return newPost;
      } catch (error) {
        // log and throw any errors encountered during the post creation process
        console.error(`Creating post failed: ${error}`);
        throw new Error(`Creating post failed: ${error.message}`);
      }
    },
    // edit an existing post by its postId
    editPost: async (_, { postId, content }) => {
      try {
        // find a post by its id and update its content
        const updatedPost = await db.Post.findByIdAndUpdate(
          postId,
          { content },
          { new: true } // return the updated document
        );
        // if the post was not found, throw an error
        if (!updatedPost) {
          throw new Error('post not found');
        }
        // return the updated post object
        return updatedPost;
      } catch (error) {
        // log and throw any errors encountered during the post update process
        console.error(`error editing post: ${error}`);
        throw new Error(`editing post failed: ${error.message}`);
      }
    },
    // like a post by adding userId to the post's likes
    likePost: async (_, { postId, userId }) => {
      try {
        // find a post by its id and add userId to the likes array
        const post = await db.Post.findById(postId);
        if (!post.likes.includes(userId)) {
          post.likes.push(userId);
          await post.save();
        }
        // return the updated post object
        return post;
      } catch (error) {
        // log and throw any errors encountered during the post update process
        console.error(`error liking post: ${error}`);
        throw new Error(`liking post failed: ${error.message}`);
      }
    },
    // remove a like from a post by userId
    removePostLike: async (_, { postId, userId }) => {
      try {
        // find post by id
        const post = await db.Post.findById(postId);
        // remove userId from the likes array
        post.likes = post.likes.filter(likeUserId => likeUserId.toString() !== userId);
        // save the updated likes array to db
        await post.save();
        // return the updated post object
        return post;
      } catch (error) {
        console.error(`error removing post like: ${error}`);
        throw new Error(`removing post like failed: ${error.message}`);
      }
    },
    deletePost: async (_, { postId }) => {
      try {
        // find a post by its id and delete it
        const deletedPost = await db.Post.findByIdAndDelete(postId);
        // if the post was not found, throw an error
        if (!deletedPost) {
          throw new Error('post not found');
        }
        // return the deleted post object
        return deletedPost; 
      } catch (error) {
        // log and throw any errors encountered during the post deletion process
        console.error(`error deleting post: ${error}`);
        throw new Error(`deleting post failed: ${error.message}`);
      }
    },
    createGuide: async (_, { content, images, authorId, tags, game }) => {
      try {
        // validate author
        const authorExists = await db.User.findById(authorId);
        if (!authorExists) throw new Error('Author not found');
        // validate game if provided
        let gameDocument = null;
        if (game) {
          gameDocument = await db.Game.findById(game);
          if (!gameDocument) throw new Error('Game not found');
        }
        // handle image upload
        let imageUrl = null;
        if (images) {
          const { createReadStream, filename } = await images;
          const stream = createReadStream();
          const pathName = path.join(__dirname, `/uploads/${filename}`);
          await new Promise((resolve, reject) => {
            const writeStream = fs.createWriteStream(pathName);
            stream.pipe(writeStream);
            writeStream.on('finish', resolve);
            writeStream.on('error', (error) => {
              fs.unlink(pathName, () => reject(error));
            });
          });
          imageUrl = `http://yourserver.com/uploads/${filename}`;
        }
        // Create and save the guide
        const newGuide = new db.Guide({
          content,
          images: imageUrl ? [imageUrl] : [],
          author: authorId,
          tags,
          game: gameDocument ? gameDocument._id : null,
        });
        await newGuide.save();
        return newGuide;
      } catch (error) {
        console.error(`Error creating guide: ${error}`);
        throw new Error(`Error creating guide: ${error.message}`);
      }
    },
    editGuide: async (_, { guideId, content, images }) => {
      try {
        // initialize variable for potential new image URL
        let imageUrl;
        // handle image upload if an image is provided
        if (images) {
          const { createReadStream, filename } = await images;
          const stream = createReadStream();
          const pathName = path.join(__dirname, `/uploads/${filename}`);
          // attempt to write the uploaded file to the server
          await new Promise((resolve, reject) => {
            const writeStream = fs.createWriteStream(pathName);
            stream.pipe(writeStream);
            writeStream.on('finish', resolve);
            writeStream.on('error', (error) => {
              // Attempt to remove the file if an error occurs during file write
              fs.unlink(pathName, () => reject(error));
            });
          });
          // construct the URL for the uploaded image
          imageUrl = `http://yourserver.com/uploads/${filename}`;
        }
        // if an image was uploaded, include it in the update, otherwise, skip updating the images field
        const update = images ? { content, images: imageUrl ? [imageUrl] : [] } : { content };
        // find the guide by its ID and apply the update
        const updatedGuide = await db.Guide.findByIdAndUpdate(guideId, update, { new: true });
        // if the guide was not found, throw an error
        if (!updatedGuide) {
          throw new Error('Guide not found');
        }
        // Return the updated guide object
        return updatedGuide;
      } catch (error) {
        // log and throw any errors encountered during the guide update process
        console.error(`Error editing guide: ${error}`);
        throw new Error(`Editing guide failed: ${error.message}`);
      }
    },
    // delete a guide by its guideId
    deleteGuide: async (_, { guideId }) => {
      try {
        // find a guide by its id and delete it
        const deletedGuide = await db.Guide.findByIdAndDelete(guideId);
        // if the guide was not found, throw an error
        if (!deletedGuide) {
          throw new Error('Guide not found');
        }
        // return the deleted guide object
        return deletedGuide;
      } catch (error) {
        // log and throw any errors encountered during the guide deletion process
        console.error(`Error deleting guide: ${error}`);
        throw new Error(`Deleting guide failed: ${error.message}`);
      }
    },
    // like a guide by adding userId to the guide's likes
    likeGuide: async (_, { guideId, userId }) => {
      try {
        // find a guide by its id and add userId to the likes array
        const guide = await db.Guide.findById(guideId);
        if (!guide.likes.includes(userId)) {
          guide.likes.push(userId);
          await guide.save();
        }
        // return the updated guide object
        return guide;
      } catch (error) {
        // log and throw any errors encountered during the guide update process
        console.error(`Error liking guide: ${error}`);
        throw new Error(`Liking guide failed: ${error.message}`);
      }
    },
    // remove a like from a guide by userId
    removeGuideLike: async (_, { guideId, userId }) => {
      try {
        // find guide by id
        const guide = await db.Guide.findById(guideId);
        // remove userId from the likes array
        guide.likes = guide.likes.filter(likeUserId => likeUserId.toString() !== userId);
        // save the updated likes array to db
        await guide.save();
        // return the updated guide object
        return guide;
      } catch (error) {
        console.error(`Error removing guide like: ${error}`);
        throw new Error(`Removing guide like failed: ${error.message}`);
      }
    },
    // dislike a guide by adding user to guide's dislikes
    dislikeGuide: async (_, { guideId, userId }) => {
      try {
        // find a guide by its id and add userId to the dislikes array
        const guide = await db.Guide.findById(guideId);
        if (!guide.dislikes.includes(userId)) {
          guide.dislikes.push(userId);
          await guide.save();
        }
        // return the updated guide object
        return guide;
      } catch (error) {
        // log and throw any errors encountered during the guide update process
        console.error(`Error disliking guide: ${error}`);
        throw new Error(`Disliking guide failed: ${error.message}`);
      }
    },
    // remove a dislike from a guide by userId
    removedGuideDislike: async (_, { guideId, userId }) => {
      try {
        // find guide by id
        const guide = await db.Guide.findById(guideId);
        // remove userId from the dislikes array
        guide.dislikes = guide.dislikes.filter(dislikeUserId => dislikeUserId.toString() !== userId);
        // save the updated dislikes array to db
        await guide.save();
        // return the updated guide object
        return guide;
      } catch (error) {
        console.error(`Error removing guide dislike: ${error}`);
        throw new Error(`Removing guide dislike failed: ${error.message}`);
      }
    },
    // add user to followers array
    followUser: async (_, { followerId, followeeId }) => {
      try {
        const follower = await db.User.findById(followerId);
        const followee = await db.User.findById(followeeId);
        if (!follower || !followee) {
          return { success: false, message: "User not found" };
        }
        
        const success = await follower.follow(followeeId);
        return {
          success,
          message: success ? "Followed successfully" : "Already following",
        };
      } catch (error) {
        console.error(`Error following user: ${error}`);
        throw new Error(`Error following user: ${error.message}`);
      }
    },
    // remove user from followers array
    unfollowUser: async (_, { followerId, followeeId }) => {
      try {
        const follower = await db.User.findById(followerId);
        const followee = await db.User.findById(followeeId);
        if (!follower ||!followee) {
          return { success: false, message: "User not found" };
        }
        
        const success = await follower.unfollow(followeeId);
        return {
          success,
          message: success ? "Unfollowed successfully" : "Not following",
        };
      } catch (error) {
        console.error(`Error unfollowing user: ${error}`);
        throw new Error(`Error unfollowing user: ${error.message}`);
      }
    },
    // add user to blockedUsers array
    blockUser: async (_, { userId, blockeeId }) => {
      try {
        const user = await db.User.findById(userId);
        const blockee = await db.User.findById(blockeeId);
        if (!user ||!blockee) {
          return { success: false, message: "User not found" };
        }
        
        const success = await user.block(blockeeId);
        return {
          success,
          message: success ? "Blocked successfully" : "Already blocked",
        };
      } catch (error) {
        console.error(`Error blocking user: ${error}`);
        throw new Error(`Error blocking user: ${error.message}`);
      }
    },
    // remove user from blockedUsers array
    unblockUser: async (_, { userId, blockeeId }) => {
      try {
        const user = await db.User.findById(userId);
        const blockee = await db.User.findById(blockeeId);
        if (!user ||!blockee) {
          return { success: false, message: "User not found" };
        }
        
        const success = await user.unblock(blockeeId);
        return {
          success,
          message: success ? "Unblocked successfully" : "Not blocked",
        };
      } catch (error) {
        console.error(`Error unblocking user: ${error}`);
        throw new Error(`Error unblocking user: ${error.message}`);
      }
    },
    // import type resolvers 
    ...typeResolvers,
  }
};

module.exports = resolvers;