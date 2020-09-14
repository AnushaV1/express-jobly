const express = require("express");
const userRouter = new express.Router();
const User = require("../models/user");
const { BCRYPT_WORK_FACTOR } = require("../config")
const jsonschema = require("jsonschema");
const updateUserSchema = require("../schemas/updateUserSchema")
const jwt = require("jsonwebtoken");
const { ensureLoggedIn, checkCorrectUser} = require("../middleware/auth");


userRouter.get("/",  async (req, res, next)=> {
    try {
        let users = await User.all();
        return res.json({users});

    } catch(e){
        return next(e)
    }
})

userRouter.get("/:username",  async (req, res, next)=> {
    try {
        let singleUser = await User.getSingleUser(req.params.username);
        return res.json({user: singleUser});

    } catch(e){
        return next(e)
    }
})


userRouter.patch("/:username", checkCorrectUser, async(req, res, next ) => {
    try {
        if ("username" in req.body) {
            return next({
                status: 400,
                message: "Not allowed"
            });
        }
        const result = jsonschema.validate(req.body, updateUserSchema);
        if(!result.valid){
            let listOfErrors = result.errors.map(error => error.stack);
            let error = new ExpressError(listOfErrors,400);
            return next(error);
        }
        
        const user = await User.updateUser(req.params.username, req.body);
        return res.json(user);
    } catch(err){
        return next(err)
    }

})

userRouter.delete('/:username',ensureLoggedIn,checkCorrectUser,  async(req, res, next)=> {
    try {
        await User.delete(req.params.username);
        return res.json({ message: "User deleted" });
        
    } catch(err){
        return next(err)
    }
})

module.exports = userRouter;