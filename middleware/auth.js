const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config");
const ExpressError = require("../helpers/expressError");

function authenticateJWT(req, res, next) {
  try {
    const token = req.body._token || req.query._token;
    const payload = jwt.verify(token, SECRET_KEY);
    req.user = payload; 
    return next();
  } catch (err) {
    return next();
  }
}

function ensureLoggedIn(req, res, next) {
  if (!req.user) {
    const err = new ExpressError("Unauthorized, please login", 401);
    return next(err);
  } else {
    return next();
  }
}

function checkCorrectUser(req, res, next) {
    if (req.user.username !== req.params.username) {
      const err = new ExpressError("Unauthorized user", 401);
      return next(err);
    }
  else {
    return next();
  }
} 

function ensureAdmin(req, res, next) {
  const token = req.body._token || req.query._token;
  const payload = jwt.verify(token, SECRET_KEY)
  req.user = payload;
  if (!req.user || !req.user.is_admin) {

    const err = new ExpressError("Unauthorized, admin privileges required", 401);
    return next(err);
  } else {
    return next();
  }
}


module.exports = {
  authenticateJWT,
  ensureLoggedIn,
  checkCorrectUser,
  ensureAdmin
}