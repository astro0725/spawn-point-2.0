require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const { ApolloServer } = require('apollo-server-express');
const { PubSub } = require('graphql-subscriptions');
const { graphqlUploadExpress } = require('graphql-upload');
const { createServer } = require('http');
const { useServer } = require('graphql-ws/lib/use/ws');
const { WebSocketServer } = require('ws')
const { schema } = require('./graphql');
const { authMiddleware } = require('./utils/auth');;

// initialize express application
const app = express();
const port = process.env.PORT || 3000;

// apply middleware for cors and json parsing
const corsOptions = {
  origin: 'http://localhost:3001', 
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
  optionsSuccessStatus: 204
};

// apply cors middleware with options
app.use(cors(corsOptions));

// apply json parsing middleware
app.use(express.json());

// apply auth middleware globally
app.use(authMiddleware);

// apply graphqlUploadExpress middleware for file uploads
app.use(graphqlUploadExpress());

// connect to mongodb using Mongoose
mongoose.connect(process.env.DB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
      console.log("MongoDB successfully connected");
    })
    .catch(err => console.log(err));

// initialize apollo pubSub for subs
const pubsub = new PubSub();

// initialize apollo server with the schema and context
const apolloServer = new ApolloServer({ 
  schema,
  uploads: false,
  // set up the context for each operation
  context: ({ req, connection }) => {
    // check if the operation is a subscription
    if (connection) {
      // for subscriptions, use the connection context
      return { pubsub, user: connection.context.user };
    } else {
      // for queries and mutations, use the http request context
      return { req, pubsub, user: req.user };
    }
  },
  subscriptions: {
    // handle websocket connection for subscriptions
    onConnect: (connectionParams, webSocket, context) => {
      // extract token from the connection parameters
      const token = connectionParams.authToken;
      if (token) {
        // validate the token and get user information
        const user = validateToken(token); 
        if (user) {
          // if token is valid, return the user context
          return { user };
        }
      }
      // if no token or token is invalid, throw an error
      throw new Error('missing or invalid auth token!');
    },
  },
});

async function startServer() {
    // start apollo server
    await apolloServer.start();
    apolloServer.applyMiddleware({ app }); // apply apollo middleware to Express app

    // create an HTTP server to run alongside the websocket server
    const httpServer = createServer(app);

    // set up webSocket server for handling graphql subscriptions
    const wsServer = new WebSocketServer({
      server: httpServer,
      path: '/graphql',
    });

    // use graphql-ws library to attach the schema to the websocket server
    useServer({ schema }, wsServer);

    // start listening on the specified port
    httpServer.listen(port, () => {
      console.log(`WebSocket is running on ws://localhost:${port}/graphql`);
      console.log(`Server is running on port: ${port}`);
    });
}

// start the server
startServer();