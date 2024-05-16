import { Router } from "express";
import AuthHelper from "../helpers/auth.helper.js";
import PostController from "../controllers/posts.controller.js";

const PostRouter = Router();
const authHelper = new AuthHelper();

PostRouter.get("/", authHelper.checkUserToken, PostController.getPosts);

export default PostRouter;