require('dotenv').config();
const jwt = require('jsonwebtoken');

const secret = process.env.JWT_SECRET;
const expiration = '1h';
const authMiddleware = function({ req, res, next }) {
  let token = req.body.token || req.query.token || req.headers.authorization;

  if (!token) {
    return next(); 
  }

  if (req.headers.authorization) {
    token = token.split(' ').pop().trim();
  }

  try {
    const decoded = jwt.verify(token, secret); 
    req.user = decoded.data; 
    next();
  } catch (err) {
    console.log(`Invalid token, error: ${err}`);
    res.status(401).send('Invalid token'); 
  }
};

const signToken = function({ email, name, _id }) {
  return jwt.sign(
    { data: { email, name, _id }}, 
    secret, 
    { expiresIn: expiration }
    );
}

module.exports = {
  authMiddleware,
  signToken
}