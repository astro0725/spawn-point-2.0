require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const { ApolloServer } = require('apollo-server-express');
const { PubSub } = require('graphql-subscriptions');
const { typeDefs, resolvers } = require('./graphql/index');
const { createServer } = require('http');
const { useServer } = require('graphql-ws/lib/use/ws');
const { WebSocketServer } = require('ws');
const { makeExecutableSchema } = require('@graphql-tools/schema');

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

app.use(cors(corsOptions));
app.use(express.json());

// connect to mongodb using Mongoose
mongoose.connect(process.env.DB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
      console.log("MongoDB successfully connected");
    })
    .catch(err => console.log(err));

// initialize apollo pubSub for subs
const pubsub = new PubSub();

// create an executable GraphQL schema
const schema = makeExecutableSchema({ typeDefs, resolvers });

// initialize apollo server with the schema and context
const apolloServer = new ApolloServer({ 
  schema, 
  context: ({ req }) => ({ req, pubsub })
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