const express = require("express")
const authController = require("../controllers/auth.controllers.js")
const authMidlleware = require("../middlewares/auth.middleware.js")

const authRouter = express.Router();

// api/auth/register

authRouter.post("/register", authController.registerUserController)
authRouter.post("/login", authController.loginUserController)
authRouter.get("/logout",authController.logoutUserController)
authRouter.get("/get-me",authMidlleware.authUser, authController.getMeController)


module.exports = authRouter