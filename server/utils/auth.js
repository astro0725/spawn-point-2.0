require('dotenv').config();
const jwt = require('jsonwebtoken');

const secret = process.env.JWT_SECRET;
const expiration = '1h'; 

const signToken = function({ email, username, _id }) {
  const payload = {
    email,
    username,
    _id,
  };
  // sign the token with the payload
  return jwt.sign({ data: payload }, secret, { expiresIn: expiration });
};
const authMiddleware = function({ req, res, next }) {
  let token = req.body.token || req.query.token || req.headers.authorization;
  // check for the presence of a token
  if (!token) {
    return next();
  }
  // extract the token from the authorization header if present
  if (req.headers.authorization) {
    token = token.split(' ').pop().trim();
  }
  try {
    // decode the token
    const decoded = jwt.verify(token, secret);
    req.user = decoded.data; // assign the decoded data to req.user
    // proceed with the next middleware
    next();
  } catch (err) {
    console.error(`Invalid token, error: ${err}`);
    res.status(401).send('Invalid token');
  }
};

module.exports = {
  authMiddleware,
  signToken
}