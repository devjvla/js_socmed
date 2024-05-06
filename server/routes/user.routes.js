import { Router } from "express";
import ValidationHelper from "../helpers/validation.helper.js";
import UsersController from "../controllers/users.controller.js";

const UserRouter = Router();

UserRouter.post("/signup", ValidationHelper.SignupForm, UsersController.signup);

export default UserRouter;