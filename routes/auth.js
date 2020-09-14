const express = require("express");
const User = require("../models/user");
const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config");
const jsonschema = require("jsonschema");
const createUserSchema = require("../schemas/createUserSchema")
const ExpressError = require("../helpers/expressError");

const router = new express.Router();

router.post("/", async (req, res, next)=> {
  try {
      const data = jsonschema.validate(req.body, createUserSchema);
      if (!data.valid) {
          return next({ status: 400, error: data.errors.map((e) => e.stack) });
      }
      const newUser = await User.register(req.body);
      let token = jwt.sign({newUser}, SECRET_KEY);
      return res.status(201).json({"token":token});
  } 
  catch(e){
    if (e.code === '23505') {
      return next(new ExpressError("Username taken. Please pick another!", 400));
    }
      return next(e)
  }
})

router.post("/login", async function (req, res, next) {
  try {
      const { username, password } = req.body;
        if(!username || !password){
        throw new ExpressError("Username and password required", 400)
        }
      const user = await User.authenticate(username, password);

    if(user) {
      const token = jwt.sign(
          {
            username: user.username,
            is_admin: user.is_admin,
          },
          SECRET_KEY
      );
      return res.status(201).json({ token });
    }
    else {
        throw new ExpressError("Invalid username/password", 400);
    }

  } catch (e) {
    return next(e);
  }
});

module.exports = router;