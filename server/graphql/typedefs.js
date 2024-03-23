const { gql } = require("apollo-server-express");

const typeDefs = gql`
type Query {
  user(id: ID!): User
  users: [User!]!

  connectionsByUserId(userId: ID!): Connections

  getSocialsByUserId(userId: ID!): Socials
}

type Mutation {
  createUser(username: String!, password: String!, email: String!): User
  followUser(userId: ID!, followUserId: ID!): User
  unfollowUser(userId: ID!, unfollowUserId: ID!): User

  updateConnections(userId: ID!, steamId: String, playstationId: String, riotId: String, xboxId: String, battlenetId: String, epicGamesId: String): Connections

  updateSocials(userId: ID!, twitch: String, tiktok: String, facebook: String, instagram: String, twitter: String): Socials
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

type Connections {
  id: ID!
  steamId: String
  playstationId: String
  riotId: String
  xboxId: String
  battlenetId: String
  epicGamesId: String
  createdAt: String!
  updatedAt: String!
}

type Socials {
  id: ID!
  twitch: String
  tiktok: String
  facebook: String
  instagram: String
  twitter: String
  createdAt: String
  updatedAt: String
}
`;

module.exports = typeDefs;