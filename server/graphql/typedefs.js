const { gql } = require("apollo-server-express");

const typeDefs = gql`
type Query {
  user(id: ID!): User
  users: [User!]!
}

type Mutation {
  createUser(username: String!, password: String!, email: String!): User
  followUser(userId: ID!, followUserId: ID!): User
  unfollowUser(userId: ID!, unfollowUserId: ID!): User
}

type User {
  id: ID!
  username: String!
  password: String!
  email: String!
  profileImage: String
  name: String
  bio: String
  posts: [Post!]!
  guides: [Guide!]!
  chatrooms: [Chatroom!]!
  profileHeader: String
  showcases: [Showcase!]!
  following: [User!]!
  followers: [User!]!
  blockedUsers: [User!]!
  friends: [User!]!
  postCount: Int!
  guideCount: Int!
  blockedCount: Int!
  followingCount: Int!
  followerCount: Int!
  friendCount: Int!
}
`;

module.exports = typeDefs;